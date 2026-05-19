import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crosshair,
  Globe,
  Layout,
  Minus,
  Play,
  Radar,
  ShieldCheck,
  Target,
  Terminal,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui/Primitives';
import { cn } from '../../lib/utils';
import { createDemoResult, DEFAULT_OPS_INPUT, OPS_PIPELINE_STAGES } from './data';
import { OpsDemoResult, OpsRunInput, PipelineStatus } from './types';

const STAGE_INTERVAL_MS = 900;
const MAX_LOG_EVENTS = 14;

const FLOW_CHAIN = [
  'Instagram Post',
  'Profile Scrape',
  'Narratives',
  'X / Web Signals',
  'Competitors',
  'Audience Status',
  'Brand Position',
] as const;
const FLOW_STAGE_THRESHOLDS = [0, 2, 3, 5, 7, 8, 9] as const;

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

function toneClass(tone: MissionEventTone): string {
  if (tone === 'success') return 'border-terminal-green/35 bg-terminal-green/[0.05]';
  if (tone === 'warning') return 'border-terminal-red/30 bg-terminal-red/[0.06]';
  if (tone === 'running') return 'border-terminal-amber/35 bg-terminal-amber/[0.05]';
  return 'border-terminal-border/25 bg-black/25';
}

function trendIcon(trend: 'up' | 'stable' | 'down') {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-terminal-green" />;
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-terminal-red/70" />;
  return <Minus className="h-3.5 w-3.5 text-terminal-amber/80" />;
}

function trendBarClass(trend: 'up' | 'stable' | 'down'): string {
  if (trend === 'up') return 'bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.35)]';
  if (trend === 'down') return 'bg-terminal-red/80 shadow-[0_0_10px_rgba(255,77,77,0.28)]';
  return 'bg-terminal-amber/80 shadow-[0_0_10px_rgba(255,176,32,0.22)]';
}

function readinessLabel(score: number): string {
  if (score >= 90) return 'Briefing Ready';
  if (score >= 70) return 'Near Ready';
  if (score >= 40) return 'Building';
  return 'Standby';
}

function riskLevel(riskText: string): 'HIGH' | 'MEDIUM' | 'WATCH' {
  const risk = riskText.toLowerCase();
  if (risk.includes('capture') || risk.includes('aggressive')) return 'HIGH';
  if (risk.includes('shift') || risk.includes('dilute') || risk.includes('overlap')) return 'MEDIUM';
  return 'WATCH';
}

function riskBadgeClass(level: 'HIGH' | 'MEDIUM' | 'WATCH'): string {
  if (level === 'HIGH') return 'text-terminal-red border-terminal-red/30 bg-terminal-red/[0.08]';
  if (level === 'MEDIUM') return 'text-terminal-amber border-terminal-amber/30 bg-terminal-amber/[0.08]';
  return 'text-terminal-text/70 border-terminal-border/30 bg-black/25';
}

function detectedReason(text: string): string {
  const cleaned = text.replace(/\.$/, '').trim();
  return cleaned.length > 88 ? `${cleaned.slice(0, 85)}...` : cleaned;
}

