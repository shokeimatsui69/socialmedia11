import React from 'react';
import { motion } from 'motion/react';
import { PipelineStatus } from '../types';

interface PipelineStageView {
  id: string;
  label: string;
  detail: string;
  status: PipelineStatus;
}

interface PipelineSummaryProps {
  stages: PipelineStageView[];
  progress: number;
  completedStages: number;
  totalStages: number;
  runStatus: 'idle' | 'running' | 'completed';
}

export function PipelineSummary({
  stages,
  progress,
  completedStages,
  totalStages,
  runStatus,
}: PipelineSummaryProps) {
  const currentStage = stages.find((stage) => stage.status === 'running');
  const currentStageLabel =
    runStatus === 'idle'
      ? 'Awaiting mission launch'
      : runStatus === 'completed'
        ? 'Mission complete'
        : currentStage?.label || 'Dispatching pipeline';

  const isIdle = runStatus === 'idle';
  const isRunning = runStatus === 'running';
  const accentColor = isRunning
    ? 'text-terminal-amber'
    : runStatus === 'completed'
      ? 'text-terminal-green'
      : 'text-terminal-text/45';

  return (
    <div className="shrink-0 px-1">
      <div className="flex items-center justify-between gap-3 pb-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/35">
            Pipeline
          </span>
          <span className="truncate text-[10px] tracking-[0.04em] text-terminal-text/65">
            {currentStageLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[9px] uppercase tracking-[0.18em] text-terminal-text/35">
            {completedStages}/{totalStages}
          </span>
          <span className={`text-[10px] font-semibold tracking-[0.04em] ${accentColor}`}>
            {progress}%
          </span>
        </div>
      </div>

      <div className="h-[2px] w-full overflow-hidden bg-white/[0.05]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={
            isIdle
              ? 'h-full bg-terminal-text/15'
              : 'h-full bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.45)]'
          }
        />
      </div>
    </div>
  );
}
