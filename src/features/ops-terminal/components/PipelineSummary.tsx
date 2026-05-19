import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import type { OpsParallelTaskVM, OpsPipelineStageVM, OpsRunStatus, RunnerTaskStatus } from '../types';

interface PipelineSummaryProps {
  stages: OpsPipelineStageVM[];
  parallelTasks: OpsParallelTaskVM[];
  progress: number;
  completedStages: number;
  totalStages: number;
  runStatus: OpsRunStatus;
}

function taskDotClass(status: RunnerTaskStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-terminal-green/85';
    case 'running':
      return 'bg-terminal-amber animate-pulse';
    case 'failed':
      return 'bg-terminal-red/85';
    case 'warning':
      return 'bg-terminal-amber/70';
    default:
      return 'bg-terminal-text/25';
  }
}

export function PipelineSummary({
  stages,
  parallelTasks,
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

  const visibleTasks = parallelTasks.slice(0, 6);

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

      {!isIdle && visibleTasks.length > 0 && (
        <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {visibleTasks.map((task) => (
            <li key={task.id} className="flex items-center gap-1.5 text-[9px] tracking-[0.04em] text-terminal-text/45">
              <span className={cn('h-1.5 w-1.5 rounded-full', taskDotClass(task.status))} />
              <span className="text-terminal-text/55">{task.label}</span>
              {task.recordsCount > 0 && (
                <span className="text-terminal-text/35">{task.recordsCount.toLocaleString()}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
