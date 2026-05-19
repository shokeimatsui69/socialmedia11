import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, CheckCircle2, ChevronDown, Clock3 } from 'lucide-react';
import { Card } from '../../../components/ui/Primitives';
import { cn } from '../../../lib/utils';
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
}

export function PipelineSummary({ stages, progress, completedStages, totalStages }: PipelineSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="console-panel border-terminal-border/30 bg-black/35 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.18em] text-terminal-text/68">Pipeline Rail</h3>
          <p className="text-[8px] uppercase tracking-[0.13em] text-terminal-text/45">
            {completedStages}/{totalStages}
            {' '}stages complete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-terminal-green">{progress}%</span>
          <button
            onClick={() => setIsExpanded((current) => !current)}
            className="h-6 w-6 border border-terminal-border/30 bg-black/30 text-terminal-text/62 transition-colors hover:text-terminal-green"
            aria-label={isExpanded ? 'Collapse pipeline monitor' : 'Expand pipeline monitor'}
          >
            <ChevronDown className={cn('mx-auto h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-180')} />
          </button>
        </div>
      </div>

      <div className="mt-2 h-[2px] bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="h-full bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.35)]"
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={cn(
              'flex items-center gap-1 border px-1.5 py-1 text-[7px] uppercase tracking-[0.11em]',
              stage.status === 'completed'
                ? 'border-terminal-green/35 bg-terminal-green/[0.07] text-terminal-green/88'
                : stage.status === 'running'
                  ? 'border-terminal-amber/35 bg-terminal-amber/[0.08] text-terminal-amber/90'
                  : 'border-terminal-border/25 bg-black/25 text-terminal-text/55',
            )}
            title={stage.detail}
          >
            {stage.status === 'completed' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : stage.status === 'running' ? (
              <Activity className="h-3 w-3 animate-pulse" />
            ) : (
              <Clock3 className="h-3 w-3" />
            )}
            <span>{index + 1}</span>
          </div>
        ))}
      </div>

      {isExpanded && (
        <div className="mt-3 max-h-[160px] overflow-y-auto border border-terminal-border/20 bg-black/20 no-scrollbar">
          {stages.map((stage, index) => (
            <div
              key={`${stage.id}-expanded`}
              className={cn(
                'border-b border-terminal-border/12 px-3 py-2 last:border-b-0',
                stage.status === 'running' && 'bg-terminal-amber/[0.05]',
                stage.status === 'completed' && 'bg-terminal-green/[0.04]',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-terminal-text/84">{stage.label}</p>
                <span className="text-[8px] uppercase tracking-[0.12em] text-terminal-text/48">
                  {index + 1}/{totalStages}
                </span>
              </div>
              <p className="mt-1 text-[8px] leading-relaxed text-terminal-text/58">{stage.detail}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
