import React from 'react';
import { motion } from 'motion/react';
import { Terminal } from 'lucide-react';
import { Badge } from '../../../components/ui/Primitives';

interface MissionHeaderProps {
  missionTitle: string;
  runStatus: 'idle' | 'running' | 'completed';
  currentStageLabel: string;
  completedStages: number;
  totalStages: number;
  progress: number;
  confidenceScore: number;
  readinessScore: number;
  readinessLabel: string;
}

export function MissionHeader({
  missionTitle,
  runStatus,
  currentStageLabel,
  completedStages,
  totalStages,
  progress,
  confidenceScore,
  readinessScore,
  readinessLabel,
}: MissionHeaderProps) {
  const missionStatusLabel = runStatus === 'idle' ? 'Standby' : runStatus === 'running' ? 'Running' : 'Completed';
  const missionStatusVariant =
    runStatus === 'completed' ? 'positive' : runStatus === 'running' ? 'neutral' : 'outline';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="shrink-0 border-b border-terminal-border/40 bg-black/55 px-6 py-2.5"
    >
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-terminal-green/30 bg-terminal-green/[0.05]">
            <Terminal className="h-3.5 w-3.5 text-terminal-green" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-terminal-text/45">
              Live Operations Mission Control
            </p>
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.08em] text-terminal-text/90">
              {missionTitle}
            </p>
          </div>
        </div>

        <Badge variant={missionStatusVariant} className="h-6 text-[8px] tracking-[0.14em]">
          {missionStatusLabel}
        </Badge>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <div className="border border-terminal-border/25 bg-black/30 px-3 py-2">
          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-terminal-text/40">Current Stage</p>
          <p className="truncate pt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-terminal-text/82">
            {currentStageLabel}
          </p>
        </div>

        <div className="border border-terminal-border/25 bg-black/30 px-3 py-2">
          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-terminal-text/40">Pipeline Progress</p>
          <p className="pt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-terminal-text/82">
            {completedStages}/{totalStages} Stages ({progress}%)
          </p>
          <div className="mt-1.5 h-[2px] bg-white/5">
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
          <p className="pt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-terminal-green/80">
            {confidenceScore}%
          </p>
          <div className="mt-1.5 h-[2px] bg-white/5">
            <motion.div
              animate={{ width: `${confidenceScore}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full bg-terminal-green/90"
            />
          </div>
        </div>

        <div className="border border-terminal-border/25 bg-black/30 px-3 py-2">
          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-terminal-text/40">Readiness</p>
          <div className="pt-1 flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-terminal-text/82">{readinessLabel}</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-terminal-green/72">{readinessScore}%</p>
          </div>
          <div className="mt-1.5 h-[2px] bg-white/5">
            <motion.div
              animate={{ width: `${readinessScore}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full bg-terminal-amber/90"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
