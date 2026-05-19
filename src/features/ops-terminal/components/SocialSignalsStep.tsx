import React from 'react';
import { Radar, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { OpsDemoResult } from '../types';

interface SocialSignalsStepProps {
  result: OpsDemoResult | null;
  isReady: boolean;
}

type Sentiment = 'positive' | 'neutral' | 'negative';

function relevanceFromIntensity(intensity: 'high' | 'medium' | 'low'): number {
  if (intensity === 'high') return 88;
  if (intensity === 'medium') return 73;
  return 59;
}

function sentimentFromSignal(signal: string): Sentiment {
  const normalized = signal.toLowerCase();
  if (normalized.includes('positive') || normalized.includes('amplification')) return 'positive';
  if (normalized.includes('increasing') || normalized.includes('friction')) return 'negative';
  return 'neutral';
}

function sentimentSurface(sentiment: Sentiment): string {
  if (sentiment === 'negative') return 'border-terminal-red/30 bg-terminal-red/[0.04]';
  if (sentiment === 'positive') return 'border-terminal-green/25 bg-terminal-green/[0.03]';
  return 'border-white/[0.07] bg-white/[0.02]';
}

function sentimentLabel(sentiment: Sentiment): string {
  if (sentiment === 'negative') return 'text-terminal-red';
  if (sentiment === 'positive') return 'text-terminal-green';
  return 'text-terminal-amber';
}

function intensityLabel(intensity: 'high' | 'medium' | 'low'): string {
  if (intensity === 'high') return 'text-terminal-red';
  if (intensity === 'medium') return 'text-terminal-amber';
  return 'text-terminal-text/55';
}

export function SocialSignalsStep({ result, isReady }: SocialSignalsStepProps) {
  const topSignal = result
    ? [...result.socialSignals].sort(
        (a, b) => relevanceFromIntensity(b.intensity) - relevanceFromIntensity(a.intensity),
      )[0]
    : null;

  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
          Step 04 · Social Pulse
        </p>
        <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">
          Social / X Signals
        </h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
          External social pulse from X and related communities, ranked by relevance and sentiment.
        </p>
      </header>

      {!isReady || !result ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Unlocks after social signal discovery stage completes.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
              Strategic Takeaway
            </p>
            <p className="mt-2.5 text-[14px] leading-relaxed text-terminal-text/90">
              Highest external pressure currently comes from{' '}
              <span className="font-semibold text-terminal-text/95">{topSignal?.source || 'signal stream'}</span>{' '}
              with{' '}
              <span
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.16em]',
                  intensityLabel(topSignal?.intensity || 'low'),
                )}
              >
                · {topSignal?.intensity || 'building'} intensity
              </span>
              .
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.socialSignals.map((signal) => {
              const relevance = relevanceFromIntensity(signal.intensity);
              const sentiment = sentimentFromSignal(signal.signal);

              return (
                <article key={signal.signal} className={cn('border p-5', sentimentSurface(sentiment))}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Radar className="h-3.5 w-3.5 text-terminal-text/45" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terminal-text/65">
                        External Signal
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-[0.18em]',
                        sentimentLabel(sentiment),
                      )}
                    >
                      {sentiment}
                    </span>
                  </div>

                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/55">
                    {signal.source}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-terminal-text/90">{signal.signal}</p>

                  <div className="mt-4 space-y-2 border-t border-white/[0.05] pt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-terminal-text/40">Relevance</p>
                      <p className="text-[11px] font-semibold tracking-[0.04em] text-terminal-text/85">
                        {relevance}%
                      </p>
                    </div>
                    <div className="h-[2px] overflow-hidden bg-white/[0.05]">
                      <div
                        className={cn(
                          'h-full',
                          sentiment === 'negative'
                            ? 'bg-terminal-red/75'
                            : sentiment === 'positive'
                              ? 'bg-terminal-green/85'
                              : 'bg-terminal-amber/70',
                        )}
                        style={{ width: `${relevance}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-terminal-text/40">Intensity</p>
                      <p
                        className={cn(
                          'text-[10px] font-semibold uppercase tracking-[0.16em]',
                          intensityLabel(signal.intensity),
                        )}
                      >
                        {signal.intensity}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-start gap-3 border-l-2 border-terminal-green/40 bg-white/[0.015] px-5 py-3.5">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-terminal-green/85" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                Social Intelligence Note
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-terminal-text/70">
                These signals represent external market conversation pressure and should be cross-checked
                against web evidence before final positioning decisions.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
