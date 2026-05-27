import { OPS_PIPELINE_STAGES } from '../data';
import type {
  OpsAudienceClusterVM,
  OpsAudienceIntentVM,
  OpsAudienceMapVM,
  OpsAudienceSegmentVM,
  OpsBrandPositionPanelVM,
  OpsBrandPositionVM,
  OpsCompetitorEmptyStateVM,
  OpsCompetitorsVM,
  OpsCompetitorVM,
  OpsExecutiveSummaryVM,
  OpsMissionEventVM,
  OpsNarrativeVM,
  OpsNarrativesVM,
  OpsParallelTaskVM,
  OpsPipelineStageVM,
  OpsProviderHealthVM,
  OpsProviderStatusVM,
  OpsRunStatus,
  OpsRuntimeVM,
  OpsSocialSignalVM,
  OpsSocialSignalsVM,
  OpsSourceRunVM,
  OpsTerminalHeaderVM,
  OpsTerminalViewModel,
  OpsWebEvidenceVM,
  OpsWebIntelligenceVM,
  OpsXIntelligenceVM,
  RunnerAudienceCluster,
  RunnerCompetitor,
  RunnerEvent,
  RunnerExtractedNarrative,
  RunnerIntentDistribution,
  RunnerNarrative,
  RunnerOpsResponse,
  RunnerParallelTask,
  RunnerProviderDiagnostic,
  RunnerScrapedComment,
  RunnerSession,
  RunnerSentiment,
  RunnerSourceRun,
  RunnerStrategicIntelligence,
} from '../types';

const X_KEYWORDS = ['x', 'grok', 'twitter'];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function deriveOpsRunStatus(session: RunnerSession): OpsRunStatus {
  if (session.status === 'completed') return 'completed';
  if (session.status === 'failed') return 'failed';
  if (session.status === 'idle' || session.status === 'initializing') return 'idle';
  return 'running';
}

function deriveActiveStageIndex(session: RunnerSession): number {
  const totalStages = OPS_PIPELINE_STAGES.length;
  if (session.status === 'completed') return totalStages - 1;
  if (session.status === 'idle' || session.status === 'initializing') return -1;
  const ratio = clamp(session.progress, 0, 100) / 100;
  return clamp(Math.floor(ratio * totalStages), 0, totalStages - 1);
}

function readinessLabel(score: number): string {
  if (score >= 90) return 'Briefing Ready';
  if (score >= 70) return 'Near Ready';
  if (score >= 40) return 'Building';
  return 'Standby';
}

function currentStageLabel(status: OpsRunStatus, activeIndex: number): string {
  if (status === 'idle') return 'Awaiting mission launch';
  if (status === 'completed') return 'Brand position package ready';
  if (status === 'failed') return 'Mission failed';
  if (activeIndex < 0) return 'Initializing stage dispatch';
  return OPS_PIPELINE_STAGES[activeIndex]?.label ?? 'Dispatching pipeline';
}

function formatDurationMs(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function buildRuntime(response: RunnerOpsResponse, status: OpsRunStatus): OpsRuntimeVM {
  const runtime = response.runtime ?? {};
  const startedAt = runtime.startedAt;
  const completedAt = runtime.completedAt;
  const elapsedMs = (() => {
    if (typeof runtime.durationMs === 'number') return Math.max(0, runtime.durationMs);
    if (startedAt && completedAt) {
      return Math.max(0, new Date(completedAt).getTime() - new Date(startedAt).getTime());
    }
    if (startedAt) return Math.max(0, Date.now() - new Date(startedAt).getTime());
    return 0;
  })();
  const display = status === 'idle' ? '00:00' : formatDurationMs(elapsedMs);
  return {
    startedAt,
    completedAt,
    elapsedMs,
    display,
    state: status,
  };
}

function buildHeader(session: RunnerSession, runtime: OpsRuntimeVM): OpsTerminalHeaderVM {
  const status = deriveOpsRunStatus(session);
  const activeIndex = deriveActiveStageIndex(session);
  const totalStages = OPS_PIPELINE_STAGES.length;

  const handle = session.accountHandle?.replace(/^@/, '') || 'target_account';
  const missionTitle = `@${handle} Signal Positioning Mission`;

  const completedStages =
    status === 'completed'
      ? totalStages
      : status === 'idle'
        ? 0
        : Math.max(0, activeIndex + 1);

  const progress = clamp(session.progress ?? 0, 0, 100);

  const readinessScore =
    status === 'idle' ? 0 : session.reportMetrics?.reportReadiness ?? Math.round(progress * 0.9);

  const evidenceConfidence = session.webEvidence?.length
    ? Math.round(
        session.webEvidence.reduce((sum, item) => sum + item.relevanceScore, 0) /
          session.webEvidence.length,
      )
    : 0;
  const engagementConfidence = session.reportMetrics?.engagementAuthenticity ?? 0;
  const confidenceScore =
    status === 'idle'
      ? 0
      : evidenceConfidence > 0
        ? Math.round((evidenceConfidence + engagementConfidence) / 2)
        : engagementConfidence;

  return {
    missionTitle,
    accountHandle: handle,
    platform: session.platform,
    scrapeMode: session.scrapeMode,
    status,
    currentStageLabel: currentStageLabel(status, activeIndex),
    completedStages,
    totalStages,
    progress,
    confidenceScore,
    readinessScore,
    readinessLabel: readinessLabel(readinessScore),
    updatedAt: session.updatedAt,
    runtime,
  };
}

function buildPipeline(session: RunnerSession): OpsTerminalViewModel['pipeline'] {
  const status = deriveOpsRunStatus(session);
  const activeIndex = deriveActiveStageIndex(session);

  const stages: OpsPipelineStageVM[] = OPS_PIPELINE_STAGES.map((stage, index) => {
    let stageStatus: OpsPipelineStageVM['status'] = 'waiting';
    if (status === 'completed' || index < activeIndex) stageStatus = 'completed';
    else if (index === activeIndex && status === 'running') stageStatus = 'running';
    return { ...stage, status: stageStatus };
  });

  const parallelTasks: OpsParallelTaskVM[] = (session.parallelTasks ?? []).map((task) => ({
    id: task.id,
    label: task.label,
    status: task.status,
    progress: clamp(task.progress, 0, 100),
    recordsCount: task.recordsCount,
    lastEvent: task.lastEvent,
  }));

  return { stages, parallelTasks, activeStageIndex: activeIndex };
}

const SOURCE_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  x: 'X / Grok',
  news: 'OpenAI Web',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
};

