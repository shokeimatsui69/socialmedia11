import React from 'react';
import { AlertTriangle, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { OpsDemoResult } from '../types';

interface ExecutiveSummaryStepProps {
  result: OpsDemoResult | null;
  runStatus: 'idle' | 'running' | 'completed';
  canShowAudienceStatus: boolean;
  canShowBrandPosition: boolean;
}

function StepHeader({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="space-y-1.5">
      <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
        {index}
      </p>
      <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">{title}</h2>
      <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">{subtitle}</p>
    </header>
  );
}

function PendingNotice({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">{message}</p>
    </div>
  );
}

export function ExecutiveSummaryStep({
  result,
  runStatus,
  canShowAudienceStatus,
  canShowBrandPosition,
}: ExecutiveSummaryStepProps) {
  const isReady = runStatus !== 'idle';

  return (
    <section className="space-y-6">
      <StepHeader
        index="Step 02 · Briefing"
        title="Executive Summary"
        subtitle="First result-oriented briefing focused on audience status, risk, opportunity, and recommended action."
      />

      {!isReady ? (
        <PendingNotice message="Launch the mission from Setup to unlock the executive briefing." />
      ) : (
        <div className="space-y-5">
          <div className="border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                  Executive Takeaway
                </p>
                <p className="mt-2.5 text-[15px] leading-relaxed text-terminal-text/95">
                  {canShowAudienceStatus && result
                    ? result.audienceStatus.sentiment
                    : 'Audience summary is building as narrative and signal stages complete.'}
                </p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  canShowAudienceStatus ? 'text-terminal-green' : 'text-terminal-text/45'
                }`}
              >
                {canShowAudienceStatus ? 'Ready' : 'Pending'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-terminal-green/80" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                  Main Opportunity
                </p>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-terminal-text/85">
                {canShowAudienceStatus && result
                  ? result.audienceStatus.opportunities[0]
                  : 'Opportunity signal will unlock with audience and narrative processing.'}
              </p>
            </div>

            <div className="border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-terminal-red/85" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                  Main Risk
                </p>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-terminal-text/85">
                {canShowAudienceStatus && result
                  ? result.audienceStatus.concerns[0]
                  : 'Risk signal will unlock with audience and competitor processing.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.15fr]">
            <div className="border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-terminal-text/55" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                  Brand Position Snapshot
                </p>
              </div>
              {canShowBrandPosition && result ? (
                <dl className="mt-4 space-y-2.5 text-[12px] leading-relaxed">
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-green/75">
                      Strength
                    </dt>
                    <dd className="text-terminal-text/85">{result.brandPosition.strengths[0]}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-amber/80">
                      Weakness
                    </dt>
                    <dd className="text-terminal-text/85">{result.brandPosition.weaknesses[0]}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-red/85">
                      Threat
                    </dt>
                    <dd className="text-terminal-text/85">{result.brandPosition.threats[0]}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-[12px] leading-relaxed text-terminal-text/55">
                  Final brand-position synthesis unlocks at the final mission stage.
                </p>
              )}
            </div>

            <div className="relative overflow-hidden border border-terminal-green/40 bg-terminal-green/[0.05] p-6 shadow-[0_0_30px_-8px_rgba(0,255,102,0.35)]">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-terminal-green/[0.07] via-transparent to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-terminal-green" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-terminal-green">
                    Recommended Action
                  </p>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-terminal-text/95">
                  {canShowBrandPosition && result
                    ? result.brandPosition.recommendation
                    : 'Recommendation will appear after audience status and brand-position stages complete.'}
                </p>
                <div className="mt-4 border-t border-terminal-green/20 pt-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-terminal-text/50">
                    Confidence follows consistency across social and web evidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
