import { OPS_PIPELINE_STAGES } from '../data';
import type {
  OpsAudienceMapVM,
  OpsAudienceSegmentVM,
  OpsBrandPositionVM,
  OpsCompetitorsVM,
  OpsCompetitorVM,
  OpsExecutiveSummaryVM,
  OpsMissionEventVM,
  OpsNarrativeVM,
  OpsNarrativesVM,
  OpsParallelTaskVM,
  OpsPipelineStageVM,
  OpsRunStatus,
  OpsSocialSignalVM,
  OpsSocialSignalsVM,
  OpsTerminalHeaderVM,
  OpsTerminalViewModel,
  OpsWebEvidenceVM,
  RunnerCompetitor,
  RunnerEvent,
  RunnerExtractedNarrative,
  RunnerNarrative,
  RunnerOpsResponse,
  RunnerScrapedComment,
  RunnerSession,
  RunnerSentiment,
} from '../types';

const X_KEYWORDS = ['x', 'grok', 'twitter'];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function deriveOpsRunStatus(session: RunnerSession): OpsRunStatus {
  if (session.status === 'completed') return 'completed';
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
  if (activeIndex < 0) return 'Initializing stage dispatch';
  return OPS_PIPELINE_STAGES[activeIndex]?.label ?? 'Dispatching pipeline';
}

function buildHeader(session: RunnerSession): OpsTerminalHeaderVM {
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

function buildSetup(session: RunnerSession): OpsTerminalViewModel['setup'] {
  return {
    primaryProfileUrl: session.primaryProfileUrl,
    accountHandle: session.accountHandle ?? '',
    platform: session.platform,
    scrapeMode: session.scrapeMode,
    postCount: session.postCount ?? 0,
    postUrls: session.postUrls ?? [],
    sources: session.sources,
  };
}

function sentimentFromRatios(metrics: RunnerSession['accountHealth']['metrics'], dominant: 'positive' | 'neutral' | 'negative'): string {
  const authenticity = metrics?.engagementAuthenticity ?? 0;
  return `Audience is ${dominant} with engagement authenticity at ${authenticity}%.`;
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
): OpsExecutiveSummaryVM {
  const status = deriveOpsRunStatus(session);
  const isReady = status !== 'idle';

  const dominant: 'positive' | 'neutral' | 'negative' = (() => {
    const dist = session.reportMetrics?.sentimentDistribution;
    if (!dist) return 'neutral';
    const max = Math.max(dist.positive, dist.neutral, dist.negative);
    if (max === dist.negative) return 'negative';
    if (max === dist.positive) return 'positive';
    return 'neutral';
  })();

  const takeaway = isReady
    ? sentimentFromRatios(session.accountHealth.metrics, dominant)
    : 'Launch the mission to unlock the executive briefing.';

  const positiveNarrative = session.narratives.find((n) => n.sentiment === 'positive');
  const negativeNarrative = session.narratives.find((n) => n.sentiment === 'negative');
  const priority = pickPriorityNarrative(session.narratives, session.extractedNarratives);

  const mainOpportunity = positiveNarrative
    ? `${positiveNarrative.title}: reinforce with audience proof points.`
    : 'Opportunity signal will appear once positive narratives are extracted.';

  const mainRisk = negativeNarrative
    ? `${negativeNarrative.title}: ${negativeNarrative.evidenceSnippets?.[0] ?? negativeNarrative.description}`
    : competitors[0]
      ? `Competitor pressure from ${competitors[0].name}: ${competitors[0].risk}`
      : 'Risk signal will appear once negative narratives are extracted.';

  const recommendation = session.responsePlan?.suggestions?.[0]?.content;

  const positiveStrength = session.narratives.find((n) => n.sentiment === 'positive');
  const negativeWeakness = session.narratives.find((n) => n.sentiment === 'negative');
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
      posts: session.reportMetrics?.totalPostsAnalyzed ?? 0,
      comments: session.reportMetrics?.totalCommentsCollected ?? 0,
      commenters: session.reportMetrics?.totalUniqueCommentersMapped ?? 0,
      sentiment: session.reportMetrics?.sentimentDistribution ?? { positive: 0, neutral: 0, negative: 0 },
      health: session.accountHealth?.score ?? 0,
      healthStatus: session.accountHealth?.status ?? 'Stable',
    },
    recommendation,
    brandPositionSnapshot,
  };
}