function mapSourceRunState(run: RunnerSourceRun): OpsSourceRunVM['state'] {
  if (run.status === 'completed') return 'ok';
  if (run.status === 'warning') return 'warning';
  if (run.status === 'failed') return 'error';
  if (run.status === 'running') return 'running';
  return 'idle';
}

function buildSourceRuns(runs: RunnerSourceRun[] = []): OpsSourceRunVM[] {
  return runs.map((run) => ({
    id: run.id,
    source: run.source,
    label: SOURCE_LABEL[run.source] ?? run.source,
    state: mapSourceRunState(run),
    records: run.recordsCollected ?? 0,
    errors: run.errors,
  }));
}

function buildProviderHealth(
  diagnostics: RunnerProviderDiagnostic[] = [],
  status: OpsRunStatus,
): OpsProviderHealthVM {
  const apify = diagnostics.filter((d) => d.provider === 'apify');
  const xai = diagnostics.filter((d) => d.provider === 'xai');
  const openai = diagnostics.filter((d) => d.provider === 'openai');

  const buildProviderStatus = (
    provider: RunnerProviderDiagnostic['provider'],
    label: string,
    bucket: RunnerProviderDiagnostic[],
  ): OpsProviderStatusVM => {
    if (status === 'idle') {
      return { provider, label, state: 'idle', summary: 'Standby — not started.' };
    }
    if (bucket.length === 0) {
      return { provider, label, state: 'idle', summary: 'No diagnostics returned yet.' };
    }
    const error = bucket.find((d) => d.status === 'error');
    const warning = bucket.find((d) => d.status === 'warning');
    const ok = bucket.find((d) => d.status === 'ok');

    if (error) {
      return {
        provider,
        label,
        state: 'error',
        summary: error.message || 'Provider returned an error.',
        detail: bucket
          .filter((d) => d.status !== 'ok')
          .map((d) => d.message)
          .filter(Boolean)
          .slice(0, 3)
          .join(' • '),
      };
    }

    if (warning) {
      const timedOut = bucket.some((d) => d.meta?.kind === 'timeout' || /timed[- ]?out|timeout/i.test(d.message));
      return {
        provider,
        label,
        state: 'warning',
        summary: timedOut
          ? 'Actor timed out before completing.'
          : warning.message || 'Provider returned warnings.',
        detail: bucket
          .filter((d) => d.status !== 'ok')
          .map((d) => d.message)
          .filter(Boolean)
          .slice(0, 3)
          .join(' • '),
        durationMs: typeof ok?.meta?.durationMs === 'number' ? ok.meta.durationMs : undefined,
        timedOut,
      };
    }

    const totalDuration = bucket
      .map((d) => (typeof d.meta?.durationMs === 'number' ? d.meta.durationMs : 0))
      .reduce((sum, ms) => sum + ms, 0);

    return {
      provider,
      label,
      state: 'ok',
      summary: ok?.message ?? `${label} completed.`,
      durationMs: totalDuration > 0 ? totalDuration : undefined,
    };
  };

  return {
    apify: buildProviderStatus('apify', 'Apify', apify),
    xai: buildProviderStatus('xai', 'xAI / Grok', xai),
    openai: buildProviderStatus('openai', 'OpenAI Web', openai),
    diagnostics,
  };
}

function buildSetup(
  session: RunnerSession,
  sourceRuns: OpsSourceRunVM[],
  providerHealth: OpsProviderHealthVM,
): OpsTerminalViewModel['setup'] {
  return {
    primaryProfileUrl: session.primaryProfileUrl,
    accountHandle: session.accountHandle ?? '',
    platform: session.platform,
    scrapeMode: session.scrapeMode,
    postCount: session.postCount ?? 0,
    postUrls: session.postUrls ?? [],
    sources: session.sources,
    sourceRuns,
    providerHealth,
  };
}

function pickPriorityNarrative(
  narratives: RunnerNarrative[],
  extracted: RunnerExtractedNarrative[],
): RunnerNarrative | RunnerExtractedNarrative | undefined {
  const order: Record<RunnerSentiment, number> = { negative: 3, neutral: 2, positive: 1 };
  const combined: Array<{ ref: RunnerNarrative | RunnerExtractedNarrative; sentiment: RunnerSentiment }> = [
    ...narratives.map((n) => ({ ref: n, sentiment: n.sentiment })),
    ...extracted.map((n) => ({ ref: n, sentiment: n.sentiment })),
  ];
  if (combined.length === 0) return undefined;
  return [...combined].sort((a, b) => order[b.sentiment] - order[a.sentiment])[0].ref;
}

