import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { OPS_PIPELINE_STAGES, DEFAULT_OPS_INPUT } from './data';
import { getOpsTerminalJobResults, startOpsTerminalJob } from './api/opsTerminalApi';
import {
  emptyViewModelForInput,
  mapRunnerResponseToOpsTerminal,
} from './adapters/mapRunnerResponseToOpsTerminal';
import type {
  OpsMissionEventVM,
  OpsRunInput,
  OpsRunStatus,
  OpsTerminalViewModel,
  RunnerOpsResponse,
  RunnerSession,
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

const STAGE_INTERVAL_MS = 900;
const MAX_LOG_EVENTS = 14;

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

function isInstagramPostUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?instagram\.com\/p\/[^/\s]+\/?$/i.test(url.trim());
}

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

function cloneResponseWithProgress(
  base: RunnerOpsResponse,
  overrides: Partial<RunnerSession>,
): RunnerOpsResponse {
  return {
    session: {
      ...base.session,
      ...overrides,
    },
  };
}

export function OpsTerminalDemo() {
  const [input, setInput] = useState<OpsRunInput>(DEFAULT_OPS_INPUT);
  const [runStatus, setRunStatus] = useState<OpsRunStatus>('idle');
  const [activeStage, setActiveStage] = useState<number>(-1);
  const [activeStepId, setActiveStepId] = useState<OpsStepId>('mission_setup');
  const [error, setError] = useState('');
  const [runnerResponse, setRunnerResponse] = useState<RunnerOpsResponse | null>(null);
  const [events, setEvents] = useState<OpsMissionEventVM[]>([buildIdleEvent()]);
  const totalStages = OPS_PIPELINE_STAGES.length;
  const cancelTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (runStatus !== 'running' || !runnerResponse) return;

    const timer = window.setInterval(() => {
      setActiveStage((prev) => {
        const next = prev + 1;
        if (next >= totalStages) {
          setRunStatus('completed');
          setEvents((current) => [
            {
              id: `evt-complete-${Date.now()}`,
              timestamp: nowTimeLabel(),
              message: 'Pipeline complete. Brand position package is ready for briefing.',
              tone: 'success',
            },
            ...current.slice(0, MAX_LOG_EVENTS - 1),
          ]);
          return prev;
        }

        setEvents((current) => [
          {
            id: `evt-stage-${next}-${Date.now()}`,
            timestamp: nowTimeLabel(),
            message: `Stage ${next + 1}/${totalStages}: ${OPS_PIPELINE_STAGES[next].label}`,
            tone: 'running',
          },
          ...current.slice(0, MAX_LOG_EVENTS - 1),
        ]);

        return next;
      });
    }, STAGE_INTERVAL_MS);

    cancelTickRef.current = timer;
    return () => window.clearInterval(timer);
  }, [runStatus, runnerResponse, totalStages]);

  const liveResponse = useMemo<RunnerOpsResponse | null>(() => {
    if (!runnerResponse) return null;
    if (runStatus === 'completed') {
      return cloneResponseWithProgress(runnerResponse, {
        status: 'completed',
        currentStage: 'completed',
        progress: 100,
      });
    }
    if (runStatus === 'running') {
      const progress = Math.min(99, Math.max(5, Math.round(((activeStage + 1) / totalStages) * 100)));
      return cloneResponseWithProgress(runnerResponse, {
        status: 'active',
        progress,
      });
    }
    return cloneResponseWithProgress(runnerResponse, {
      status: 'idle',
      progress: 0,
    });
  }, [runnerResponse, runStatus, activeStage, totalStages]);

  const view: OpsTerminalViewModel = useMemo(
    () => (liveResponse ? mapRunnerResponseToOpsTerminal(liveResponse) : emptyViewModelForInput(input)),
    [liveResponse, input],
  );

  const isStepUnlocked = (stepId: OpsStepId): boolean => {
    const definition = STEP_DEFINITIONS.find((item) => item.id === stepId);
    if (!definition) return false;
    if (stepId === 'mission_setup') return true;
    if (runStatus === 'idle') return false;
    if (stepId === 'executive_summary') return true;
    if (runStatus === 'completed') return true;
    return activeStage >= definition.unlockStage;
  };

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
        } else if (activeStage > step.unlockStage) {
          status = 'complete';
        } else {
          status = 'available';
        }
      }

      return { id: step.id, label: step.label, helper: step.helper, status };
    });
  }, [activeStepId, activeStage, runStatus]);

  const startRun = async () => {
    if (!isInstagramPostUrl(input.instagramPostUrl)) {
      setError('Enter a valid Instagram post URL (example: https://www.instagram.com/p/POST_ID/).');
      return;
    }
    if (input.recentProfilePosts < 1 || input.recentProfilePosts > 30) {
      setError('Recent profile posts must be between 1 and 30.');
      return;
    }

    setError('');
    setActiveStage(-1);
    setActiveStepId('executive_summary');
    setEvents([
      {
        id: `evt-init-${Date.now()}`,
        timestamp: nowTimeLabel(),
        message: `Mission initialized for ${input.instagramPostUrl} with ${input.recentProfilePosts} profile posts.`,
        tone: 'info',
      },
      {
        id: `evt-dispatch-${Date.now()}`,
        timestamp: nowTimeLabel(),
        message: 'Pipeline dispatch confirmed. Stage execution started.',
        tone: 'running',
      },
    ]);

    try {
      const handle = await startOpsTerminalJob(input);
      const response = await getOpsTerminalJobResults(handle.jobId);
      setRunnerResponse(response);
      setRunStatus('running');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start mission.';
      setError(message);
      setRunStatus('idle');
    }
  };

  const reset = () => {
    if (cancelTickRef.current) window.clearInterval(cancelTickRef.current);
    setRunStatus('idle');
    setActiveStage(-1);
    setActiveStepId('mission_setup');
    setError('');
    setRunnerResponse(null);
    setEvents([buildIdleEvent()]);
  };

  const renderStep = () => {
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
        return <BrandPositionStep position={view.brandPosition} />;
      default:
        return null;
    }
  };

  const combinedEvents = useMemo(() => {
    const live = events;
    const runner = runStatus === 'idle' ? [] : view.events.slice(0, MAX_LOG_EVENTS);
    return [...live, ...runner].slice(0, MAX_LOG_EVENTS * 2);
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
                key={activeStepId}
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
