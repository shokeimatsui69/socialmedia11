import React from 'react';
import { Minus, TrendingDown, TrendingUp, Users2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { OpsDemoResult } from '../types';

interface AudienceMapStepProps {
  result: OpsDemoResult | null;
  isReady: boolean;
}

type Trend = 'up' | 'stable' | 'down';

function trendIcon(trend: Trend) {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-terminal-green" />;
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-terminal-red/80" />;
  return <Minus className="h-3.5 w-3.5 text-terminal-amber/85" />;
}

function trendBarColor(trend: Trend): string {
  if (trend === 'up') return 'bg-terminal-green/85';
  if (trend === 'down') return 'bg-terminal-red/75';
  return 'bg-terminal-amber/75';
}

function trendCardSurface(trend: Trend): string {
  if (trend === 'down') return 'border-terminal-red/30 bg-terminal-red/[0.04]';
  if (trend === 'up') return 'border-terminal-green/25 bg-terminal-green/[0.03]';
  return 'border-white/[0.07] bg-white/[0.02]';
}

function sentimentLabel(trend: Trend): 'Positive' | 'Neutral' | 'Negative' {
  if (trend === 'up') return 'Positive';
  if (trend === 'down') return 'Negative';
  return 'Neutral';
}

function influenceLevel(share: number): 'High' | 'Medium' | 'Emerging' {
  if (share >= 50) return 'High';
  if (share >= 25) return 'Medium';
  return 'Emerging';
}

export function AudienceMapStep({ result, isReady }: AudienceMapStepProps) {
  const dominantSegment = result
    ? result.followerMap.reduce(
        (best, segment) => (segment.share > best.share ? segment : best),
        result.followerMap[0],
      )
    : null;

  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
          Step 06 · Audience
        </p>
        <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">Audience Map</h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
          Segmented audience view with share weight, sentiment direction, and influence level.
        </p>
      </header>

      {!isReady || !result ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Unlocks after narrative extraction and profile analysis stages complete.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
              Strategic Takeaway
            </p>
            <p className="mt-2.5 text-[14px] leading-relaxed text-terminal-text/90">
              Dominant audience segment is{' '}
              <span className="font-semibold text-terminal-text/95">{dominantSegment?.name}</span> with{' '}
              <span className="font-semibold text-terminal-green">{dominantSegment?.share}%</span> share and{' '}
              <span className="font-semibold uppercase tracking-[0.06em] text-terminal-text/90">
                {dominantSegment ? influenceLevel(dominantSegment.share) : 'N/A'}
              </span>{' '}
              influence.
            </p>
          </div>

          <div className="border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users2 className="h-3.5 w-3.5 text-terminal-text/55" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                    Audience Distribution
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex h-3 overflow-hidden bg-white/[0.04]">
                    {result.followerMap.map((segment) => (
                      <div
                        key={segment.name}
                        className={cn('h-full', trendBarColor(segment.trend))}
                        style={{ width: `${segment.share}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[10px] tracking-[0.04em] text-terminal-text/55">
                    {result.followerMap.map((segment) => (
                      <div key={segment.name} className="flex items-center gap-1.5">
                        <span className={cn('h-1.5 w-1.5', trendBarColor(segment.trend))} />
                        <span>{segment.name}</span>
                        <span className="text-terminal-text/80">{segment.share}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/[0.05] pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                  Dominant Segment
                </p>
                <p className="mt-1.5 text-[15px] font-semibold tracking-[0.02em] text-terminal-text/95">
                  {dominantSegment?.name}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-terminal-green/80">
                  {dominantSegment?.share}% share · {dominantSegment ? influenceLevel(dominantSegment.share) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.followerMap.map((segment) => (
              <article key={segment.name} className={cn('border p-5', trendCardSurface(segment.trend))}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {trendIcon(segment.trend)}
                    <p className="text-[12px] font-semibold leading-snug tracking-[0.02em] text-terminal-text/95">
                      {segment.name}
                    </p>
                  </div>
                  <p className="text-[16px] font-semibold tracking-[0.02em] text-terminal-text/95">
                    {segment.share}%
                  </p>
                </div>

                <div className="mt-4 h-[2px] overflow-hidden bg-white/[0.05]">
                  <div className={cn('h-full', trendBarColor(segment.trend))} style={{ width: `${segment.share}%` }} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.2em] text-terminal-text/40">Sentiment</dt>
                    <dd className="mt-0.5 text-terminal-text/85">{sentimentLabel(segment.trend)}</dd>
                  </div>
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.2em] text-terminal-text/40">Influence</dt>
                    <dd className="mt-0.5 text-terminal-text/85">{influenceLevel(segment.share)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