function getNarrativeTitle(item: RunnerNarrative | RunnerExtractedNarrative): string {
  return 'title' in item ? item.title : item.label;
}

function getNarrativeDescription(item: RunnerNarrative | RunnerExtractedNarrative): string {
  return item.description;
}

function buildExecutiveSummary(
  session: RunnerSession,
  competitors: OpsCompetitorVM[],
  strategic: RunnerStrategicIntelligence | undefined,
): OpsExecutiveSummaryVM {
  const status = deriveOpsRunStatus(session);
  const isReady = status !== 'idle';
  const metrics = session.reportMetrics;
  const accountHealth = session.accountHealth;

  const dominant: 'positive' | 'neutral' | 'negative' = (() => {
    const dist = metrics?.sentimentDistribution;
    if (!dist) return 'neutral';
    const max = Math.max(dist.positive, dist.neutral, dist.negative);
    if (max === dist.negative) return 'negative';
    if (max === dist.positive) return 'positive';
    return 'neutral';
  })();

  const takeaway = (() => {
    if (!isReady) return 'Launch the mission to unlock the executive briefing.';
    const handle = session.accountHandle ? `@${session.accountHandle}` : 'the target account';
    const posts = metrics?.totalPostsAnalyzed ?? 0;
    const comments = metrics?.totalCommentsCollected ?? 0;
    const score = accountHealth?.score ?? 0;
    const statusLabel = accountHealth?.status ?? 'Stable';
    return `${handle} analyzed across ${posts} post(s) and ${comments} comment(s) — health ${score}/100 (${statusLabel}), audience leaning ${dominant}.`;
  })();

  const positiveNarrative = session.narratives.find((n) => n.sentiment === 'positive');
  const negativeNarrative = session.narratives.find((n) => n.sentiment === 'negative');
  const priority = pickPriorityNarrative(session.narratives, session.extractedNarratives);

  const mainOpportunity = positiveNarrative
    ? `${positiveNarrative.title}: reinforce with audience proof points.`
    : strategic?.marketOpportunitySignals?.[0] ??
      'Opportunity signal will appear once positive narratives are extracted.';

  const mainRisk = negativeNarrative
    ? `${negativeNarrative.title}: ${negativeNarrative.evidenceSnippets?.[0] ?? negativeNarrative.description}`
    : competitors[0]
      ? `Competitor pressure from ${competitors[0].name}: ${competitors[0].risk}`
      : strategic?.audienceMigrationPatterns?.[0] ??
        'Risk signal will appear once negative narratives or competitor data is returned.';

  const recommendation =
    session.responsePlan?.suggestions?.[0]?.content ??
    strategic?.contentStrategyRecommendations?.[0];

  const positiveStrength = positiveNarrative;
  const negativeWeakness = negativeNarrative;
  const threatCompetitor = competitors[0];

  const brandPositionSnapshot = isReady
    ? {
        strength: positiveStrength?.title,
        weakness: negativeWeakness?.title ?? (priority ? getNarrativeDescription(priority) : undefined),
        threat: threatCompetitor?.risk,
      }
    : undefined;

  return {
    isReady,
    takeawaySentence: takeaway,
    mainOpportunity,
    mainRisk,
    metrics: {
      posts: metrics?.totalPostsAnalyzed ?? 0,
      comments: metrics?.totalCommentsCollected ?? 0,
      commenters: metrics?.totalUniqueCommentersMapped ?? 0,
      sentiment: metrics?.sentimentDistribution ?? { positive: 0, neutral: 0, negative: 0 },
      health: accountHealth?.score ?? 0,
      healthStatus: accountHealth?.status ?? 'Stable',
      engagementAuthenticity: metrics?.engagementAuthenticity ?? accountHealth?.metrics?.engagementAuthenticity ?? 0,
      narrativeStability: metrics?.narrativeStability ?? accountHealth?.metrics?.narrativeStability ?? 0,
      reportReadiness: metrics?.reportReadiness ?? 0,
      dominantNarratives: metrics?.dominantNarratives ?? [],
    },
    recommendation,
    brandPositionSnapshot,
    strategicContext: strategic
      ? {
          audienceStatusOverview: strategic.audienceStatusOverview,
          brandPositioningAnalysis: strategic.brandPositioningAnalysis,
        }
      : undefined,
  };
}

function representativeSignalFromComments(
  narrative: RunnerExtractedNarrative | RunnerNarrative,
  comments: RunnerScrapedComment[],
): string | undefined {
  if ('narrativeEvidence' in narrative && narrative.narrativeEvidence?.length) {
    return narrative.narrativeEvidence[0].summary;
  }
  if ('supportingComments' in narrative && narrative.supportingComments?.length) {
    const ids = new Set(narrative.supportingComments);
    const match = comments.find((c) => ids.has(c.id));
    if (match) return match.narrative?.summary ?? match.text;
  }
  if ('evidenceSnippets' in narrative && narrative.evidenceSnippets?.length) {
    return narrative.evidenceSnippets[0];
  }
  return comments[0]?.text;
}

