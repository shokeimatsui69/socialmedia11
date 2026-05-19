import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { OPS_PIPELINE_STAGES, DEFAULT_OPS_INPUT } from './data';
import {
  getOpsTerminalJobResults,
  startOpsTerminalJob,
  subscribeOpsTerminalJobProgress,
  validateOpsTerminalInput,
} from './api/opsTerminalApi';
import type {
  OpsTerminalJobProgress,
  OpsTerminalLifecycleEvent,
} from './api/opsTerminalApi';
import {
  emptyViewModelForInput,
  mapRunnerResponseToOpsTerminal,
} from './adapters/mapRunnerResponseToOpsTerminal';
import type {
  OpsMissionEventVM,
  OpsParallelTaskVM,
  OpsPipelineStageVM,
  OpsRunInput,
  OpsRunStatus,
  OpsRuntimeVM,
  OpsTerminalHeaderVM,
  OpsTerminalViewModel,
  RunnerOpsResponse,
  RunnerTaskStatus,
} from './types';
import { MissionHeader } from './components/MissionHeader';
import { StepNavigation, StepNavigationStatus } from './components/StepNavigation';
import { PipelineSummary } from './components/PipelineSummary';
import { MissionLog } from './components/MissionLog';
import { MissionSetupStep } from './components/MissionSetupStep';
import { ExecutiveSummaryStep } from './components/ExecutiveSummaryStep';
import { NarrativesStep } from './components/NarrativesStep';
import { SocialSignalsStep } from './components/SocialSignalsStep';
import { WebEvidenceStep } from './components/WebEvidenceStep';
import { AudienceMapStep } from './components/AudienceMapStep';
import { CompetitorsStep } from './components/CompetitorsStep';
import { BrandPositionStep } from './components/BrandPositionStep';

const MAX_LOG_EVENTS = 16;

const STEP_DEFINITIONS = [
  { id: 'mission_setup', label: 'Setup', helper: 'Configure target input and launch analysis.', unlockStage: -1 },
  { id: 'executive_summary', label: 'Summary', helper: 'Understand final direction quickly, then drill down.', unlockStage: 0 },
  { id: 'narratives_themes', label: 'Narratives', helper: 'Review extracted themes, sentiment, and narrative risk.', unlockStage: 3 },
  { id: 'social_signals', label: 'Social/X', helper: 'Inspect external social pressure and relevance.', unlockStage: 4 },
  { id: 'web_evidence', label: 'Web', helper: 'Validate themes with supporting evidence records.', unlockStage: 5 },
  { id: 'audience_map', label: 'Audience', helper: 'Compare segment share, influence, and sentiment.', unlockStage: 3 },
  { id: 'competitors', label: 'Competitors', helper: 'Compare top competitor positions.', unlockStage: 7 },
  { id: 'brand_position', label: 'Position', helper: 'Finalize SWOT briefing and recommendation.', unlockStage: 9 },
] as const;

type OpsStepId = (typeof STEP_DEFINITIONS)[number]['id'];

function nowTimeLabel(): string {
  return new Date().toLocaleTimeString([], { hour12: false });
}

function buildIdleEvent(): OpsMissionEventVM {
  return {
    id: `idle-${Date.now()}`,
    timestamp: nowTimeLabel(),
    message: 'System idle. Awaiting Instagram post URL and analysis depth.',
    tone: 'info',
  };
}

function lifecycleToMissionEvent(event: OpsTerminalLifecycleEvent): OpsMissionEventVM {
  const tone: OpsMissionEventVM['tone'] =
    event.milestone === 'failed'
      ? 'warning'
      : event.milestone === 'ready'
        ? 'success'
        : event.milestone === 'awaiting_response' || event.milestone === 'transforming'
          ? 'info'
          : 'running';
  return {
    id: event.id,
    timestamp: event.timestamp,
    message: event.message,
    tone,
  };
}

function readinessLabel(score: number): string {
  if (score >= 90) return 'Briefing Ready';
  if (score >= 70) return 'Near Ready';
  if (score >= 40) return 'Building';
  return 'Standby';
}

function deriveStageStatusForRun(
  index: number,
  activeStageIndex: number,
  runStatus: OpsRunStatus,
): OpsPipelineStageVM['status'] {
  if (runStatus === 'completed') return 'completed';
  if (runStatus === 'failed') return index < activeStageIndex ? 'completed' : 'waiting';
  if (runStatus === 'running') {
    if (index < activeStageIndex) return 'completed';
    if (index === activeStageIndex) return 'running';
  }
  return 'waiting';
}

