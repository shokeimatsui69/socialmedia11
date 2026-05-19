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

const INTELLIGENCE_ENDPOINT = '/api/intelligence/run';
const REQUEST_TIMEOUT_MS = 30 * 60 * 1000;
const PROGRESS_TICK_MS = 500;
const ESTIMATED_TOTAL_MS = 6 * 60 * 1000;

export type OpsTerminalJobPhase = 'pending' | 'completed' | 'failed';

export interface OpsTerminalLifecycleEvent {
  id: string;
  message: string;
  timestamp: string;
  milestone: 'started' | 'collecting' | 'narrative' | 'social_web' | 'audience_brand' | 'awaiting_response' | 'transforming' | 'ready' | 'failed';
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

interface JobState {
  jobId: string;
  input: OpsRunInput;
  detected: DetectedInstagramUrl;
  startedAt: number;
  completedAt?: number;
  phase: OpsTerminalJobPhase;
  progress: number;
  activeStageIndex: number;
  events: OpsTerminalLifecycleEvent[];
  emittedMilestones: Set<OpsTerminalLifecycleEvent['milestone']>;
  listeners: Set<OpsTerminalProgressListener>;
  tickHandle: number | null;
  resultPromise: Promise<RunnerOpsResponse>;
  resolveResult: (response: RunnerOpsResponse) => void;
  rejectResult: (error: Error) => void;
  response?: RunnerOpsResponse;
  error?: string;
}

const jobs = new Map<string, JobState>();
const totalStages = OPS_PIPELINE_STAGES.length;

function nowIso(): string {
  return new Date().toISOString();
}

function nowTimeLabel(): string {
  return new Date().toLocaleTimeString([], { hour12: false });
}

function deriveJobId(input: OpsRunInput): string {
  const handle = input.instagramPostUrl
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
    .toLowerCase();
  return `${handle || 'ops'}-${Date.now()}`;
}

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
    position: profile.positioningSummary || profile.reason || 'Positioning summary pending.',
    risk: riskFromAccountHealth(profile),
    action: actionFromCompetitor(profile),
    evidenceSnippets: profile.extractedNarratives?.map((n) => n.description).slice(0, 3) ?? [],
    confidence: profile.overlapScore ? Math.min(1, profile.overlapScore / 100) : undefined,
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

async function postIntelligencePipeline(body: IntelligencePipelineRequest): Promise<IntelligencePipelineResult> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(INTELLIGENCE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error || `Intelligence pipeline failed with status ${response.status}.`;
      throw new Error(message);
    }
    return payload as IntelligencePipelineResult;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Intelligence pipeline timed out. Try again with fewer posts or competitors disabled.');
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function currentStageLabelFor(activeStageIndex: number): string {
  return OPS_PIPELINE_STAGES[activeStageIndex]?.label ?? 'Awaiting mission launch';
}

function snapshotFor(job: JobState): OpsTerminalJobProgress {
  return {
    jobId: job.jobId,
    phase: job.phase,
    progress: job.progress,
    activeStageIndex: job.activeStageIndex,
    totalStages,
    currentStageLabel: currentStageLabelFor(job.activeStageIndex),
    events: [...job.events],
    error: job.error,
    startedAt: new Date(job.startedAt).toISOString(),
    elapsedMs: (job.completedAt ?? Date.now()) - job.startedAt,
    completedAt: job.completedAt ? new Date(job.completedAt).toISOString() : undefined,
  };
}

function emitMilestone(job: JobState, milestone: OpsTerminalLifecycleEvent['milestone'], message: string) {
  if (job.emittedMilestones.has(milestone)) return;
  job.emittedMilestones.add(milestone);
  job.events = [
    {
      id: `${job.jobId}-${milestone}`,
      message,
      timestamp: nowTimeLabel(),
      milestone,
    },
    ...job.events,
  ].slice(0, 32);
}

function notify(job: JobState) {
  const snapshot = snapshotFor(job);
  job.listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch {
      // Listener errors must not break other subscribers.
    }
  });
}

function pendingStageIndex(progress: number): number {
  const completedStages = Math.floor((progress / 100) * totalStages);
  return Math.max(0, Math.min(totalStages - 1, completedStages));
}

