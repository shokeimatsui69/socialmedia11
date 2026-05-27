import { OPS_PIPELINE_STAGES, realRunnerResponseFixture } from '../data';
import type {
  IntelligencePipelineRequest,
  IntelligencePipelineResult,
  CompetitorProfileInsight,
} from '../../../types';
import {
  buildTurboScanRequest,
  DEFAULT_TURBO_SCAN_SETTINGS,
  detectInstagramUrl,
  type DetectedInstagramUrl,
} from '../../../services/turboScan';
import type {
  OpsRunInput,
  RunnerCompetitor,
  RunnerEvent,
  RunnerOpsResponse,
  RunnerSession,
} from '../types';

export interface OpsTerminalInputValidation {
  isValid: boolean;
  error?: string;
  detected?: DetectedInstagramUrl;
}

export function validateOpsTerminalInput(input: OpsRunInput): OpsTerminalInputValidation {
  if (input.recentProfilePosts < 1 || input.recentProfilePosts > 30) {
    return { isValid: false, error: 'Recent profile posts must be between 1 and 30.' };
  }
  const detection = detectInstagramUrl(input.instagramPostUrl);
  if (!detection.isValid || !detection.detected) {
    return {
      isValid: false,
      error: detection.error || 'Enter a valid Instagram profile, post, or reel URL.',
    };
  }
  return { isValid: true, detected: detection.detected };
}

const INTELLIGENCE_JOBS_ENDPOINT = '/api/intelligence/jobs';
const REQUEST_TIMEOUT_MS = 30 * 60 * 1000;

export type OpsTerminalJobPhase = 'pending' | 'completed' | 'failed';

export interface OpsTerminalLifecycleEvent {
  id: string;
  message: string;
  timestamp: string;
  milestone: string;
}

export interface OpsTerminalJobProgress {
  jobId: string;
  phase: OpsTerminalJobPhase;
  progress: number;
  activeStageIndex: number;
  totalStages: number;
  currentStageLabel: string;
  events: OpsTerminalLifecycleEvent[];
  error?: string;
  startedAt: string;
  elapsedMs: number;
  completedAt?: string;
}

export interface OpsTerminalJobHandle {
  jobId: string;
  startedAt: string;
}

export type OpsTerminalProgressListener = (snapshot: OpsTerminalJobProgress) => void;

function buildIntelligenceRequest(
  input: OpsRunInput,
  detected: DetectedInstagramUrl,
): IntelligencePipelineRequest {
  return buildTurboScanRequest(detected, {
    ...DEFAULT_TURBO_SCAN_SETTINGS,
    postCount: input.recentProfilePosts,
  });
}

function riskFromAccountHealth(competitor: CompetitorProfileInsight): string {
  const score = competitor.accountHealth?.score ?? 0;
  const status = competitor.accountHealth?.status ?? 'Stable';
  const critical = competitor.accountHealth?.ratios?.criticalPressure ?? 0;
  if (score < 55 || status === 'Under Pressure') {
    return 'Aggressive narrative capture risk against current positioning.';
  }
  if (critical >= 20 || status === 'At Risk') {
    return 'Audience pressure may shift share toward this competitor.';
  }
  if (competitor.overlapScore >= 65) {
    return 'High narrative overlap could dilute differentiation.';
  }
  return 'Watch positioning shifts and creator partnerships.';
}

function actionFromCompetitor(competitor: CompetitorProfileInsight): string {
  if (competitor.counterPosition) {
    return competitor.counterPosition;
  }
  if (competitor.opportunitySignals?.length) {
    return competitor.opportunitySignals[0];
  }
  if (competitor.extractedNarratives?.length) {
    return `Counter ${competitor.extractedNarratives[0].label.toLowerCase()} with evidence-led messaging.`;
  }
  return 'Track positioning and creator partnerships closely.';
}