function buildNarratives(session: RunnerSession): OpsNarrativesVM {
  const status = deriveOpsRunStatus(session);
  const hasData = session.extractedNarratives.length > 0 || session.narratives.length > 0;
  const isReady = status !== 'idle' && hasData;

  const themes: OpsNarrativeVM[] = session.extractedNarratives.length
    ? session.extractedNarratives.map((narrative) => ({
        id: narrative.id,
        title: narrative.label,
        description: narrative.description,
        sentiment: narrative.sentiment,
        confidence: narrative.confidence,
        reach: narrative.reachEstimate,
        pressureType: narrative.pressureType,
        keywords: narrative.keywords,
        evidenceSnippets: narrative.narrativeEvidence?.length
          ? narrative.narrativeEvidence.map((item) => item.summary)
          : narrative.supportingComments,
        representativeSignal: representativeSignalFromComments(narrative, session.scrapedComments),
        narrativeEvidence: narrative.narrativeEvidence,
      }))
    : session.narratives.map((narrative) => ({
        id: narrative.id,
        title: narrative.title,
        description: narrative.description,
        sentiment: narrative.sentiment,
        reach: narrative.reach,
        evidenceSnippets: narrative.evidenceSnippets,
        representativeSignal: representativeSignalFromComments(narrative, session.scrapedComments),
      }));

  const priority = pickPriorityNarrative(session.narratives, session.extractedNarratives);
  const priorityVM = priority
    ? themes.find((t) => t.title === getNarrativeTitle(priority)) ??
      ({
        id: 'priority',
        title: getNarrativeTitle(priority),
        description: getNarrativeDescription(priority),
        sentiment: priority.sentiment,
      } as OpsNarrativeVM)
    : undefined;

  return { isReady, themes, priorityTheme: priorityVM };
}

function intensityFromReach(reach: number): 'high' | 'medium' | 'low' {
  if (reach >= 400000) return 'high';
  if (reach >= 150000) return 'medium';
  return 'low';
}

function relevanceFromIntensity(intensity: 'high' | 'medium' | 'low'): number {
  if (intensity === 'high') return 88;
  if (intensity === 'medium') return 73;
  return 59;
}

function isXNarrative(narrative: RunnerNarrative | RunnerExtractedNarrative): boolean {
  if ('sources' in narrative && narrative.sources?.includes('x')) return true;
  const title = getNarrativeTitle(narrative).toLowerCase();
  const description = getNarrativeDescription(narrative).toLowerCase();
  const keywords = 'keywords' in narrative ? narrative.keywords ?? [] : [];
  if (keywords.some((k) => X_KEYWORDS.includes(k.toLowerCase()))) return true;
  return X_KEYWORDS.some((kw) => title.includes(kw) || description.includes(kw));
}

function buildXIntelligence(
  providerHealth: OpsProviderHealthVM,
  parallelTasks: RunnerParallelTask[] = [],
  sourceRuns: RunnerSourceRun[] = [],
  strategic: RunnerStrategicIntelligence | undefined,
  status: OpsRunStatus,
): OpsXIntelligenceVM {
  const xai = providerHealth.xai;
  const xTask = parallelTasks.find((t) => t.id === 'task-xai');
  const xSource = sourceRuns.find((s) => s.source === 'x');
  const errors = providerHealth.diagnostics
    .filter((d) => d.provider === 'xai' && d.status !== 'ok')
    .map((d) => d.message)
    .filter(Boolean);
  const sourceErrors = (xSource?.errors ?? []).filter(Boolean);
  const allErrors = [...errors, ...sourceErrors].slice(0, 4);

  const state = status === 'idle' ? 'idle' : xai.state;

  return {
    state,
    summary:
      state === 'ok'
        ? 'X/Grok intelligence completed.'
        : state === 'warning'
          ? 'X/Grok intelligence returned warnings.'
          : state === 'error'
            ? 'X/Grok intelligence returned errors.'
            : 'Standby.',
    alignment: strategic?.crossPlatformNarrativeAlignment,
    momentum: strategic?.trendMomentumAnalysis,
    errors: allErrors,
    taskRecords: xTask?.recordsCount,
  };
}

function buildSocialSignals(
  session: RunnerSession & { xSignals?: RunnerNarrative[] },
  xIntel: OpsXIntelligenceVM,
): OpsSocialSignalsVM {
  const status = deriveOpsRunStatus(session);

  const explicit = session.xSignals ?? [];
  const derivedSource = explicit.length
    ? explicit
    : [
        ...session.narratives.filter(isXNarrative),
        ...session.extractedNarratives.filter(isXNarrative).map<RunnerNarrative>((n) => ({
          id: n.id,
          clientId: session.clientId,
          title: n.label,
          description: n.description,
          sentiment: n.sentiment,
          reach: n.reachEstimate,
          mentions: n.commentCount,
          sources: ['x'],
          trend: n.sentiment === 'negative' ? 'down' : n.sentiment === 'positive' ? 'up' : 'stable',
          signals: [],
          evidenceSnippets: [],
        })),
      ];

  const dedupe = new Map<string, RunnerNarrative>();
  derivedSource.forEach((narrative) => {
    if (!dedupe.has(narrative.title)) dedupe.set(narrative.title, narrative);
  });

  const signals: OpsSocialSignalVM[] = Array.from(dedupe.values()).map((narrative) => {
    const intensity = intensityFromReach(narrative.reach ?? 0);
    return {
      id: narrative.id,
      source: narrative.sources?.includes('x') ? 'X / external signal' : 'External signal stream',
      signal: narrative.description,
      intensity,
      sentiment: narrative.sentiment,
      relevance: relevanceFromIntensity(intensity),
    };
  });

  const topSignal = [...signals].sort((a, b) => b.relevance - a.relevance)[0];

  return {
    isReady: status !== 'idle',
    signals,
    topSignal,
    derivedFromNarratives: explicit.length === 0 && signals.length > 0,
    xIntelligence: xIntel,
  };
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function parsedSentimentFromString(text: string | undefined): RunnerSentiment {
  if (!text) return 'neutral';
  const normalized = text.toLowerCase();
  if (normalized.includes('positive')) return 'positive';
  if (normalized.includes('negative')) return 'negative';
  return 'neutral';
}

interface ParsedWebIntelligenceShape {
  summary?: string;
  webSentiment?: { positive?: number; neutral?: number; negative?: number };
  marketNarratives?: string[];
  industryDiscussions?: string[];
  webEvidence?: Array<{
    title?: string;
    url?: string;
    source_name?: string;
    sourceName?: string;
    source_domain?: string;
    sourceDomain?: string;
    source_type?: string;
    excerpt?: string;
    sentiment?: string;
    relevance?: number;
  }>;
}

function tryParseJson(text: string): unknown | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    // Tolerant repair: if the string is truncated mid-token, try
    // closing arrays/objects up to the last valid block.
    for (let cut = trimmed.lastIndexOf('}') + 1; cut > 0; cut = trimmed.lastIndexOf('}', cut - 1) + 1) {
      const candidate = trimmed.slice(0, cut);
      const closed = closeBrackets(candidate);
      try {
        return JSON.parse(closed);
      } catch {
        if (cut <= 1) break;
      }
    }
    return null;
  }
}

