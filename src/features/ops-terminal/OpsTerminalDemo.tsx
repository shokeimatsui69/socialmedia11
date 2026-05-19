import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { createDemoResult, DEFAULT_OPS_INPUT, OPS_PIPELINE_STAGES } from './data';
import { OpsRunInput, PipelineStatus } from './types';
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
  {
    id: 'mission_setup',
    label: 'Setup',
    helper: 'Configure target input and launch analysis.',
    unlockStage: -1,
  },
  {
    id: 'executive_summary',
    label: 'Summary',
    helper: 'Understand final direction quickly, then drill down.',
    unlockStage: 0,
  },
  {
    id: 'narratives_themes',
    label: 'Narratives',
    helper: 'Review extracted themes, sentiment, and narrative risk.',
    unlockStage: 3,
  },
  {
    id: 'social_signals',
    label: 'Social/X',
    helper: 'Inspect external social pressure and relevance.',
    unlockStage: 4,
  },
  {
    id: 'web_evidence',
    label: 'Web',
    helper: 'Validate themes with supporting evidence records.',
    unlockStage: 5,
  },
  {
    id: 'audience_map',
    label: 'Audience',
    helper: 'Compare segment share, influence, and sentiment.',
    unlockStage: 3,
  },
  {
    id: 'competitors',
    label: 'Competitors',
    helper: 'Compare exactly top 3 competitor positions.',
    unlockStage: 7,
  },
  {
    id: 'brand_position',
    label: 'Position',
    helper: 'Finalize SWOT briefing and recommendation.',
    unlockStage: 9,
  },
] as const;

type OpsStepId = (typeof STEP_DEFINITIONS)[number]['id'];
type MissionEventTone = 'info' | 'running' | 'success' | 'warning';

interface MissionEvent {
  id: string;
  timestamp: string;
  message: string;
  tone: MissionEventTone;
}

function isInstagramPostUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?instagram\.com\/p\/[^/\s]+\/?$/i.test(url.trim());
}

function createMissionEvent(message: string, tone: MissionEventTone = 'info'): MissionEvent {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toLocaleTimeString([], { hour12: false }),
    message,
    tone,
  };
}

function readinessLabel(score: number): string {
  if (score >= 90) return 'Briefing Ready';
  if (score >= 70) return 'Near Ready';
  if (score >= 40) return 'Building';
  return 'Standby';
}