export function OpsTerminalDemo() {
  const [input, setInput] = useState<OpsRunInput>(DEFAULT_OPS_INPUT);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [activeStage, setActiveStage] = useState(-1);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OpsDemoResult | null>(null);
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
    if (!result) return 0;
    const confidenceTotal = result.webEvidence.reduce((sum, item) => sum + item.confidence, 0);
    return Math.round(confidenceTotal / Math.max(1, result.webEvidence.length));
  }, [result]);

  const readinessScore = useMemo(() => {
    if (runStatus === 'idle') return 0;
    if (runStatus === 'completed') return 96;
    return Math.max(8, Math.round(progress * 0.9));
  }, [progress, runStatus]);

  const missionStatusLabel = runStatus === 'idle' ? 'Standby' : runStatus === 'running' ? 'Running' : 'Completed';
  const missionStatusVariant =
    runStatus === 'completed' ? 'positive' : runStatus === 'running' ? 'neutral' : 'outline';

  const flowCompletionIndex = useMemo(() => {
    if (runStatus === 'completed') return FLOW_CHAIN.length - 1;
    if (activeStage < 0 || runStatus === 'idle') return -1;
    return FLOW_STAGE_THRESHOLDS.reduce((acc, threshold, idx) => (activeStage >= threshold ? idx : acc), -1);
  }, [activeStage, runStatus]);

  const canShowCoreResults = activeStage >= 3 || runStatus === 'completed';
  const canShowSignals = activeStage >= 5 || runStatus === 'completed';
  const canShowCompetitors = activeStage >= 7 || runStatus === 'completed';
  const canShowAudienceStatus = activeStage >= 8 || runStatus === 'completed';
  const canShowStatusAndPosition = activeStage >= 9 || runStatus === 'completed';

  const dominantAudienceSegment = useMemo(() => {
    if (!result?.followerMap.length) return null;
    return result.followerMap.reduce((best, segment) => (segment.share > best.share ? segment : best), result.followerMap[0]);
  }, [result]);

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
    setEvents([
      createMissionEvent(
        `Mission initialized for ${input.instagramPostUrl} with ${input.recentProfilePosts} profile posts.`,
      ),
      createMissionEvent('Pipeline dispatch confirmed. Stage execution started.', 'running'),
    ]);
  };

  const reset = () => {
    setRunStatus('idle');
    setActiveStage(-1);
    setResult(null);
    setError('');
    setEvents([createMissionEvent('System idle. Awaiting Instagram post URL and analysis depth.')]);
  };

  return (
    <div className="mx-auto flex h-full max-h-full w-full max-w-[1720px] min-h-[720px] flex-col overflow-hidden border-x border-terminal-border/35 bg-terminal-bg text-terminal-text font-mono">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 border-b border-terminal-border/40 bg-black/55 px-7 py-3"
      >
        <div className="flex items-start gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-terminal-green/30 bg-terminal-green/[0.05]">
              <Terminal className="h-4 w-4 text-terminal-green" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-terminal-text/45">
                Live Operations Mission Control
              </p>
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.08em] text-terminal-text/90">
                {result ? `${result.accountHandle} Signal Positioning Mission` : 'Instagram Signal Positioning Mission'}
              </p>
            </div>
          </div>

          <Badge variant={missionStatusVariant} className="h-6 text-[8px] tracking-[0.14em]">
            {missionStatusLabel}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <div className="border border-terminal-border/25 bg-black/30 px-3 py-2">
            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-terminal-text/40">Current Stage</p>
            <p className="truncate pt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-terminal-text/80">
              {currentStageLabel}
            </p>
          </div>
          <div className="border border-terminal-border/25 bg-black/30 px-3 py-2">
            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-terminal-text/40">Pipeline Progress</p>
            <p className="pt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-terminal-text/80">
              {completedStages}/{OPS_PIPELINE_STAGES.length} Stages ({progress}%)
            </p>
            <div className="mt-2 h-[2px] bg-white/5">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="h-full bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.35)]"
              />
            </div>
          </div>
          <div className="border border-terminal-border/25 bg-black/30 px-3 py-2">
            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-terminal-text/40">
              Intelligence Confidence
            </p>
            <p className="pt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-terminal-green/80">
              {confidenceScore || 0}%
            </p>
            <div className="mt-2 h-[2px] bg-white/5">
              <motion.div
                animate={{ width: `${confidenceScore}%` }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="h-full bg-terminal-green/90"
              />
            </div>
          </div>
          <div className="border border-terminal-border/25 bg-black/30 px-3 py-2">
            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-terminal-text/40">Readiness</p>
            <div className="pt-1 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-terminal-text/80">
                {readinessLabel(readinessScore)}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-terminal-green/70">
                {readinessScore}%
              </p>
            </div>
            <div className="mt-2 h-[2px] bg-white/5">
              <motion.div
                animate={{ width: `${readinessScore}%` }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="h-full bg-terminal-amber/90"
              />
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-terminal-border/20 pt-2">
          <div className="flex items-center gap-1.5 px-2">
            <Layout className="h-3 w-3 text-terminal-text/55" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-terminal-text/52">Mission Flow</span>
          </div>
          {FLOW_CHAIN.map((step, idx) => (
            <div key={step} className="flex items-center gap-1">
              <span
                className={cn(
                  'text-[8px] uppercase tracking-[0.12em]',
                  idx <= flowCompletionIndex
                    ? 'text-terminal-green/75'
                    : idx === flowCompletionIndex + 1 && runStatus === 'running'
                      ? 'text-terminal-amber/80'
                      : 'text-terminal-text/48',
                )}
              >
                {step}
              </span>
              {idx < FLOW_CHAIN.length - 1 && <ChevronRight className="h-3 w-3 text-terminal-text/25" />}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="flex-1 overflow-hidden px-6 py-5 terminal-grid">
        <div className="flex h-full gap-4 overflow-hidden">
          <div className="flex w-[330px] shrink-0 flex-col gap-4 overflow-hidden">
            <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="console-panel border-terminal-border/40 bg-black/45 p-4">
                <div className="mb-4 flex items-center justify-between border-b border-terminal-border/20 pb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/55">
                    Mission Intake
                  </h3>
                  <Badge variant={missionStatusVariant} className="text-[8px]">
                    {missionStatusLabel}
                  </Badge>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-terminal-green/35">
                      Instagram Post URL
                    </label>
                    <input
                      className="w-full border border-terminal-border/30 bg-terminal-bg px-3 py-2 text-[11px] outline-none transition-colors focus:border-terminal-green/50"
                      value={input.instagramPostUrl}
                      onChange={(e) => setInput((prev) => ({ ...prev, instagramPostUrl: e.target.value }))}
                      placeholder="https://www.instagram.com/p/POST_ID/"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-terminal-green/35">
                      Profile Posts Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      className="w-full border border-terminal-border/30 bg-terminal-bg px-3 py-2 text-[11px] outline-none transition-colors focus:border-terminal-green/50"
                      value={input.recentProfilePosts}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          recentProfilePosts: Number.parseInt(e.target.value || '1', 10),
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button className="h-9" onClick={startRun} disabled={runStatus === 'running'}>
                      <Play className="h-3.5 w-3.5" />
                      Start Analysis
                    </Button>
                    <Button variant="outline" className="h-9" onClick={reset} disabled={runStatus === 'running'}>
                      Reset
                    </Button>
                  </div>
                  {error && <p className="text-[9px] uppercase tracking-wide text-terminal-red">{error}</p>}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="min-h-0 flex-1"
            >
              <Card className="console-panel flex h-full flex-col overflow-hidden border-terminal-border/35 bg-black/45">
                <div className="px-4 py-3 border-b border-terminal-border/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/55">
                      Pipeline Stages
                    </h3>
                    <span className="text-[10px] font-bold text-terminal-green">
                      {completedStages}/{OPS_PIPELINE_STAGES.length}
                    </span>
                  </div>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-terminal-text/45">
                    Active Progress: {progress}%
                  </p>
                </div>
                <div className="h-[2px] bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="h-full bg-terminal-green shadow-[0_0_12px_rgba(0,255,102,0.42)]"
                  />
                </div>
                <div className="min-h-0 overflow-y-auto no-scrollbar">
                  {stages.map((stage, index) => (
                    <motion.div
                      key={stage.id}
                      layout
                      className={cn(
                        'relative overflow-hidden border-b border-terminal-border/10 px-3 py-2',
                        stage.status === 'completed'
                          ? 'bg-terminal-green/[0.05]'
                          : stage.status === 'running'
                            ? 'bg-terminal-amber/[0.06]'
                            : 'bg-black/20',
                      )}
                    >
                      {stage.status === 'running' && (
                        <motion.div
                          initial={{ x: '-120%' }}
                          animate={{ x: '180%' }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-terminal-amber/30 to-transparent"
                        />
                      )}

                      <div className="relative z-[1]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {stage.status === 'completed' ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-terminal-green" />
                            ) : stage.status === 'running' ? (
                              <Activity className="h-3.5 w-3.5 animate-pulse text-terminal-amber" />
                            ) : (
                              <Clock3 className="h-3.5 w-3.5 text-terminal-text/30" />
                            )}
                            <p className="text-[8px] font-black uppercase tracking-[0.11em] text-terminal-text/82">
                              {stage.label}
                            </p>
                          </div>
                          <span className="text-[8px] uppercase tracking-wider text-terminal-text/40">
                            {index + 1}/{OPS_PIPELINE_STAGES.length}
                          </span>
                        </div>
                        {stage.status === 'running' && (
                          <p className="mt-1 truncate pl-5 text-[7px] uppercase tracking-[0.12em] text-terminal-amber/75">
                            {stage.detail}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto no-scrollbar pr-1">
            <div className="space-y-6 pb-5">
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <div className="mb-3 border-b border-terminal-border/15 pb-2">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-terminal-text/40">
                    Stage 04 · Core Intelligence
                  </p>
                  <h2 className="pt-1 text-[13px] font-bold uppercase tracking-[0.12em] text-terminal-text/90">
                    Narratives and Signal Discovery
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <Card className="h-full border-terminal-border/30 bg-black/40 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-terminal-green/75" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/70">
                        Narrative / Theme Extraction
                      </h3>
                    </div>
                    {canShowCoreResults && result ? (
                      <div className="space-y-3">
                        {result.narrativeThemes.map((theme) => (
                          <div key={theme.title} className="border border-terminal-border/20 bg-black/20 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-terminal-text/90">
                                {theme.title}
                              </p>
                              <Badge
                                variant={
                                  theme.sentiment === 'positive'
                                    ? 'positive'
                                    : theme.sentiment === 'negative'
                                      ? 'negative'
                                      : 'outline'
                                }
                              >
                                {theme.sentiment}
                              </Badge>
                            </div>
                            <p className="mt-2 text-[11px] leading-relaxed text-terminal-text/80">{theme.evidence}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] uppercase tracking-wider text-terminal-text/35">
                        Unlocks after extraction stage completes.
                      </p>
                    )}
                  </Card>

                  <Card className="h-full border-terminal-border/30 bg-black/40 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Radar className="h-4 w-4 text-terminal-green/75" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/70">
                        X / Grok Signal Search
                      </h3>
                    </div>
                    {canShowSignals && result ? (
                      <div className="space-y-3">
                        {result.socialSignals.map((item) => (
                          <div key={item.signal} className="border border-terminal-border/20 bg-black/20 p-3">
                            <p className="text-[8px] font-black uppercase tracking-[0.15em] text-terminal-text/45">
                              {item.source}
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed text-terminal-text/82">{item.signal}</p>
                            <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.14em] text-terminal-amber/75">
                              Intensity: {item.intensity}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] uppercase tracking-wider text-terminal-text/35">
                        Unlocks after X and web signal stages complete.
                      </p>
                    )}
                  </Card>
                </div>
              </motion.section>

              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <div className="mb-3 border-b border-terminal-border/15 pb-2">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-terminal-text/40">
                    Stage 05 · Evidence Mapping
                  </p>
                  <h2 className="pt-1 text-[13px] font-bold uppercase tracking-[0.12em] text-terminal-text/90">
                    Web Evidence and Audience Segmentation
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <Card className="h-full border-terminal-border/30 bg-black/40 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-terminal-green/75" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/70">
                        OpenAI / Web Evidence
                      </h3>
                    </div>
                    {canShowSignals && result ? (
                      <div className="space-y-3">
                        {result.webEvidence.map((item) => (
                          <div key={item.outlet} className="border border-terminal-border/20 bg-black/20 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-terminal-text/90">
                                {item.outlet}
                              </p>
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-terminal-green/65">
                                {item.confidence}%
                              </p>
                            </div>
                            <p className="mt-1 text-[11px] leading-relaxed text-terminal-text/82">{item.finding}</p>
                            <div className="mt-2 h-[2px] bg-white/5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.confidence}%` }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                className="h-full bg-terminal-green/90"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] uppercase tracking-wider text-terminal-text/35">
                        Unlocks after X and web signal stages complete.
                      </p>
                    )}
                  </Card>

                  <Card className="h-full border-terminal-border/30 bg-black/40 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-terminal-green/75" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/70">
                        Follower / Audience Map
                      </h3>
                    </div>
                    {canShowCoreResults && result ? (
                      <div className="space-y-3">
                        <div className="border border-terminal-border/20 bg-black/20 p-3">
                          <p className="text-[8px] font-black uppercase tracking-[0.15em] text-terminal-text/48">
                            Dominant Segment
                          </p>
                          <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.08em] text-terminal-text/90">
                            {dominantAudienceSegment?.name ?? 'Pending Segment'}
                          </p>
                          <p className="text-[9px] uppercase tracking-[0.12em] text-terminal-green/65">
                            {dominantAudienceSegment?.share ?? 0}% audience share
                          </p>
                          <div className="mt-3 flex h-3 overflow-hidden border border-terminal-border/20 bg-black/35">
                            {result.followerMap.map((segment, idx) => (
                              <motion.div
                                key={segment.name}
                                initial={{ width: 0 }}
                                animate={{ width: `${segment.share}%` }}
                                transition={{ duration: 0.4, ease: 'easeOut', delay: idx * 0.05 }}
                                className={cn('h-full', trendBarClass(segment.trend))}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {result.followerMap.map((segment) => (
                            <div key={segment.name} className="border border-terminal-border/20 bg-black/20 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {trendIcon(segment.trend)}
                                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-terminal-text/88">
                                    {segment.name}
                                  </p>
                                </div>
                                <p className="text-[10px] font-bold text-terminal-green/80">{segment.share}%</p>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {Array.from({ length: Math.max(3, Math.round(segment.share / 10)) }).map((_, i) => (
                                  <span
                                    key={`${segment.name}-chip-${i}`}
                                    className={cn(
                                      'h-2.5 w-2.5 rounded-full border',
                                      segment.trend === 'up'
                                        ? 'border-terminal-green/40 bg-terminal-green/60'
                                        : segment.trend === 'down'
                                          ? 'border-terminal-red/35 bg-terminal-red/60'
                                          : 'border-terminal-amber/35 bg-terminal-amber/60',
                                    )}
                                  />
                                ))}
                              </div>
                              <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.14em] text-terminal-text/48">
                                Trend: {segment.trend}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] uppercase tracking-wider text-terminal-text/35">
                        Unlocks after narrative extraction stage completes.
                      </p>
                    )}
                  </Card>
                </div>
              </motion.section>

              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <div className="mb-3 border-b border-terminal-border/15 pb-2">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-terminal-text/40">
                    Stage 06 · Competitor Pressure
                  </p>
                  <h2 className="pt-1 text-[13px] font-bold uppercase tracking-[0.12em] text-terminal-text/90">
                    Top 3 Competitor Comparison
                  </h2>
                </div>
                <Card className="border-terminal-border/30 bg-black/40 p-5">
                  <div className="mb-3 flex items-center justify-between border-b border-terminal-border/15 pb-2">
                    <div className="flex items-center gap-2">
                      <Crosshair className="h-4 w-4 text-terminal-green/75" />
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-terminal-text/68">
                        Competitor Visibility Board
                      </p>
                    </div>
                    <Badge variant="outline" dot={false} className="text-[8px]">
                      Top 3 Only
                    </Badge>
                  </div>
                  {canShowCompetitors && result ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {result.competitors.slice(0, 3).map((competitor, idx) => {
                        const risk = riskLevel(competitor.risk);
                        return (
                          <motion.div
                            key={competitor.name}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            className="border border-terminal-border/20 bg-black/20 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-terminal-text/90">
                                {competitor.name}
                              </p>
                              <span
                                className={cn(
                                  'border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em]',
                                  riskBadgeClass(risk),
                                )}
                              >
                                {risk}
                              </span>
                            </div>
                            <div className="mt-3 space-y-2">
                              <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">
                                  Detected Reason
                                </p>
                                <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/82">
                                  {detectedReason(competitor.risk)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">
                                  Sentiment / Risk
                                </p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-terminal-amber/80">
                                  Audience pressure: {risk}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">
                                  Position Summary
                                </p>
                                <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/82">
                                  {competitor.position}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] uppercase tracking-wider text-terminal-text/35">
                      Unlocks after competitor discovery and comparison stages complete.
                    </p>
                  )}
                </Card>
              </motion.section>
            </div>
          </div>

          <div className="flex w-[420px] shrink-0 flex-col gap-5 overflow-y-auto no-scrollbar pr-1">
            <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 }}>
              <Card className="border-terminal-green/35 bg-black/50 p-5">
                <div className="mb-4 border-b border-terminal-border/20 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-terminal-green" />
                      <h3 className="text-[12px] font-black uppercase tracking-[0.16em] text-terminal-text/92">
                        Final Brand Position Briefing
                      </h3>
                    </div>
                    <Badge variant={canShowStatusAndPosition ? 'positive' : 'outline'} dot={canShowStatusAndPosition}>
                      {canShowStatusAndPosition ? 'Ready' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.13em] text-terminal-text/56">
                    Final decision output after audience and competitor stages
                  </p>
                </div>

                {canShowStatusAndPosition && result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-terminal-green/25 bg-terminal-green/[0.05] p-3">
                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-green/78">Strengths</p>
                        <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-terminal-text/85">
                          {result.brandPosition.strengths.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="border border-terminal-amber/25 bg-terminal-amber/[0.05] p-3">
                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-amber/85">
                          Weaknesses
                        </p>
                        <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-terminal-text/85">
                          {result.brandPosition.weaknesses.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="border border-terminal-green/25 bg-terminal-green/[0.05] p-3">
                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-green/78">
                          Opportunities
                        </p>
                        <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-terminal-text/85">
                          {result.brandPosition.opportunities.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="border border-terminal-red/28 bg-terminal-red/[0.05] p-3">
                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-red/82">Threats</p>
                        <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-terminal-text/85">
                          {result.brandPosition.threats.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="border border-terminal-green/40 bg-terminal-green/[0.09] p-4 shadow-[0_0_24px_rgba(0,255,102,0.16)]">
                      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-terminal-green">
                        Final Recommendation
                      </p>
                      <p className="mt-2 text-[12px] leading-relaxed text-terminal-text/92">
                        {result.brandPosition.recommendation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] uppercase tracking-wider text-terminal-text/35">
                    Unlocks at final brand-position stage.
                  </p>
                )}
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-terminal-border/30 bg-black/40 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-terminal-green/80" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/72">
                    Audience Status
                  </h3>
                </div>
                {canShowAudienceStatus && result ? (
                  <div className="space-y-3">
                    <p className="text-[11px] leading-relaxed text-terminal-text/84">{result.audienceStatus.sentiment}</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="border border-terminal-red/25 bg-terminal-red/[0.04] p-3">
                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-red/75">Concerns</p>
                        <ul className="mt-2 space-y-1 text-[10px] text-terminal-text/82">
                          {result.audienceStatus.concerns.map((item) => (
                            <li key={item} className="flex items-start gap-1.5">
                              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-terminal-red/70" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="border border-terminal-green/25 bg-terminal-green/[0.04] p-3">
                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-green/72">
                          Opportunities
                        </p>
                        <ul className="mt-2 space-y-1 text-[10px] text-terminal-text/82">
                          {result.audienceStatus.opportunities.map((item) => (
                            <li key={item} className="flex items-start gap-1.5">
                              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-terminal-green/70" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] uppercase tracking-wider text-terminal-text/35">
                    Unlocks when audience status stage completes.
                  </p>
                )}
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 }}>
              <Card className="console-panel flex h-[190px] flex-col overflow-hidden border-terminal-border/25 bg-black/30">
                <div className="px-5 py-3 border-b border-terminal-border/18">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-terminal-text/55">
                      Live Mission Log
                    </h3>
                    <Badge variant="outline" dot={false} className="text-[8px]">
                      {events.length}
                    </Badge>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-3 no-scrollbar space-y-2">
                  <AnimatePresence initial={false}>
                    {events.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'border px-3 py-2',
                          toneClass(entry.tone),
                          index === 0 && runStatus === 'running' && 'shadow-[0_0_10px_rgba(255,176,32,0.14)]',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-terminal-text/45">
                            {entry.timestamp}
                          </p>
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              entry.tone === 'success'
                                ? 'bg-terminal-green'
                                : entry.tone === 'warning'
                                  ? 'bg-terminal-red'
                                  : entry.tone === 'running'
                                    ? 'bg-terminal-amber animate-pulse'
                                    : 'bg-terminal-text/40',
                            )}
                          />
                        </div>
                        <p className="mt-1 text-[9px] leading-relaxed text-terminal-text/76">{entry.message}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