function representativeSignalFromComments(
  narrative: RunnerExtractedNarrative | RunnerNarrative,
  comments: RunnerScrapedComment[],
): string | undefined {
  if ('supportingComments' in narrative && narrative.supportingComments?.length) {
    const ids = new Set(narrative.supportingComments);
    const match = comments.find((c) => ids.has(c.id));
    if (match) return match.text;
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
        evidenceSnippets: narrative.supportingComments,
        representativeSignal: representativeSignalFromComments(narrative, session.scrapedComments),
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

function buildSocialSignals(session: RunnerSession & { xSignals?: RunnerNarrative[] }): OpsSocialSignalsVM {
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
  };
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function buildWebEvidence(session: RunnerSession): OpsWebEvidenceVM {
  const status = deriveOpsRunStatus(session);
  const items = (session.webEvidence ?? []).map((hit) => ({
    id: hit.id,
    outlet: hit.sourceName,
    domain: hit.sourceDomain || domainFromUrl(hit.url),
    title: hit.title,
    excerpt: hit.excerpt,
    url: hit.url,
    confidence: clamp(hit.relevanceScore, 0, 100),
    sentiment: hit.sentiment,
  }));
  const strongest = [...items].sort((a, b) => b.confidence - a.confidence)[0];
  return { isReady: status !== 'idle', items, strongest };
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

function buildAudienceMap(session: RunnerSession): OpsAudienceMapVM {
  const status = deriveOpsRunStatus(session);
  const ratios = session.accountHealth?.ratios;
  const totalNodes = session.networkNodes?.length ?? 0;
  const totalCommentersMapped = session.reportMetrics?.totalUniqueCommentersMapped ?? 0;

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
  };
}

function riskFromCompetitor(competitor: RunnerCompetitor): 'HIGH' | 'MEDIUM' | 'WATCH' {
  const risk = competitor.risk.toLowerCase();
  if (risk.includes('capture') || risk.includes('aggressive')) return 'HIGH';
  if (risk.includes('shift') || risk.includes('dilute') || risk.includes('overlap')) return 'MEDIUM';
  return 'WATCH';
}

function buildCompetitors(
  session: RunnerSession & { competitors?: RunnerCompetitor[] },
): OpsCompetitorsVM {
  const status = deriveOpsRunStatus(session);
  const list = session.competitors ?? [];

  const competitors: OpsCompetitorVM[] = list.slice(0, 3).map((competitor) => ({
    id: competitor.id,
    name: competitor.name,
    position: competitor.position,
    risk: competitor.risk,
    action: competitor.action ?? 'Action plan pending strategist review.',
    riskLevel: riskFromCompetitor(competitor),
  }));

  const order: Record<'HIGH' | 'MEDIUM' | 'WATCH', number> = { HIGH: 3, MEDIUM: 2, WATCH: 1 };
  const highestRisk = competitors.length
    ? [...competitors].sort((a, b) => order[b.riskLevel] - order[a.riskLevel])[0]
    : undefined;

  return {
    isReady: status !== 'idle',
    competitors,
    expectedSlots: 3,
    highestRisk,
  };
}

function buildBrandPosition(
  session: RunnerSession,
  competitors: OpsCompetitorVM[],
  narratives: OpsNarrativesVM,
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
  if ((ratios?.criticalPressure ?? 0) >= 20 && weaknesses.length === 0) {
    weaknesses.push('Elevated critical pressure share in supporter ratios.');
  }

  const opportunities: string[] = [];
  const suggestion = session.responsePlan?.suggestions?.[0];
  if (suggestion) opportunities.push(suggestion.content);
  const secondary = session.responsePlan?.suggestions?.[1];
  if (secondary) opportunities.push(secondary.content);
  if (opportunities.length === 0 && strengths.length > 0) {
    opportunities.push(`Reinforce ${strengths[0]} through evidence-led content.`);
  }

  const threats = competitors.map((c) => `${c.name}: ${c.risk}`);
  if (threats.length === 0 && weaknesses.length > 0) {
    threats.push('Narrative hijacking risk if friction themes are not addressed.');
  }

  const recommendation =
    suggestion?.content ??
    'Reinforce strongest positive narratives with creator-led proof and address the highest-risk competitor pressure.';

  const takeaway = isReady
    ? `Account health at ${session.accountHealth.score} (${session.accountHealth.status}). Reinforce positive narratives and address friction before competitor activity escalates.`
    : 'Brand position will assemble after audience and competitor stages complete.';

  return {
    isReady,
    derived: true,
    takeaway,
    strengths: strengths.length ? strengths : ['Strengths will populate once positive narratives are extracted.'],
    weaknesses: weaknesses.length ? weaknesses : ['Weakness signal will populate once friction narratives are extracted.'],
    opportunities,
    threats,
    recommendation,
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
  const competitorsVM = buildCompetitors(session);
  const narrativesVM = buildNarratives(session);

  return {
    header: buildHeader(session),
    pipeline: buildPipeline(session),
    setup: buildSetup(session),
    executiveSummary: buildExecutiveSummary(session, competitorsVM.competitors),
    narratives: narrativesVM,
    socialSignals: buildSocialSignals(session),
    webEvidence: buildWebEvidence(session),
    audienceMap: buildAudienceMap(session),
    competitors: competitorsVM,
    brandPosition: buildBrandPosition(session, competitorsVM.competitors, narrativesVM),
    events: buildEvents(session),
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
