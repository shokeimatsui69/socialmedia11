import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { OpsDemoResult } from '../types';

interface CompetitorsStepProps {
  result: OpsDemoResult | null;
  isReady: boolean;
}

type RiskLevel = 'HIGH' | 'MEDIUM' | 'WATCH';

function riskLevel(riskText: string): RiskLevel {
  const risk = riskText.toLowerCase();
  if (risk.includes('capture') || risk.includes('aggressive')) return 'HIGH';
  if (risk.includes('shift') || risk.includes('dilute') || risk.includes('overlap')) return 'MEDIUM';
  return 'WATCH';
}

function riskSurface(level: RiskLevel): string {
  if (level === 'HIGH') return 'border-terminal-red/35 bg-terminal-red/[0.04]';
  if (level === 'MEDIUM') return 'border-terminal-amber/30 bg-terminal-amber/[0.03]';
  return 'border-white/[0.07] bg-white/[0.02]';
}

function riskLabelClass(level: RiskLevel): string {
  if (level === 'HIGH') return 'text-terminal-red';
  if (level === 'MEDIUM') return 'text-terminal-amber';
  return 'text-terminal-text/65';
}

function riskAccentText(level: RiskLevel): string {
  if (level === 'HIGH') return 'text-terminal-red/85';
  if (level === 'MEDIUM') return 'text-terminal-amber/85';
  return 'text-terminal-text/65';
}

function detectedReason(text: string): string {
  const normalized = text.trim().replace(/\.$/, '');
  if (normalized.length <= 92) return normalized;
  return `${normalized.slice(0, 89)}...`;
}

export function CompetitorsStep({ result, isReady }: CompetitorsStepProps) {
  const topCompetitors = result?.competitors.slice(0, 3) ?? [];
  const highestRiskCompetitor = topCompetitors
    .map((competitor) => ({ competitor, risk: riskLevel(competitor.risk) }))
    .sort((a, b) => {
      const order: Record<RiskLevel, number> = { HIGH: 3, MEDIUM: 2, WATCH: 1 };
      return order[b.risk] - order[a.risk];
    })[0];

  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
          Step 07 · Competitive
        </p>
        <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">Competitors</h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
          Top 3 competitor comparison with detected reason, risk pressure, position, and key narrative.
        </p>
      </header>

      {!isReady || !result ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Unlocks after competitor discovery and comparison stages complete.
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
                  Primary competitor pressure is from{' '}
                  <span className="font-semibold text-terminal-text/95">
                    {highestRiskCompetitor?.competitor.name}
                  </span>{' '}
                  with{' '}
                  <span
                    className={cn(
                      'text-[11px] font-semibold uppercase tracking-[0.16em]',
                      riskLabelClass(highestRiskCompetitor?.risk ?? 'WATCH'),
                    )}
                  >
                    · {highestRiskCompetitor?.risk} risk
                  </span>
                  .
                </p>
              </div>
              <span className="shrink-0 text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Top 3
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topCompetitors.map((competitor) => {
              const risk = riskLevel(competitor.risk);
              return (
                <article key={competitor.name} className={cn('border p-5', riskSurface(risk))}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[14px] font-semibold leading-snug tracking-[0.02em] text-terminal-text/95">
                      {competitor.name}
                    </h3>
                    <span
                      className={cn(
                        'shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em]',
                        riskLabelClass(risk),
                      )}
                    >
                      {risk}
                    </span>
                  </div>

                  <dl className="mt-4 space-y-3 text-[12px] leading-relaxed">
                    <div>
                      <dt className="text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">
                        Detected Reason
                      </dt>
                      <dd className="mt-1 text-terminal-text/80">{detectedReason(competitor.risk)}</dd>
                    </div>

                    <div>
                      <dt className="text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">
                        Audience Pressure
                      </dt>
                      <dd
                        className={cn(
                          'mt-1 inline-flex items-center gap-1.5 text-[12px]',
                          riskAccentText(risk),
                        )}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {risk}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">
                        Position
                      </dt>
                      <dd className="mt-1 text-terminal-text/80">{competitor.position}</dd>
                    </div>

                    <div>
                      <dt className="text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">
                        Key Narrative
                      </dt>
                      <dd className="mt-1 text-terminal-text/80">{competitor.action}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
