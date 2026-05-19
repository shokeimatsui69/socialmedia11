import React from 'react';
import { Minus, TrendingDown, TrendingUp, Users2 } from 'lucide-react';
import { Card } from '../../../components/ui/Primitives';
import { cn } from '../../../lib/utils';
import { OpsDemoResult } from '../types';

interface AudienceMapStepProps {
  result: OpsDemoResult | null;
  isReady: boolean;
}

function trendIcon(trend: 'up' | 'stable' | 'down') {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-terminal-green" />;
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-terminal-red/70" />;
  return <Minus className="h-3.5 w-3.5 text-terminal-amber/80" />;
}

function trendBarClass(trend: 'up' | 'stable' | 'down'): string {
  if (trend === 'up') return 'bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.32)]';
  if (trend === 'down') return 'bg-terminal-red/80 shadow-[0_0_10px_rgba(255,77,77,0.25)]';
  return 'bg-terminal-amber/80 shadow-[0_0_10px_rgba(255,176,32,0.22)]';
}

function sentimentLabel(trend: 'up' | 'stable' | 'down'): 'Positive' | 'Neutral' | 'Negative' {
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
    ? result.followerMap.reduce((best, segment) => (segment.share > best.share ? segment : best), result.followerMap[0])
    : null;

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-terminal-text/90">Audience Map</h2>
        <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/60">
          Segmented audience view with share weight, sentiment direction, and influence level.
        </p>
      </header>

      {!isReady || !result ? (
        <Card className="border-terminal-border/30 bg-black/35 p-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-terminal-text/55">
            Unlocks after narrative extraction and profile analysis stages complete.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="border-terminal-border/30 bg-black/40 p-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px]">
              <div>
                <div className="flex items-center gap-2">
                  <Users2 className="h-4 w-4 text-terminal-green/80" />
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-terminal-text/68">
                    Audience Distribution
                  </p>
                </div>
                <div className="mt-3 flex h-4 overflow-hidden border border-terminal-border/20 bg-black/35">
                  {result.followerMap.map((segment) => (
                    <div
                      key={segment.name}
                      className={cn('h-full transition-all', trendBarClass(segment.trend))}
                      style={{ width: `${segment.share}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="border-l border-terminal-border/18 pl-4">
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">Dominant Segment</p>
                <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.09em] text-terminal-text/90">
                  {dominantSegment?.name}
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-terminal-green/72">
                  {dominantSegment?.share}% share · {dominantSegment ? influenceLevel(dominantSegment.share) : 'N/A'} influence
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {result.followerMap.map((segment) => (
              <Card key={segment.name} className="border-terminal-border/30 bg-black/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {trendIcon(segment.trend)}
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-terminal-text/88">{segment.name}</p>
                  </div>
                  <p className="text-[10px] font-bold text-terminal-green/82">{segment.share}%</p>
                </div>

                <div className="mt-3 h-[3px] bg-white/5">
                  <div className={cn('h-full', trendBarClass(segment.trend))} style={{ width: `${segment.share}%` }} />
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {Array.from({ length: Math.max(3, Math.round(segment.share / 10)) }).map((_, index) => (
                    <span
                      key={`${segment.name}-${index}`}
                      className={cn(
                        'h-2.5 w-2.5 rounded-full border',
                        segment.trend === 'up'
                          ? 'border-terminal-green/35 bg-terminal-green/60'
                          : segment.trend === 'down'
                            ? 'border-terminal-red/35 bg-terminal-red/60'
                            : 'border-terminal-amber/35 bg-terminal-amber/60',
                      )}
                    />
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[9px]">
                  <div className="border border-terminal-border/18 bg-black/25 p-2">
                    <p className="text-[8px] uppercase tracking-[0.12em] text-terminal-text/45">Sentiment</p>
                    <p className="mt-1 text-terminal-text/82">{sentimentLabel(segment.trend)}</p>
                  </div>
                  <div className="border border-terminal-border/18 bg-black/25 p-2">
                    <p className="text-[8px] uppercase tracking-[0.12em] text-terminal-text/45">Influence</p>
                    <p className="mt-1 text-terminal-text/82">{influenceLevel(segment.share)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