function deriveTaskStatusForRun(
  baseStatus: RunnerTaskStatus,
  runStatus: OpsRunStatus,
): RunnerTaskStatus {
  if (runStatus === 'completed') return baseStatus === 'failed' ? 'failed' : 'completed';
  if (runStatus === 'failed') return 'waiting';
  if (runStatus === 'running') return 'running';
  return 'waiting';
}

interface LifecycleHeaderOverride {
  status: OpsRunStatus;
  progress: number;
  activeStageIndex: number;
  currentStageLabel: string;
  runtime: OpsRuntimeVM;
}

function overrideHeader(header: OpsTerminalHeaderVM, override: LifecycleHeaderOverride, totalStages: number): OpsTerminalHeaderVM {
  const completedStages =
    override.status === 'completed'
      ? totalStages
      : override.status === 'idle'
        ? 0
        : Math.max(0, override.activeStageIndex + 1);
  const readiness = override.status === 'idle' ? 0 : Math.min(96, override.progress);
  return {
    ...header,
    status: override.status,
    progress: override.progress,
    currentStageLabel: override.currentStageLabel,
    completedStages,
    readinessScore: readiness,
    readinessLabel: readinessLabel(readiness),
    runtime: override.runtime,
  };
}

function formatRuntimeDisplay(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function overridePipelineStages(stages: OpsPipelineStageVM[], activeStageIndex: number, runStatus: OpsRunStatus): OpsPipelineStageVM[] {
  return stages.map((stage, index) => ({
    ...stage,
    status: deriveStageStatusForRun(index, activeStageIndex, runStatus),
  }));
}

function overrideParallelTasks(tasks: OpsParallelTaskVM[], runStatus: OpsRunStatus): OpsParallelTaskVM[] {
  return tasks.map((task) => ({
    ...task,
    status: deriveTaskStatusForRun(task.status, runStatus),
    progress:
      runStatus === 'completed'
        ? 100
        : runStatus === 'failed'
          ? task.progress
          : runStatus === 'running'
            ? Math.min(95, Math.max(task.progress, 50))
            : 0,
  }));
}

export function OpsTerminalDemo() {
  const [input, setInput] = useState<OpsRunInput>(DEFAULT_OPS_INPUT);
  const [runStatus, setRunStatus] = useState<OpsRunStatus>('idle');
  const [activeStepId, setActiveStepId] = useState<OpsStepId>('mission_setup');
  const [error, setError] = useState('');
  const [runnerResponse, setRunnerResponse] = useState<RunnerOpsResponse | null>(null);
  const [lifecycle, setLifecycle] = useState<OpsTerminalJobProgress | null>(null);
  const [events, setEvents] = useState<OpsMissionEventVM[]>([buildIdleEvent()]);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    if (runStatus !== 'running') return;
    const handle = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(handle);
  }, [runStatus]);

  const totalStages = OPS_PIPELINE_STAGES.length;
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const activeJobIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
    };
  }, []);

  const completedView = useMemo<OpsTerminalViewModel | null>(() => {
    if (runStatus !== 'completed' || !runnerResponse) return null;
    return mapRunnerResponseToOpsTerminal(runnerResponse);
  }, [runStatus, runnerResponse]);

  const baseView = useMemo<OpsTerminalViewModel>(
    () => completedView ?? emptyViewModelForInput(input),
    [completedView, input],
  );

  const liveProgress = lifecycle?.progress ?? 0;
  const liveStageIndex = lifecycle?.activeStageIndex ?? -1;
  const liveStageLabel =
    lifecycle?.currentStageLabel ??
    (runStatus === 'idle'
      ? 'Awaiting mission launch'
      : runStatus === 'failed'
        ? 'Mission failed'
        : 'Dispatching pipeline');

  const liveRuntime: OpsRuntimeVM = useMemo(() => {
    if (runStatus === 'idle') {
      return { elapsedMs: 0, display: '00:00', state: 'idle' };
    }
    if (runStatus === 'completed' && completedView) {
      return completedView.header.runtime;
    }
    const startedAt = lifecycle?.startedAt;
    const startedMs = startedAt ? new Date(startedAt).getTime() : nowTick;
    const elapsedMs =
      lifecycle && runStatus === 'failed' && lifecycle.completedAt
        ? Math.max(0, new Date(lifecycle.completedAt).getTime() - startedMs)
        : Math.max(0, nowTick - startedMs);
    return {
      startedAt,
      completedAt: runStatus === 'failed' ? lifecycle?.completedAt : undefined,
      elapsedMs,
      display: formatRuntimeDisplay(elapsedMs),
      state: runStatus,
    };
  }, [runStatus, lifecycle, nowTick, completedView]);

  const view: OpsTerminalViewModel = useMemo(() => {
    if (runStatus === 'completed' && completedView) {
      return completedView;
    }

    const overriddenHeader = overrideHeader(
      baseView.header,
      {
        status: runStatus,
        progress:
          runStatus === 'completed'
            ? 100
            : runStatus === 'idle'
              ? 0
              : liveProgress,
        activeStageIndex: runStatus === 'idle' ? -1 : Math.max(0, liveStageIndex),
        currentStageLabel:
          runStatus === 'completed' ? 'Brand position package ready' : liveStageLabel,
        runtime: liveRuntime,
      },
      totalStages,
    );

    const overriddenStages = overridePipelineStages(baseView.pipeline.stages, liveStageIndex, runStatus);
    const overriddenTasks = overrideParallelTasks(baseView.pipeline.parallelTasks, runStatus);

    return {
      ...baseView,
      header: overriddenHeader,
      pipeline: {
        ...baseView.pipeline,
        stages: overriddenStages,
        parallelTasks: overriddenTasks,
        activeStageIndex: liveStageIndex,
      },
      setup: {
        ...baseView.setup,
        primaryProfileUrl: baseView.setup.primaryProfileUrl || input.instagramPostUrl,
        postCount: baseView.setup.postCount || input.recentProfilePosts,
        postUrls: baseView.setup.postUrls.length ? baseView.setup.postUrls : [input.instagramPostUrl],
      },
    };
  }, [baseView, completedView, runStatus, liveProgress, liveStageIndex, liveStageLabel, liveRuntime, totalStages, input]);

  const isStepUnlocked = useCallback(
    (stepId: OpsStepId): boolean => {
      const definition = STEP_DEFINITIONS.find((item) => item.id === stepId);
      if (!definition) return false;
      if (stepId === 'mission_setup') return true;
      if (runStatus === 'idle') return false;
      if (runStatus === 'failed') return stepId === 'executive_summary';
      if (stepId === 'executive_summary') return true;
      if (runStatus === 'completed') return true;
      return liveStageIndex >= definition.unlockStage;
    },
    [runStatus, liveStageIndex],
  );

  const stepItems = useMemo(() => {
    return STEP_DEFINITIONS.map((step) => {
      const unlocked = isStepUnlocked(step.id);
      let status: StepNavigationStatus = 'locked';

      if (unlocked) {
        if (step.id === activeStepId) {
          status =
            runStatus === 'running'
              ? 'running'
              : runStatus === 'completed' && step.id !== 'mission_setup'
                ? 'complete'
                : 'available';
        } else if (step.id === 'mission_setup') {
          status = runStatus === 'idle' ? 'available' : 'complete';
        } else if (runStatus === 'completed') {
          status = 'complete';
        } else if (liveStageIndex > step.unlockStage) {
          status = 'complete';
        } else {
          status = 'available';
        }
      }

      return { id: step.id, label: step.label, helper: step.helper, status };
    });
  }, [activeStepId, liveStageIndex, runStatus, isStepUnlocked]);

  const startRun = async () => {
    const validation = validateOpsTerminalInput(input);
    if (!validation.isValid || !validation.detected) {
      setError(validation.error || 'Enter a valid Instagram profile, post, or reel URL.');
      return;
    }

    setError('');
    setRunnerResponse(null);
    setLifecycle(null);
    setActiveStepId('executive_summary');
    const detected = validation.detected;
    const targetLabel =
      detected.type === 'profile'
        ? `profile @${detected.handle ?? 'target'}`
        : detected.type === 'reel'
          ? `reel ${detected.shortcode ?? ''}`.trim()
          : `post ${detected.shortcode ?? ''}`.trim();
    setEvents([
      {
        id: `evt-init-${Date.now()}`,
        timestamp: nowTimeLabel(),
        message: `Mission initialized for ${targetLabel} with ${input.recentProfilePosts} profile posts.`,
        tone: 'info',
      },
    ]);
    setRunStatus('running');

    unsubscribeRef.current?.();

    let jobId: string;
    try {
      const handle = await startOpsTerminalJob(input);
      jobId = handle.jobId;
      activeJobIdRef.current = jobId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start mission.';
      setError(message);
      setRunStatus('failed');
      setEvents((current) => [
        {
          id: `evt-fail-${Date.now()}`,
          timestamp: nowTimeLabel(),
          message: `Scan failed: ${message}`,
          tone: 'warning',
        },
        ...current,
      ]);
      return;
    }

    const unsubscribe = subscribeOpsTerminalJobProgress(jobId, (snapshot) => {
      if (activeJobIdRef.current !== snapshot.jobId) return;
      setLifecycle(snapshot);
      setEvents((current) => {
        const existing = new Set(current.map((event) => event.id));
        const additions = snapshot.events
          .filter((event) => !existing.has(event.id))
          .map(lifecycleToMissionEvent);
        if (additions.length === 0) return current;
        return [...additions, ...current].slice(0, MAX_LOG_EVENTS);
      });
    });
    unsubscribeRef.current = unsubscribe;

    try {
      const response = await getOpsTerminalJobResults(jobId);
      if (activeJobIdRef.current !== jobId) return;
      setRunnerResponse(response);
      setRunStatus('completed');
    } catch (err) {
      if (activeJobIdRef.current !== jobId) return;
      const message = err instanceof Error ? err.message : 'Scan failed.';
      setError(message);
      setRunStatus('failed');
    }
  };

  const reset = () => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    activeJobIdRef.current = null;
    setRunStatus('idle');
    setActiveStepId('mission_setup');
    setError('');
    setRunnerResponse(null);
    setLifecycle(null);
    setEvents([buildIdleEvent()]);
  };

  const renderStep = () => {
    if (runStatus === 'failed' && activeStepId !== 'mission_setup') {
      return (
        <section className="space-y-6">
          <header className="space-y-1.5">
            <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
              Mission Status
            </p>
            <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">Scan failed</h2>
            <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
              The intelligence pipeline did not return a result for this mission. Review the error below and
              relaunch from Setup.
            </p>
          </header>
          <div className="border border-terminal-red/30 bg-terminal-red/[0.06] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-red/90">
              Pipeline error
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-terminal-text/85">
              {error || 'The runner did not return a response.'}
            </p>
          </div>
        </section>
      );
    }

    switch (activeStepId) {
      case 'mission_setup':
        return (
          <MissionSetupStep
            input={input}
            setup={view.setup}
            error={error}
            runStatus={runStatus}
            onInstagramPostUrlChange={(value) => setInput((prev) => ({ ...prev, instagramPostUrl: value }))}
            onRecentProfilePostsChange={(value) =>
              setInput((prev) => ({
                ...prev,
                recentProfilePosts: Number.isFinite(value) ? Math.max(1, Math.min(30, value)) : 1,
              }))
            }
            onStart={startRun}
            onReset={reset}
          />
        );
      case 'executive_summary':
        return <ExecutiveSummaryStep summary={view.executiveSummary} runStatus={runStatus} />;
      case 'narratives_themes':
        return <NarrativesStep narratives={view.narratives} />;
      case 'social_signals':
        return <SocialSignalsStep signals={view.socialSignals} />;
      case 'web_evidence':
        return <WebEvidenceStep evidence={view.webEvidence} />;
      case 'audience_map':
        return <AudienceMapStep map={view.audienceMap} />;
      case 'competitors':
        return <CompetitorsStep competitors={view.competitors} />;
      case 'brand_position':
        return <BrandPositionStep position={view.brandPosition} panel={view.brandPositionPanel} />;
      default:
        return null;
    }
  };

  const combinedEvents = useMemo(() => {
    const runner = runStatus === 'completed' ? view.events.slice(0, MAX_LOG_EVENTS) : [];
    return [...events, ...runner].slice(0, MAX_LOG_EVENTS * 2);
  }, [events, view.events, runStatus]);

  return (
    <div className="relative mx-auto flex h-full max-h-full w-full max-w-[1720px] min-h-[720px] flex-col overflow-hidden border-x border-white/[0.05] bg-terminal-bg text-terminal-text font-mono">
      <MissionHeader header={view.header} />

      <div className="relative flex-1 overflow-hidden">
        <div className="terminal-grid pointer-events-none absolute inset-0 opacity-60" />

        <div className="relative flex h-full flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-[1320px] px-8 pt-5">
            <StepNavigation
              steps={stepItems}
              activeStepId={activeStepId}
              onStepChange={(stepId) => setActiveStepId(stepId as OpsStepId)}
            />
          </div>

          <div className="mx-auto mt-3 w-full max-w-[1320px] px-8">
            <PipelineSummary
              stages={view.pipeline.stages}
              parallelTasks={view.pipeline.parallelTasks}
              progress={view.header.progress}
              completedStages={view.header.completedStages}
              totalStages={view.header.totalStages}
              runStatus={runStatus}
            />
          </div>

          <div className="no-scrollbar mt-5 min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeStepId + runStatus}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="mx-auto w-full max-w-[1320px] px-8 pb-12"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-5 right-6 z-30">
          <MissionLog events={combinedEvents} runStatus={runStatus} />
        </div>
      </div>
    </div>
  );
}