function mapCompetitorProfiles(profiles: CompetitorProfileInsight[] = []): RunnerCompetitor[] {
  return profiles.slice(0, 3).map((profile) => ({
    id: profile.handle,
    name: profile.handle,
    handle: profile.handle,
    platform: 'instagram',
    profileUrl: profile.profileUrl,
    position: profile.positioningSummary || profile.reason || 'Positioning summary pending.',
    risk: profile.narrativePressure || riskFromAccountHealth(profile),
    action: actionFromCompetitor(profile),
    evidenceSnippets: profile.extractedNarratives?.map((n) => n.description).slice(0, 3) ?? [],
    evidenceUrls: profile.evidenceUrls,
    confidence: profile.confidence ?? (profile.overlapScore ? Math.min(1, profile.overlapScore / 100) : undefined),
    overlapScore: profile.overlapScore,
    healthStatus: profile.accountHealth?.status,
    topNarrative: profile.topNarrative,
    counterPosition: profile.counterPosition,
    verificationState: profile.verificationState,
    battlefieldSummary: profile.battlefieldSummary,
  }));
}

function pipelineResultToRunnerResponse(
  result: IntelligencePipelineResult,
  input: OpsRunInput,
  runtime: { startedAt: string; completedAt: string },
): RunnerOpsResponse {
  const fallbackSession = realRunnerResponseFixture.session;
  const session: Partial<RunnerSession> = result.session ?? {};
  const fullSession = result.session ?? ({} as Partial<typeof result.session>);

  const merged: RunnerOpsResponse['session'] = {
    ...fallbackSession,
    ...session,
    primaryProfileUrl: session.primaryProfileUrl ?? input.instagramPostUrl,
    postCount: session.postCount ?? input.recentProfilePosts,
    postUrls: session.postUrls?.length ? session.postUrls : [input.instagramPostUrl],
    parallelTasks: session.parallelTasks?.length ? session.parallelTasks : fallbackSession.parallelTasks,
    scrapedPosts: session.scrapedPosts ?? [],
    scrapedComments: session.scrapedComments ?? [],
    extractedNarratives: session.extractedNarratives ?? [],
    narratives: session.narratives ?? [],
    webEvidence: session.webEvidence ?? [],
    networkNodes: session.networkNodes ?? [],
    networkEdges: session.networkEdges ?? [],
    reviewQueue: session.reviewQueue ?? [],
    events: session.events?.length ? session.events : fallbackSession.events,
    accountHealth: session.accountHealth ?? fallbackSession.accountHealth,
    reportMetrics: session.reportMetrics ?? fallbackSession.reportMetrics,
    responsePlan: session.responsePlan ?? fallbackSession.responsePlan,
    approvals: session.approvals ?? [],
    supervision: session.supervision ?? fallbackSession.supervision,
    sources: session.sources ?? fallbackSession.sources,
    scrapeMode: session.scrapeMode ?? 'latest_n',
    platform: session.platform ?? 'instagram',
    status: 'completed',
    currentStage: session.currentStage ?? 'completed',
    progress: 100,
    createdAt: session.createdAt ?? runtime.startedAt,
    updatedAt: session.updatedAt ?? runtime.completedAt,
    actionQueue: session.actionQueue ?? [],
    clientId: session.clientId ?? fallbackSession.clientId,
    id: session.id ?? fallbackSession.id,
    competitors: mapCompetitorProfiles(fullSession?.competitorProfiles ?? []),
    audienceClusters: session.audienceClusters,
    intentDistribution: session.intentDistribution,
    strategicIntelligence: fullSession?.strategicIntelligence,
    providerDiagnostics: fullSession?.providerDiagnostics,
  };

  return {
    session: merged,
    sourceRuns: result.sourceRuns,
    audienceClusters: result.audienceClusters,
    intentDistribution: result.intentDistribution,
    runtime: {
      startedAt: runtime.startedAt,
      completedAt: runtime.completedAt,
      durationMs: Math.max(0, new Date(runtime.completedAt).getTime() - new Date(runtime.startedAt).getTime()),
    },
  };
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error || `Request failed with status ${response.status}.`;
      throw new Error(message);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Intelligence pipeline timed out. Try again with fewer posts or competitors disabled.');
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with status ${response.status}.`);
  }
  return payload as T;
}

function normalizeProgressSnapshot(value: any): OpsTerminalJobProgress {
  const activeStageIndex = Number.isFinite(value?.activeStageIndex)
    ? Math.max(0, Math.min(OPS_PIPELINE_STAGES.length - 1, value.activeStageIndex))
    : 0;
  const startedAt = value?.startedAt || new Date().toISOString();
  const completedAt = value?.completedAt;
  const elapsedMs = Number.isFinite(value?.elapsedMs)
    ? value.elapsedMs
    : Math.max(0, new Date(completedAt || new Date().toISOString()).getTime() - new Date(startedAt).getTime());
  return {
    jobId: value?.jobId || value?.id || '',
    phase: value?.phase === 'completed' || value?.phase === 'failed' ? value.phase : 'pending',
    progress: Math.max(0, Math.min(100, Number(value?.progress) || 0)),
    activeStageIndex,
    totalStages: value?.totalStages || OPS_PIPELINE_STAGES.length,
    currentStageLabel: value?.currentStageLabel || OPS_PIPELINE_STAGES[activeStageIndex]?.label || 'Dispatching pipeline',
    events: Array.isArray(value?.events) ? value.events : [],
    error: value?.error,
    startedAt,
    elapsedMs,
    completedAt,
  };
}

export function subscribeOpsTerminalJobProgress(
  jobId: string,
  listener: OpsTerminalProgressListener,
): () => void {
  const source = new EventSource(`${INTELLIGENCE_JOBS_ENDPOINT}/${encodeURIComponent(jobId)}/stream`);
  source.onmessage = (event) => {
    const snapshot = normalizeProgressSnapshot(JSON.parse(event.data));
    listener(snapshot);
    if (snapshot.phase === 'completed' || snapshot.phase === 'failed') {
      source.close();
    }
  };
  source.onerror = () => {
    source.close();
  };
  return () => {
    source.close();
  };
}

export async function startOpsTerminalJob(input: OpsRunInput): Promise<OpsTerminalJobHandle> {
  const validation = validateOpsTerminalInput(input);
  if (!validation.isValid || !validation.detected) {
    throw new Error(validation.error || 'Invalid Ops Terminal input.');
  }
  const request = buildIntelligenceRequest(input, validation.detected);
  const payload = await postJson<{ job: OpsTerminalJobProgress }>(INTELLIGENCE_JOBS_ENDPOINT, request);
  const snapshot = normalizeProgressSnapshot(payload.job);
  return {
    jobId: snapshot.jobId,
    startedAt: snapshot.startedAt,
  };
}

async function getOpsTerminalJobSnapshot(jobId: string): Promise<{ job: OpsTerminalJobProgress; result?: IntelligencePipelineResult }> {
  const payload = await getJson<{ job: any; result?: IntelligencePipelineResult }>(`${INTELLIGENCE_JOBS_ENDPOINT}/${encodeURIComponent(jobId)}`);
  return {
    job: normalizeProgressSnapshot(payload.job),
    result: payload.result,
  };
}

export async function getOpsTerminalJob(jobId: string): Promise<RunnerOpsResponse> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < REQUEST_TIMEOUT_MS) {
    const snapshot = await getOpsTerminalJobSnapshot(jobId);
    if (snapshot.job.phase === 'failed') {
      throw new Error(snapshot.job.error || 'Intelligence pipeline failed.');
    }
    if (snapshot.job.phase === 'completed') {
      if (!snapshot.result) throw new Error('Ops Terminal job completed without a result payload.');
      return pipelineResultToRunnerResponse(snapshot.result, {
        instagramPostUrl: snapshot.result.session.primaryProfileUrl || '',
        recentProfilePosts: snapshot.result.session.postCount || 1,
      }, {
        startedAt: snapshot.job.startedAt,
        completedAt: snapshot.job.completedAt || new Date().toISOString(),
      });
    }
    await new Promise(resolve => window.setTimeout(resolve, 1000));
  }
  throw new Error('Intelligence pipeline timed out. Try again with fewer posts or competitors disabled.');
}

export async function getOpsTerminalJobResults(jobId: string): Promise<RunnerOpsResponse> {
  return getOpsTerminalJob(jobId);
}

export async function getOpsTerminalJobEvents(jobId: string): Promise<RunnerEvent[]> {
  const snapshot = await getOpsTerminalJobSnapshot(jobId);
  return snapshot.result?.session.events ?? [];
}

export function getRunnerResponseSnapshot(): RunnerOpsResponse {
  return realRunnerResponseFixture;
}
