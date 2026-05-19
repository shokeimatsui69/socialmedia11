import React from 'react';
import { AlertTriangle, MinusCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { OpsCompetitorsVM, OpsCompetitorVM } from '../types';

interface CompetitorsStepProps {
  competitors: OpsCompetitorsVM;
}

function riskSurface(level: OpsCompetitorVM['riskLevel']): string {
  if (level === 'HIGH') return 'border-terminal-red/35 bg-terminal-red/[0.04]';
  if (level === 'MEDIUM') return 'border-terminal-amber/30 bg-terminal-amber/[0.03]';
  return 'border-white/[0.07] bg-white/[0.02]';
}

function riskLabelClass(level: OpsCompetitorVM['riskLevel']): string {
  if (level === 'HIGH') return 'text-terminal-red';
  if (level === 'MEDIUM') return 'text-terminal-amber';
  return 'text-terminal-text/65';
}

function riskAccentText(level: OpsCompetitorVM['riskLevel']): string {
  if (level === 'HIGH') return 'text-terminal-red/85';
  if (level === 'MEDIUM') return 'text-terminal-amber/85';
  return 'text-terminal-text/65';
}

interface CompetitorCardProps {
  competitor: OpsCompetitorVM;
}

const CompetitorCard: React.FC<CompetitorCardProps> = ({ competitor }) => {
  return (
    <article className={cn('border p-5', riskSurface(competitor.riskLevel))}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14px] font-semibold leading-snug tracking-[0.02em] text-terminal-text/95">
          {competitor.name}
        </h3>
        <span
          className={cn('shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em]', riskLabelClass(competitor.riskLevel))}
        >
          {competitor.riskLevel}
        </span>
      </div>

      <dl className="mt-4 space-y-3 text-[12px] leading-relaxed">
        <div>
          <dt className="text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">Detected Reason</dt>
          <dd className="mt-1 text-terminal-text/80">{competitor.risk}</dd>
        </div>

        <div>
          <dt className="text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">Audience Pressure</dt>
          <dd className={cn('mt-1 inline-flex items-center gap-1.5 text-[12px]', riskAccentText(competitor.riskLevel))}>
            <AlertTriangle className="h-3.5 w-3.5" />
            {competitor.riskLevel}
          </dd>
        </div>

        <div>
          <dt className="text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">Position</dt>
          <dd className="mt-1 text-terminal-text/80">{competitor.position}</dd>
        </div>

        <div>
          <dt className="text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">Key Narrative</dt>
          <dd className="mt-1 text-terminal-text/80">{competitor.action}</dd>
        </div>
      </dl>
    </article>
  );
};

interface AwaitingCompetitorCardProps {
  index: number;
}

const AwaitingCompetitorCard: React.FC<AwaitingCompetitorCardProps> = ({ index }) => {
  return (
    <article className="flex h-full flex-col items-center justify-center border border-dashed border-white/[0.08] bg-white/[0.015] p-5 text-center">
      <MinusCircle className="h-5 w-5 text-terminal-text/30" />
      <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/45">
        Slot {String(index + 1).padStart(2, '0')}
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-terminal-text/45">
        Awaiting additional competitor from runner.
      </p>
    </article>
  );
};

export function CompetitorsStep({ competitors }: CompetitorsStepProps) {
  const { isReady, competitors: list, expectedSlots, highestRisk } = competitors;
  const slotCount = Math.max(expectedSlots, list.length);
  const missingSlots = Math.max(0, slotCount - list.length);

  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
          Step 07 · Competitive
        </p>
        <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">Competitors</h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
          Competitor comparison with detected reason, risk pressure, position, and key narrative. Only competitors
          returned by the runner are shown — empty slots remain clearly marked.
        </p>
      </header>

      {!isReady ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Unlocks after competitor discovery and comparison stages complete.
          </p>
        </div>
      ) : list.length === 0 ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            No competitors returned by the runner yet.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                  Strategic Takeaway
                </p>
                <p className="mt-2.5 text-[14px] leading-relaxed text-terminal-text/90">
                  {highestRisk ? (
                    <>
                      Primary competitor pressure is from{' '}
                      <span className="font-semibold text-terminal-text/95">{highestRisk.name}</span> with{' '}
                      <span
                        className={cn(
                          'text-[11px] font-semibold uppercase tracking-[0.16em]',
                          riskLabelClass(highestRisk.riskLevel),
                        )}
                      >
                        · {highestRisk.riskLevel} risk
                      </span>
                      .
                    </>
                  ) : (
                    'Competitor pressure profile pending.'
                  )}
                </p>
              </div>
              <span className="shrink-0 text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                {list.length} of {expectedSlots}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((competitor) => (
              <CompetitorCard key={competitor.id} competitor={competitor} />
            ))}
            {Array.from({ length: missingSlots }).map((_, idx) => (
              <AwaitingCompetitorCard key={`awaiting-${idx}`} index={list.length + idx} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