function startPendingTicker(job: JobState) {
  if (job.tickHandle !== null) return;
  job.tickHandle = window.setInterval(() => {
    if (job.phase !== 'pending') return;
    const elapsed = Date.now() - job.startedAt;
    const ratio = Math.min(elapsed / ESTIMATED_TOTAL_MS, 1);
    const cappedRatio = Math.min(ratio, 0.99);
    const easedProgress = Math.round((1 - Math.pow(1 - cappedRatio, 1.4)) * 100);
    job.progress = Math.max(job.progress, Math.min(99, easedProgress));
    job.activeStageIndex = pendingStageIndex(job.progress);

    if (job.progress >= 5) emitMilestone(job, 'started', 'Scan request started for the target profile.');
    if (job.progress >= 18) emitMilestone(job, 'collecting', 'Collecting Instagram profile and post data.');
    if (job.progress >= 50) emitMilestone(job, 'narrative', 'Extracting narratives from the collected corpus.');
    if (job.progress >= 65) emitMilestone(job, 'social_web', 'Searching X and web evidence for matching signals.');
    if (job.progress >= 80) emitMilestone(job, 'audience_brand', 'Building audience map and brand position summary.');
    if (job.progress >= 90) emitMilestone(job, 'awaiting_response', 'Waiting for runner response.');

    notify(job);
  }, PROGRESS_TICK_MS);
}

function stopPendingTicker(job: JobState) {
  if (job.tickHandle !== null) {
    window.clearInterval(job.tickHandle);
    job.tickHandle = null;
  }
}

function createJob(input: OpsRunInput, detected: DetectedInstagramUrl): JobState {
  let resolveResult: (response: RunnerOpsResponse) => void = () => {};
  let rejectResult: (error: Error) => void = () => {};
  const resultPromise = new Promise<RunnerOpsResponse>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  const job: JobState = {
    jobId: deriveJobId(input),
    input,
    detected,
    startedAt: Date.now(),
    phase: 'pending',
    progress: 2,
    activeStageIndex: 0,
    events: [],
    emittedMilestones: new Set(),
    listeners: new Set(),
    tickHandle: null,
    resultPromise,
    resolveResult,
    rejectResult,
  };

  const targetLabel =
    detected.type === 'profile'
      ? `@${detected.handle ?? 'target'} (profile)`
      : detected.type === 'reel'
        ? 'Instagram Reel'
        : 'Instagram post';
  emitMilestone(job, 'started', `Scan request started for ${targetLabel}.`);
  return job;
}

function runIntelligence(job: JobState) {
  const startedAtIso = new Date(job.startedAt).toISOString();
  postIntelligencePipeline(buildIntelligenceRequest(job.input, job.detected))
    .then((result) => {
      const completedAtIso = new Date().toISOString();
      const response = pipelineResultToRunnerResponse(result, job.input, {
        startedAt: startedAtIso,
        completedAt: completedAtIso,
      });
      emitMilestone(job, 'transforming', 'Transforming runner output into report sections.');
      job.response = response;
      job.progress = 100;
      job.activeStageIndex = totalStages - 1;
      job.phase = 'completed';
      job.completedAt = Date.now();
      emitMilestone(job, 'ready', 'Report ready. Intelligence briefing is available.');
      stopPendingTicker(job);
      notify(job);
      job.resolveResult(response);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Intelligence pipeline failed.';
      job.phase = 'failed';
      job.error = message;
      job.completedAt = Date.now();
      emitMilestone(job, 'failed', `Scan failed: ${message}`);
      stopPendingTicker(job);
      notify(job);
      job.rejectResult(new Error(message));
    });
}

export function subscribeOpsTerminalJobProgress(
  jobId: string,
  listener: OpsTerminalProgressListener,
): () => void {
  const job = jobs.get(jobId);
  if (!job) {
    return () => {};
  }
  job.listeners.add(listener);
  listener(snapshotFor(job));
  return () => {
    job.listeners.delete(listener);
  };
}

export async function startOpsTerminalJob(input: OpsRunInput): Promise<OpsTerminalJobHandle> {
  const validation = validateOpsTerminalInput(input);
  if (!validation.isValid || !validation.detected) {
    throw new Error(validation.error || 'Invalid Ops Terminal input.');
  }
  const job = createJob(input, validation.detected);
  jobs.set(job.jobId, job);
  startPendingTicker(job);
  notify(job);
  runIntelligence(job);
  return {
    jobId: job.jobId,
    startedAt: nowIso(),
  };
}

export async function getOpsTerminalJob(jobId: string): Promise<RunnerOpsResponse> {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error('Ops Terminal job not found. Start a new mission first.');
  }
  return job.resultPromise;
}

export async function getOpsTerminalJobResults(jobId: string): Promise<RunnerOpsResponse> {
  return getOpsTerminalJob(jobId);
}

export async function getOpsTerminalJobEvents(jobId: string): Promise<RunnerEvent[]> {
  const job = jobs.get(jobId);
  if (!job?.response) return [];
  return job.response.session.events ?? [];
}

export function getRunnerResponseSnapshot(): RunnerOpsResponse {
  return realRunnerResponseFixture;
}