function closeBrackets(input: string): string {
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escape = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') inString = !inString;
    if (inString) continue;
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
  }
  let suffix = '';
  if (inString) suffix += '"';
  while (brackets-- > 0) suffix += ']';
  while (braces-- > 0) suffix += '}';
  return input + suffix;
}

function buildWebIntelligence(
  strategic: RunnerStrategicIntelligence | undefined,
): OpsWebIntelligenceVM {
  const fallback: OpsWebIntelligenceVM = {
    isParsed: false,
    marketNarratives: [],
    industryDiscussions: [],
    evidence: [],
  };
  if (!strategic) return fallback;

  const rawSource =
    strategic.webSentimentAndTopicPositioning && strategic.webSentimentAndTopicPositioning.trim().length > 0
      ? strategic.webSentimentAndTopicPositioning
      : strategic.webIntelligenceSummary ?? '';

  if (!rawSource) return fallback;

  const parsed = tryParseJson(rawSource) as ParsedWebIntelligenceShape | null;
  if (!parsed || typeof parsed !== 'object') {
    return {
      ...fallback,
      rawSummary: rawSource,
    };
  }

  const evidence = (parsed.webEvidence ?? [])
    .map((hit, index) => {
      const url = hit?.url ?? '';
      const outlet = hit?.source_name ?? hit?.sourceName ?? domainFromUrl(url);
      const domain = hit?.source_domain ?? hit?.sourceDomain ?? domainFromUrl(url);
      const confidence = typeof hit?.relevance === 'number' ? clamp(hit.relevance, 0, 100) : 0;
      const sentiment: RunnerSentiment = parsedSentimentFromString(hit?.sentiment);
      return {
        id: url || `${outlet}-${index}`,
        outlet: outlet || 'Web source',
        domain,
        title: hit?.title ?? outlet ?? 'Untitled source',
        excerpt: hit?.excerpt ?? '',
        url,
        confidence,
        sentiment,
      };
    })
    .filter((item) => item.url || item.outlet);

  return {
    isParsed: true,
    summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
    sentiment:
      parsed.webSentiment && typeof parsed.webSentiment === 'object'
        ? {
            positive: Number(parsed.webSentiment.positive ?? 0),
            neutral: Number(parsed.webSentiment.neutral ?? 0),
            negative: Number(parsed.webSentiment.negative ?? 0),
          }
        : undefined,
    marketNarratives: Array.isArray(parsed.marketNarratives) ? parsed.marketNarratives.filter(Boolean) : [],
    industryDiscussions: Array.isArray(parsed.industryDiscussions)
      ? parsed.industryDiscussions.filter(Boolean)
      : [],
    evidence,
  };
}

function buildWebEvidence(
  session: RunnerSession,
  webIntelligence: OpsWebIntelligenceVM,
  providerHealth: OpsProviderHealthVM,
  sourceRuns: OpsSourceRunVM[],
): OpsWebEvidenceVM {
  const status = deriveOpsRunStatus(session);
  const sessionItems = (session.webEvidence ?? []).map((hit) => ({
    id: hit.id,
    outlet: hit.sourceName,
    domain: hit.sourceDomain || domainFromUrl(hit.url),
    title: hit.title,
    excerpt: hit.excerpt,
    url: hit.url,
    confidence: clamp(hit.relevanceScore, 0, 100),
    sentiment: hit.sentiment,
  }));
  const items = sessionItems.length > 0 ? sessionItems : webIntelligence.evidence;
  const strongest = [...items].sort((a, b) => b.confidence - a.confidence)[0];
  const newsSource = sourceRuns.find((run) => run.source === 'news');
  return {
    isReady: status !== 'idle',
    items,
    strongest,
    webIntelligence,
    providerSummary: providerHealth.openai.summary,
    providerState: providerHealth.openai.state,
    newsSource,
  };
}

function influenceLevel(share: number): 'High' | 'Medium' | 'Emerging' {
  if (share >= 50) return 'High';
  if (share >= 25) return 'Medium';
  return 'Emerging';
}

function trendFromSentiment(sentiment: RunnerSentiment): 'up' | 'stable' | 'down' {
  if (sentiment === 'positive') return 'up';
  if (sentiment === 'negative') return 'down';
  return 'stable';
}

