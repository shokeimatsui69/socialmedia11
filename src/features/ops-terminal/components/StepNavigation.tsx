import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Activity, CheckCircle2, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { cn } from '../../../lib/utils';

export type StepNavigationStatus = 'locked' | 'available' | 'running' | 'complete';

export interface StepNavigationItem {
  id: string;
  label: string;
  helper: string;
  status: StepNavigationStatus;
}

interface StepNavigationProps {
  steps: StepNavigationItem[];
  activeStepId: string;
  onStepChange: (stepId: string) => void;
}

function statusTone(status: StepNavigationStatus): string {
  if (status === 'complete') return 'text-terminal-green border-terminal-green/35 bg-terminal-green/[0.08]';
  if (status === 'running') return 'text-terminal-amber border-terminal-amber/35 bg-terminal-amber/[0.08]';
  if (status === 'available') return 'text-terminal-text/70 border-terminal-border/30 bg-black/25';
  return 'text-terminal-text/35 border-terminal-border/20 bg-black/18';
}

function statusIcon(status: StepNavigationStatus) {
  if (status === 'complete') return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === 'running') return <Activity className="h-3.5 w-3.5 animate-pulse" />;
  if (status === 'locked') return <Lock className="h-3.5 w-3.5" />;
  return <div className="h-2.5 w-2.5 rounded-full bg-terminal-text/45" />;
}

export function StepNavigation({ steps, activeStepId, onStepChange }: StepNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollByOffset = (offset: number) => {
    scrollContainerRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="shrink-0 border border-terminal-border/30 bg-black/35 px-3 py-2.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/72">
          Analysis Workflow Steps
        </h2>
        <div className="flex items-center gap-2">
          <p className="text-[8px] uppercase tracking-[0.13em] text-terminal-text/46">Summary First · Drill Down Next</p>
          <button
            onClick={() => scrollByOffset(-220)}
            className="h-6 w-6 border border-terminal-border/30 bg-black/30 text-terminal-text/60 transition-colors hover:text-terminal-green"
            aria-label="Scroll steps left"
          >
            <ChevronLeft className="mx-auto h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => scrollByOffset(220)}
            className="h-6 w-6 border border-terminal-border/30 bg-black/30 text-terminal-text/60 transition-colors hover:text-terminal-green"
            aria-label="Scroll steps right"
          >
            <ChevronRight className="mx-auto h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div ref={scrollContainerRef} className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {steps.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isLocked = step.status === 'locked';

          return (
            <button
              key={step.id}
              onClick={() => !isLocked && onStepChange(step.id)}
              disabled={isLocked}
              className={cn(
                'relative min-w-[155px] border px-2.5 py-2 text-left transition-colors',
                isActive ? 'border-terminal-green/45 bg-terminal-green/[0.07]' : statusTone(step.status),
                isLocked ? 'cursor-not-allowed opacity-70' : 'hover:border-terminal-green/40 hover:bg-terminal-green/[0.05]',
              )}
              title={step.helper}
            >
              {isActive && (
                <motion.div
                  layoutId="ops-terminal-active-step"
                  className="absolute inset-x-0 top-0 h-[2px] bg-terminal-green shadow-[0_0_8px_rgba(0,255,102,0.45)]"
                />
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {statusIcon(step.status)}
                  <span className="text-[8px] font-black uppercase tracking-[0.15em] text-terminal-text/65">
                    Step {index + 1}
                  </span>
                </div>
                <span className="text-[7px] uppercase tracking-[0.13em] text-terminal-text/45">{step.status}</span>
              </div>

              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.09em] text-terminal-text/90">{step.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
