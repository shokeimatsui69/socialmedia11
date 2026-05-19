import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, ChevronDown } from 'lucide-react';
import { Badge } from '../../../components/ui/Primitives';
import { cn } from '../../../lib/utils';

type MissionEventTone = 'info' | 'running' | 'success' | 'warning';

interface MissionEvent {
  id: string;
  timestamp: string;
  message: string;
  tone: MissionEventTone;
}

interface MissionLogProps {
  events: MissionEvent[];
  runStatus: 'idle' | 'running' | 'completed';
}

function toneClass(tone: MissionEventTone): string {
  if (tone === 'success') return 'border-terminal-green/35 bg-terminal-green/[0.05]';
  if (tone === 'warning') return 'border-terminal-red/30 bg-terminal-red/[0.06]';
  if (tone === 'running') return 'border-terminal-amber/35 bg-terminal-amber/[0.05]';
  return 'border-terminal-border/25 bg-black/25';
}

export function MissionLog({ events, runStatus }: MissionLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const recentEvents = events.slice(0, 4);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40 w-[340px]">
      <div className="pointer-events-auto border border-terminal-border/25 bg-black/55 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex items-center gap-2 text-terminal-text/72 transition-colors hover:text-terminal-green"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="text-[8px] font-black uppercase tracking-[0.17em]">Mission Events</span>
          </button>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" dot={false} className="text-[8px]">
              {events.length}
            </Badge>
            <button
              onClick={() => setIsOpen((current) => !current)}
              className="h-5 w-5 border border-terminal-border/30 text-terminal-text/55 transition-colors hover:text-terminal-green"
              aria-label={isOpen ? 'Collapse mission events' : 'Expand mission events'}
            >
              <ChevronDown className={cn('mx-auto h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="max-h-[260px] overflow-y-auto border-t border-terminal-border/18 p-2 no-scrollbar space-y-2"
            >
              <AnimatePresence initial={false}>
                {recentEvents.map((entry, index) => (
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
                      <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-terminal-text/45">{entry.timestamp}</p>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