function intentVMs(intents: RunnerIntentDistribution[] = []): OpsAudienceIntentVM[] {
  return intents.map((entry) => ({
    intent: String(entry.intent),
    percentage: Math.round(entry.percentage),
    count: entry.count,
  }));
}

function buildClusterSegments(
  clusters: RunnerAudienceCluster[],
): { segments: OpsAudienceSegmentVM[]; clusterVMs: OpsAudienceClusterVM[] } {
  const totalSize = clusters.reduce((sum, cluster) => sum + (cluster.size ?? 0), 0) || 1;

  const clusterVMs: OpsAudienceClusterVM[] = clusters.map((cluster) => ({
    id: cluster.id,
    name: cluster.name,
    size: cluster.size,
    activity: cluster.activity,
    sentiment: cluster.sentiment,
    topTopics: cluster.topTopics ?? [],
    keyVoices: cluster.keyVoices ?? [],
    narrativeShare: cluster.narrativeShare ?? [],
    share: Math.round((cluster.size / totalSize) * 100),
    intent:
      cluster.sentiment === 'positive'
        ? 'positive'
        : cluster.sentiment === 'negative'
          ? 'negative'
          : 'neutral',
  }));

  const segments: OpsAudienceSegmentVM[] = clusterVMs.map((cluster) => ({
    id: cluster.id,
    name: cluster.name,
    share: cluster.share,
    trend: trendFromSentiment(cluster.sentiment),
    sentiment: cluster.sentiment,
    influence: influenceLevel(cluster.share),
  }));

  return { segments, clusterVMs };
}

function buildAudienceMap(
  session: RunnerSession,
  clusters: RunnerAudienceCluster[],
  intents: RunnerIntentDistribution[],
): OpsAudienceMapVM {
  const status = deriveOpsRunStatus(session);
  const ratios = session.accountHealth?.ratios;
  const totalNodes = session.networkNodes?.length ?? 0;
  const totalCommentersMapped = session.reportMetrics?.totalUniqueCommentersMapped ?? 0;
  const intentDistribution = intentVMs(intents);

  if (clusters.length > 0) {
    const { segments, clusterVMs } = buildClusterSegments(clusters);
    const dominant = segments.length ? [...segments].sort((a, b) => b.share - a.share)[0] : undefined;
    return {
      isReady: status !== 'idle' && segments.length > 0,
      segments,
      dominant,
      totalNodes,
      totalCommentersMapped,
      clusters: clusterVMs,
      intentDistribution,
      source: 'clusters',
    };
  }

  const baseSegments: Array<{ id: string; name: string; share: number; trend: 'up' | 'stable' | 'down'; sentiment: RunnerSentiment }> = [
    { id: 'seg-supporters', name: 'Core Supporters', share: ratios?.positiveSupporter ?? 0, trend: 'up', sentiment: 'positive' },
    { id: 'seg-neutral', name: 'Neutral Audience', share: ratios?.neutralAudience ?? 0, trend: 'stable', sentiment: 'neutral' },
    { id: 'seg-critical', name: 'Critical Cluster', share: ratios?.criticalPressure ?? 0, trend: 'down', sentiment: 'negative' },
  ];

  const suspiciousShare = (ratios?.suspiciousActivity ?? 0) + (ratios?.coordinatedRisk ?? 0);
  if (suspiciousShare > 0) {
    baseSegments.push({
      id: 'seg-suspicious',
      name: 'Suspicious Activity',
      share: suspiciousShare,
      trend: 'down',
      sentiment: 'negative',
    });
  }

  const segments: OpsAudienceSegmentVM[] = baseSegments
    .filter((segment) => segment.share > 0)
    .map((segment) => ({
      ...segment,
      influence: influenceLevel(segment.share),
    }));

  const dominant = segments.length ? [...segments].sort((a, b) => b.share - a.share)[0] : undefined;

  return {
    isReady: status !== 'idle' && segments.length > 0,
    segments,
    dominant,
    totalNodes,
    totalCommentersMapped,
    clusters: [],
    intentDistribution,
    source: segments.length ? 'ratios' : 'empty',
  };
}

function riskFromCompetitor(competitor: RunnerCompetitor): 'HIGH' | 'MEDIUM' | 'WATCH' {
  const risk = competitor.risk.toLowerCase();
  if (
    risk.includes('capture') ||
    risk.includes('aggressive') ||
    (competitor.overlapScore ?? 0) >= 75 ||
    competitor.healthStatus === 'Under Pressure'
  ) return 'HIGH';
  if (
    risk.includes('shift') ||
    risk.includes('dilute') ||
    risk.includes('overlap') ||
    (competitor.overlapScore ?? 0) >= 50 ||
    competitor.healthStatus === 'At Risk'
  ) return 'MEDIUM';
  return 'WATCH';
}

