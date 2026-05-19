import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { OpsMissionEventVM, OpsRunStatus } from '../types';

interface MissionLogProps {
  events: OpsMissionEventVM[];
  runStatus: OpsRunStatus;
}

function toneDot(tone: OpsMissionEventVM['tone']): string {
  if (tone === 'success') return 'bg-terminal-green';
  if (tone === 'warning') return 'bg-terminal-red';
  if (tone === 'running') return 'bg-terminal-amber';
  return 'bg-terminal-text/40';
}

export function MissionLog({ events, runStatus }: MissionLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const recentEvents = events.slice(0, 6);
  const isRunning = runStatus === 'running';

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="pointer-events-auto relative">
      <button
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          'group flex h-9 items-center gap-2 border border-white/[0.06] bg-black/65 px-3 text-terminal-text/60 backdrop-blur-md transition-colors',
          'hover:border-terminal-green/30 hover:text-terminal-text/90',
          isOpen && 'border-terminal-green/40 text-terminal-green',
        )}
        aria-label="Toggle mission events"
        aria-expanded={isOpen}
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          <Bell className="h-3.5 w-3.5" />
          {isRunning && (
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-terminal-amber animate-pulse" />
          )}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.22em]">Events</span>
        <span className="rounded-sm bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.06em] text-terminal-text/70">
          {events.length}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute bottom-full right-0 mb-2 w-[320px] origin-bottom-right border border-white/[0.08] bg-[#070907]/95 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-terminal-text/65">
                  Mission Events
                </span>
                <span className="text-[9px] tracking-[0.06em] text-terminal-text/35">
                  {events.length} total
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-terminal-text/40 transition-colors hover:text-terminal-text/85"
                aria-label="Close mission events"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="no-scrollbar max-h-[260px] overflow-y-auto py-1">
              {recentEvents.length === 0 ? (
                <p className="px-3 py-4 text-[10px] tracking-[0.04em] text-terminal-text/45">
                  No events yet.
                </p>
              ) : (
                <ul className="divide-y divide-white/[0.04]">
                  <AnimatePresence initial={false}>
                    {recentEvents.map((entry) => (
                      <motion.li
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-start gap-2.5 px-3 py-2.5"
                      >
                        <span
                          className={cn(
                            'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                            toneDot(entry.tone),
                            entry.tone === 'running' && 'animate-pulse',
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] uppercase tracking-[0.18em] text-terminal-text/35">
                            {entry.timestamp}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-terminal-text/80">
                            {entry.message}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
