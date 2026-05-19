import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
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

function statusDotClass(status: StepNavigationStatus, isActive: boolean): string {
  if (isActive) return 'bg-terminal-green';
  if (status === 'running') return 'bg-terminal-amber animate-pulse';
  if (status === 'complete') return 'bg-terminal-green/55';
  if (status === 'locked') return 'bg-terminal-text/15';
  return 'bg-terminal-text/35';
}

export function StepNavigation({ steps, activeStepId, onStepChange }: StepNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollByOffset = (offset: number) => {
    scrollContainerRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="shrink-0">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terminal-text/70">
            Intelligence Report
          </h2>
          <span className="text-[9px] uppercase tracking-[0.18em] text-terminal-text/35">
            Summary first · drill into each layer
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scrollByOffset(-240)}
            className="flex h-6 w-6 items-center justify-center text-terminal-text/40 transition-colors hover:text-terminal-green"
            aria-label="Scroll sections left"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => scrollByOffset(240)}
            className="flex h-6 w-6 items-center justify-center text-terminal-text/40 transition-colors hover:text-terminal-green"
            aria-label="Scroll sections right"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex gap-0 overflow-x-auto border-b border-white/[0.06]"
      >
        {steps.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isLocked = step.status === 'locked';
          const isRunning = step.status === 'running';

          return (
            <button
              key={step.id}
              onClick={() => !isLocked && onStepChange(step.id)}
              disabled={isLocked}
              title={step.helper}
              className={cn(
                'group relative flex min-w-[126px] items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors',
                isLocked
                  ? 'cursor-not-allowed text-terminal-text/30'
                  : isActive
                    ? 'text-terminal-green'
                    : 'text-terminal-text/65 hover:text-terminal-text/90',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-[9px] font-medium tracking-[0.16em]',
                    isActive
                      ? 'text-terminal-green/80'
                      : isLocked
                        ? 'text-terminal-text/25'
                        : 'text-terminal-text/35',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'text-[11px] font-semibold tracking-[0.04em]',
                    isActive ? 'text-terminal-green' : isLocked ? 'text-terminal-text/40' : '',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {isLocked ? (
                <Lock className="h-2.5 w-2.5 text-terminal-text/25" />
              ) : (
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-colors',
                    statusDotClass(step.status, isActive),
                  )}
                  aria-hidden
                />
              )}

              {isActive && (
                <motion.span
                  layoutId="ops-terminal-active-step"
                  className="absolute inset-x-2 -bottom-px h-[2px] bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.55)]"
                  transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                />
              )}

              {isRunning && !isActive && (
                <span className="absolute inset-x-2 -bottom-px h-[1px] bg-terminal-amber/55" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