function buildCompetitors(
  session: RunnerSession & { competitors?: RunnerCompetitor[] },
  parallelTasks: RunnerParallelTask[],
  strategic: RunnerStrategicIntelligence | undefined,
): OpsCompetitorsVM {
  const status = deriveOpsRunStatus(session);
  const list = session.competitors ?? [];

  const competitors: OpsCompetitorVM[] = list.slice(0, 3).map((competitor) => ({
    id: competitor.id,
    name: competitor.name,
    handle: competitor.handle,
    profileUrl: competitor.profileUrl,
    position: competitor.position,
    risk: competitor.risk,
    action: competitor.action ?? 'Action plan pending strategist review.',
    riskLevel: riskFromCompetitor(competitor),
    confidence: competitor.confidence,
    evidenceUrls: competitor.evidenceUrls ?? [],
    overlapScore: competitor.overlapScore,
    healthStatus: competitor.healthStatus,
    topNarrative: competitor.topNarrative,
    counterPosition: competitor.counterPosition ?? competitor.action,
    verificationState: competitor.verificationState,
    battlefieldSummary: competitor.battlefieldSummary,
    narrativePressure: competitor.risk,
  }));

  const order: Record<'HIGH' | 'MEDIUM' | 'WATCH', number> = { HIGH: 3, MEDIUM: 2, WATCH: 1 };
  const highestRisk = competitors.length
    ? [...competitors].sort((a, b) => {
      const riskDelta = order[b.riskLevel] - order[a.riskLevel];
      if (riskDelta !== 0) return riskDelta;
      return (b.overlapScore ?? 0) - (a.overlapScore ?? 0);
    })[0]
    : undefined;

  let emptyState: OpsCompetitorEmptyStateVM | undefined;
  if (competitors.length === 0 && status !== 'idle') {
    const competitorTask = parallelTasks.find((t) => t.id === 'task-competitors');
    emptyState = {
      message: 'No OpenAI-verified competitors found.',
      comparisonText: strategic?.competitorPositioningComparison,
      taskState: competitorTask?.status as OpsCompetitorEmptyStateVM['taskState'],
      taskRecords: competitorTask?.recordsCount,
    };
  }

  return {
    isReady: status !== 'idle',
    competitors,
    expectedSlots: 3,
    highestRisk,
    emptyState,
  };
}

function buildBrandPosition(
  session: RunnerSession,
  competitors: OpsCompetitorVM[],
  narratives: OpsNarrativesVM,
  strategic: RunnerStrategicIntelligence | undefined,
  webIntelligence: OpsWebIntelligenceVM,
): OpsBrandPositionVM {
  const status = deriveOpsRunStatus(session);
  const isReady = status === 'completed' || (status === 'running' && session.progress >= 80);

  const strengths = narratives.themes
    .filter((t) => t.sentiment === 'positive')
    .slice(0, 3)
    .map((t) => `${t.title} — ${t.description}`);
  const weaknesses = narratives.themes
    .filter((t) => t.sentiment === 'negative' || t.pressureType === 'Constructive Criticism')
    .slice(0, 3)
    .map((t) => `${t.title} — ${t.description}`);

  const ratios = session.accountHealth?.ratios;
  const decision = strategic?.brandPositionDecision;
  if ((ratios?.criticalPressure ?? 0) >= 20 && weaknesses.length === 0) {
    weaknesses.push('Elevated critical pressure share in supporter ratios.');
  }

  const opportunities: string[] = [];
  const suggestion = session.responsePlan?.suggestions?.[0];
  if (suggestion) opportunities.push(suggestion.content);
  const secondary = session.responsePlan?.suggestions?.[1];
  if (secondary) opportunities.push(secondary.content);
  for (const signal of strategic?.marketOpportunitySignals ?? []) {
    if (!opportunities.includes(signal)) opportunities.push(signal);
    if (opportunities.length >= 4) break;
  }
  if (opportunities.length === 0 && strengths.length > 0) {
    opportunities.push(`Reinforce ${strengths[0]} through evidence-led content.`);
  }

  const threats = competitors.map((c) => `${c.name}: ${c.risk}`);
  for (const pattern of strategic?.audienceMigrationPatterns ?? []) {
    if (!threats.includes(pattern)) threats.push(pattern);
    if (threats.length >= 4) break;
  }
  if (threats.length === 0 && weaknesses.length > 0) {
    threats.push('Narrative hijacking risk if friction themes are not addressed.');
  }

  const recommendation =
    decision?.recommendation ??
    suggestion?.content ??
    strategic?.contentStrategyRecommendations?.[0] ??
    'Reinforce strongest positive narratives with creator-led proof and address the highest-risk competitor pressure.';

  const takeaway = (() => {
    if (!isReady) return 'Brand position will assemble after audience and competitor stages complete.';
    if (decision?.positionThesis) {
      const handle = session.accountHandle ? `@${session.accountHandle}` : 'Target';
      return `${handle} ${decision.posture.toLowerCase()}: ${decision.positionThesis}`;
    }
    const handle = session.accountHandle ? `@${session.accountHandle}` : 'target';
    const score = session.accountHealth?.score ?? 0;
    const statusLabel = session.accountHealth?.status ?? 'Stable';
    const baseLine = `${handle} health ${score}/100 (${statusLabel}). `;
    const summary =
      strategic?.brandPositioningAnalysis ??
      webIntelligence.summary ??
      'Reinforce positive narratives and address friction before competitor activity escalates.';
    return `${baseLine}${summary}`;
  })();

  return {
    isReady,
    derived: true,
    takeaway,
    posture: decision?.posture,
    confidence: decision?.confidence,
    source: decision?.source,
    positionThesis: decision?.positionThesis,
    proofPoints: decision?.proofPoints?.length ? decision.proofPoints : strengths.slice(0, 4),
    priorityActions: decision?.priorityActions?.length ? decision.priorityActions : opportunities.slice(0, 4),
    narrativeLevers: decision?.narrativeLevers?.length ? decision.narrativeLevers : narratives.themes.map(theme => theme.title).slice(0, 4),
    competitorPressures: decision?.competitorPressures?.length ? decision.competitorPressures : threats.slice(0, 4),
    strengths: strengths.length ? strengths : ['Strengths will populate once positive narratives are extracted.'],
    weaknesses: weaknesses.length ? weaknesses : ['Weakness signal will populate once friction narratives are extracted.'],
    opportunities,
    threats,
    recommendation,
  };
}

