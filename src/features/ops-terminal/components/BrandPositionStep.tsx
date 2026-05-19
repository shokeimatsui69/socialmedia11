import React from 'react';
import { ShieldCheck, Target } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { OpsDemoResult } from '../types';

interface BrandPositionStepProps {
  result: OpsDemoResult | null;
  isReady: boolean;
}

type SwotTone = 'green' | 'amber' | 'red' | 'positive';

const SWOT_SURFACE: Record<SwotTone, string> = {
  green: 'border-terminal-green/25 bg-terminal-green/[0.03]',
  amber: 'border-terminal-amber/25 bg-terminal-amber/[0.03]',
  red: 'border-terminal-red/28 bg-terminal-red/[0.04]',
  positive: 'border-terminal-green/30 bg-terminal-green/[0.04]',
};

const SWOT_LABEL: Record<SwotTone, string> = {
  green: 'text-terminal-green',
  amber: 'text-terminal-amber',
  red: 'text-terminal-red',
  positive: 'text-terminal-green/85',
};

function SwotBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: SwotTone;
}) {
  return (
    <div className={cn('border p-5', SWOT_SURFACE[tone])}>
      <p className={cn('text-[10px] font-semibold uppercase tracking-[0.22em]', SWOT_LABEL[tone])}>
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-terminal-text/85">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-px w-2 shrink-0 bg-terminal-text/35" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BrandPositionStep({ result, isReady }: BrandPositionStepProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
          Step 08 · Decision
        </p>
        <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">Brand Position</h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
          Final SWOT strategic briefing with the recommendation highlighted as the mission decision output.
        </p>
      </header>

      {!isReady || !result ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Unlocks when the final brand-position stage completes.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-4">
              <div className="flex items-center gap-2.5">
                <Target className="h-4 w-4 text-terminal-text/55" />
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-terminal-text/90">
                  Final Brand Position Briefing
                </h3>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-terminal-green">
                Ready
              </span>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                  Strategic Takeaway
                </p>
                <p className="mt-2.5 text-[14px] leading-relaxed text-terminal-text/90">
                  Protect core strengths while addressing delivery and differentiation weaknesses to prevent
                  competitor narrative capture.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SwotBlock title="Strengths" items={result.brandPosition.strengths} tone="green" />
                <SwotBlock title="Weaknesses" items={result.brandPosition.weaknesses} tone="amber" />
                <SwotBlock title="Opportunities" items={result.brandPosition.opportunities} tone="positive" />
                <SwotBlock title="Threats" items={result.brandPosition.threats} tone="red" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border border-terminal-green/40 bg-terminal-green/[0.06] p-7 shadow-[0_0_40px_-10px_rgba(0,255,102,0.45)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-terminal-green/[0.08] via-transparent to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-terminal-green" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-terminal-green">
                  Final Recommendation
                </p>
              </div>
              <p className="mt-3 text-[16px] leading-relaxed tracking-[0.01em] text-terminal-text/95">
                {result.brandPosition.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