export function OpsTerminalDemo() {
  const [input, setInput] = useState<OpsRunInput>(DEFAULT_OPS_INPUT);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [activeStage, setActiveStage] = useState(-1);
  const [activeStepId, setActiveStepId] = useState<OpsStepId>('mission_setup');
  const [error, setError] = useState('');
  const [result, setResult] = useState(createDemoResult(DEFAULT_OPS_INPUT));
  const [events, setEvents] = useState<MissionEvent[]>(() => [
    createMissionEvent('System idle. Awaiting Instagram post URL and analysis depth.'),
  ]);

  useEffect(() => {
    if (runStatus !== 'running') return;

    const timer = window.setInterval(() => {
      setActiveStage((prev) => {
        const next = prev + 1;
        if (next >= OPS_PIPELINE_STAGES.length) {
          setRunStatus('completed');
          setEvents((current) => {
            const completionEvent = createMissionEvent(
              'Pipeline complete. Brand position package is ready for briefing.',
              'success',
            );
            return [completionEvent, ...current.slice(0, MAX_LOG_EVENTS - 1)];
          });
          return prev;
        }

        setEvents((current) => {
          const stageEvent = createMissionEvent(
            `Stage ${next + 1}/${OPS_PIPELINE_STAGES.length}: ${OPS_PIPELINE_STAGES[next].label}`,
            'running',
          );
          return [stageEvent, ...current.slice(0, MAX_LOG_EVENTS - 1)];
        });
        return next;
      });
    }, STAGE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [runStatus]);

  const stages = useMemo(
    () =>
      OPS_PIPELINE_STAGES.map((stage, index) => {
        let status: PipelineStatus = 'waiting';
        if (activeStage > index || runStatus === 'completed') status = 'completed';
        if (activeStage === index && runStatus === 'running') status = 'running';
        return { ...stage, status };
      }),
    [activeStage, runStatus],
  );

  const progress = useMemo(() => {
    if (runStatus === 'idle') return 0;
    const completed = Math.max(0, activeStage + (runStatus === 'completed' ? 1 : 0));
    return Math.min(100, Math.round((completed / OPS_PIPELINE_STAGES.length) * 100));
  }, [activeStage, runStatus]);

  const completedStages = useMemo(() => {
    if (runStatus === 'completed') return OPS_PIPELINE_STAGES.length;
    if (runStatus === 'running') return Math.max(0, activeStage + 1);
    return 0;
  }, [activeStage, runStatus]);

  const currentStageLabel = useMemo(() => {
    if (runStatus === 'idle') return 'Awaiting mission launch';
    if (runStatus === 'completed') return 'Brand position package ready';
    if (activeStage < 0) return 'Initializing stage dispatch';
    return OPS_PIPELINE_STAGES[activeStage]?.label ?? 'Dispatching pipeline';
  }, [activeStage, runStatus]);

  const confidenceScore = useMemo(() => {
    const confidenceTotal = result.webEvidence.reduce((sum, item) => sum + item.confidence, 0);
    return Math.round(confidenceTotal / Math.max(1, result.webEvidence.length));
  }, [result]);

  const readinessScore = useMemo(() => {
    if (runStatus === 'idle') return 0;
    if (runStatus === 'completed') return 96;
    return Math.max(8, Math.round(progress * 0.9));
  }, [progress, runStatus]);

  const canShowNarratives = activeStage >= 3 || runStatus === 'completed';
  const canShowSocialSignals = activeStage >= 4 || runStatus === 'completed';
  const canShowWebEvidence = activeStage >= 5 || runStatus === 'completed';
  const canShowAudienceMap = activeStage >= 3 || runStatus === 'completed';
  const canShowCompetitors = activeStage >= 7 || runStatus === 'completed';
  const canShowAudienceStatus = activeStage >= 8 || runStatus === 'completed';
  const canShowBrandPosition = activeStage >= 9 || runStatus === 'completed';

  const missionTitle = `${result.accountHandle} Signal Positioning Mission`;

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

      return {
        id: step.id,
        label: step.label,
        helper: step.helper,
        status,
      };
    });
  }, [activeStepId, activeStage, runStatus]);

  const startRun = () => {
    if (!isInstagramPostUrl(input.instagramPostUrl)) {
      setError('Enter a valid Instagram post URL (example: https://www.instagram.com/p/POST_ID/).');
      return;
    }
    if (input.recentProfilePosts < 1 || input.recentProfilePosts > 30) {
      setError('Recent profile posts must be between 1 and 30.');
      return;
    }

    setError('');
    setResult(createDemoResult(input));
    setRunStatus('running');
    setActiveStage(-1);
    setActiveStepId('executive_summary');
    setEvents([
      createMissionEvent(`Mission initialized for ${input.instagramPostUrl} with ${input.recentProfilePosts} profile posts.`),
      createMissionEvent('Pipeline dispatch confirmed. Stage execution started.', 'running'),
    ]);
  };

  const reset = () => {
    setRunStatus('idle');
    setActiveStage(-1);
    setActiveStepId('mission_setup');
    setError('');
    setResult(createDemoResult(input));
    setEvents([createMissionEvent('System idle. Awaiting Instagram post URL and analysis depth.')]);
  };

  const renderStep = () => {
    switch (activeStepId) {
      case 'mission_setup':
        return (
          <MissionSetupStep
            input={input}
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
        return (
          <ExecutiveSummaryStep
            result={result}
            runStatus={runStatus}
            canShowAudienceStatus={canShowAudienceStatus}
            canShowBrandPosition={canShowBrandPosition}
          />
        );
      case 'narratives_themes':
        return <NarrativesStep result={result} isReady={canShowNarratives} />;
      case 'social_signals':
        return <SocialSignalsStep result={result} isReady={canShowSocialSignals} />;
      case 'web_evidence':
        return <WebEvidenceStep result={result} isReady={canShowWebEvidence} />;
      case 'audience_map':
        return <AudienceMapStep result={result} isReady={canShowAudienceMap} />;
      case 'competitors':
        return <CompetitorsStep result={result} isReady={canShowCompetitors} />;
      case 'brand_position':
        return <BrandPositionStep result={result} isReady={canShowBrandPosition} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative mx-auto flex h-full max-h-full w-full max-w-[1720px] min-h-[720px] flex-col overflow-hidden border-x border-white/[0.05] bg-terminal-bg text-terminal-text font-mono">
      <MissionHeader
        missionTitle={missionTitle}
        runStatus={runStatus}
        currentStageLabel={currentStageLabel}
        completedStages={completedStages}
        totalStages={OPS_PIPELINE_STAGES.length}
        progress={progress}
        confidenceScore={confidenceScore}
        readinessScore={readinessScore}
        readinessLabel={readinessLabel(readinessScore)}
      />

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
              stages={stages}
              progress={progress}
              completedStages={completedStages}
              totalStages={OPS_PIPELINE_STAGES.length}
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
          <MissionLog events={events} runStatus={runStatus} />
        </div>
      </div>
    </div>
  );
}