function buildBrandPositionPanel(
  strategic: RunnerStrategicIntelligence | undefined,
  webIntelligence: OpsWebIntelligenceVM,
): OpsBrandPositionPanelVM {
  return {
    audienceStatusOverview: strategic?.audienceStatusOverview,
    brandPositioningAnalysis: strategic?.brandPositioningAnalysis,
    brandPerceptionInsights: strategic?.brandPerceptionInsights,
    narrativeOverlapAndDifferentiation: strategic?.narrativeOverlapAndDifferentiation,
    marketOpportunitySignals: strategic?.marketOpportunitySignals ?? [],
    audienceMigrationPatterns: strategic?.audienceMigrationPatterns ?? [],
    contentStrategyRecommendations: strategic?.contentStrategyRecommendations ?? [],
    webSummary: webIntelligence.summary,
  };
}

function eventTone(severity: RunnerEvent['severity'], type: RunnerEvent['type']): OpsMissionEventVM['tone'] {
  if (severity === 'high' || severity === 'critical') return 'warning';
  if (type === 'response' || type === 'approval') return 'success';
  if (type === 'analysis' || type === 'collection') return 'running';
  return 'info';
}

function formatEventTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString([], { hour12: false });
}

function buildEvents(session: RunnerSession): OpsMissionEventVM[] {
  return (session.events ?? []).map((event) => ({
    id: event.id,
    timestamp: formatEventTimestamp(event.timestamp),
    message: event.message,
    tone: eventTone(event.severity, event.type),
  }));
}

export function mapRunnerResponseToOpsTerminal(response: RunnerOpsResponse): OpsTerminalViewModel {
  const session = response.session;
  const status = deriveOpsRunStatus(session);

  const clusters =
    session.audienceClusters && session.audienceClusters.length > 0
      ? session.audienceClusters
      : response.audienceClusters ?? [];
  const intents =
    session.intentDistribution && session.intentDistribution.length > 0
      ? session.intentDistribution
      : response.intentDistribution ?? [];

  const strategic = session.strategicIntelligence;
  const providerHealth = buildProviderHealth(session.providerDiagnostics, status);
  const sourceRunsVM = buildSourceRuns(response.sourceRuns);
  const runtime = buildRuntime(response, status);

  const xIntelligence = buildXIntelligence(
    providerHealth,
    session.parallelTasks ?? [],
    response.sourceRuns ?? [],
    strategic,
    status,
  );
  const webIntelligence = buildWebIntelligence(strategic);
  const competitorsVM = buildCompetitors(session, session.parallelTasks ?? [], strategic);
  const narrativesVM = buildNarratives(session);

  return {
    header: buildHeader(session, runtime),
    pipeline: buildPipeline(session),
    setup: buildSetup(session, sourceRunsVM, providerHealth),
    executiveSummary: buildExecutiveSummary(session, competitorsVM.competitors, strategic),
    narratives: narrativesVM,
    socialSignals: buildSocialSignals(session, xIntelligence),
    webEvidence: buildWebEvidence(session, webIntelligence, providerHealth, sourceRunsVM),
    audienceMap: buildAudienceMap(session, clusters, intents),
    competitors: competitorsVM,
    brandPosition: buildBrandPosition(session, competitorsVM.competitors, narrativesVM, strategic, webIntelligence),
    events: buildEvents(session),
    providerHealth,
    webIntelligence,
    xIntelligence,
    brandPositionPanel: buildBrandPositionPanel(strategic, webIntelligence),
  };
}

export function emptyViewModelForInput(input: { instagramPostUrl: string; recentProfilePosts: number }): OpsTerminalViewModel {
  const baseSession: RunnerSession = {
    id: 'idle',
    clientId: '',
    primaryProfileUrl: input.instagramPostUrl,
    accountHandle: '',
    platform: 'instagram',
    scrapeMode: 'latest_n',
    postCount: input.recentProfilePosts,
    postUrls: [],
    sources: { posts: true, comments: true, mentions: false, portals: false, forums: false },
    status: 'idle',
    currentStage: 'validating_inputs',
    progress: 0,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    parallelTasks: [],
    actionQueue: [],
    scrapedPosts: [],
    scrapedComments: [],
    extractedNarratives: [],
    webEvidence: [],
    narratives: [],
    networkNodes: [],
    networkEdges: [],
    accountHealth: {
      score: 0,
      status: 'Stable',
      ratios: { positiveSupporter: 0, neutralAudience: 0, criticalPressure: 0, suspiciousActivity: 0, coordinatedRisk: 0 },
      metrics: { engagementAuthenticity: 0, narrativeStability: 0, communityResilience: 0 },
    },
    reviewQueue: [],
    reportMetrics: {
      totalPostsAnalyzed: 0,
      totalCommentsCollected: 0,
      totalUniqueCommentersMapped: 0,
      sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      dominantNarratives: [],
      accountHealthScore: 0,
      suspiciousReviewCount: 0,
      narrativeStability: 0,
      engagementAuthenticity: 0,
      reportReadiness: 0,
    },
    responsePlan: { suggestions: [] },
    approvals: [],
    supervision: { actionQueue: [], completedActions: [], failedActions: [], alerts: [], responderGroupHealth: {} },
    events: [],
  };

  return mapRunnerResponseToOpsTerminal({ session: baseSession });
}
