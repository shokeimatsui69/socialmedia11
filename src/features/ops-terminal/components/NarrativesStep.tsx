import React from 'react';
import { MessageSquareText, Radar, ShieldAlert } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { OpsDemoResult } from '../types';

interface NarrativesStepProps {
  result: OpsDemoResult | null;
  isReady: boolean;
}

type Sentiment = 'positive' | 'neutral' | 'negative';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

function riskFromSentiment(sentiment: Sentiment): RiskLevel {
  if (sentiment === 'negative') return 'HIGH';
  if (sentiment === 'neutral') return 'MEDIUM';
  return 'LOW';
}

function sentimentSurface(sentiment: Sentiment): string {
  if (sentiment === 'negative') return 'border-terminal-red/30 bg-terminal-red/[0.04]';
  if (sentiment === 'positive') return 'border-terminal-green/25 bg-terminal-green/[0.03]';
  return 'border-white/[0.07] bg-white/[0.02]';
}

function sentimentLabelClass(sentiment: Sentiment): string {
  if (sentiment === 'negative') return 'text-terminal-red';
  if (sentiment === 'positive') return 'text-terminal-green';
  return 'text-terminal-amber';
}

function riskLabelClass(risk: RiskLevel): string {
  if (risk === 'HIGH') return 'text-terminal-red';
  if (risk === 'MEDIUM') return 'text-terminal-amber';
  return 'text-terminal-green/85';
}

export function NarrativesStep({ result, isReady }: NarrativesStepProps) {
  const priorityTheme = result
    ? [...result.narrativeThemes].sort((a, b) => {
        const order: Record<Sentiment, number> = { negative: 3, neutral: 2, positive: 1 };
        return order[b.sentiment] - order[a.sentiment];
      })[0]
    : null;

  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
          Step 03 · Narrative Layer
        </p>
        <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">
          Narratives &amp; Themes
        </h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
          Extracted discussion themes, sentiment, and representative signals for quick narrative review.
        </p>
      </header>

      {!isReady || !result ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Unlocks after narrative extraction stage completes.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
              Strategic Takeaway
            </p>
            <p className="mt-2.5 text-[14px] leading-relaxed text-terminal-text/90">
              Priority narrative to address now:{' '}
              <span className="font-semibold text-terminal-text/95">{priorityTheme?.title}</span>{' '}
              <span
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.16em]',
                  riskLabelClass(priorityTheme ? riskFromSentiment(priorityTheme.sentiment) : 'LOW'),
                )}
              >
                · {priorityTheme ? riskFromSentiment(priorityTheme.sentiment) : 'N/A'} risk
              </span>{' '}
              before amplification across social channels.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {result.narrativeThemes.map((theme, index) => {
              const risk = riskFromSentiment(theme.sentiment);
              const representativeSignal =
                result.socialSignals[index]?.signal || result.socialSignals[0]?.signal;

              return (
                <article key={theme.title} className={cn('border p-5', sentimentSurface(theme.sentiment))}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MessageSquareText className="h-3.5 w-3.5 text-terminal-text/45" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terminal-text/80">
                        Theme {String(index + 1).padStart(2, '0')}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-[0.18em]',
                        sentimentLabelClass(theme.sentiment),
                      )}
                    >
                      {theme.sentiment}
                    </span>
                  </div>

                  <h3 className="mt-3 text-[14px] font-semibold leading-snug tracking-[0.02em] text-terminal-text/95">
                    {theme.title}
                  </h3>

                  <p className="mt-2.5 text-[12px] leading-relaxed text-terminal-text/70">{theme.evidence}</p>

                  <div className="mt-4 space-y-2.5 border-t border-white/[0.05] pt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-terminal-text/40">Risk Level</p>
                      <p
                        className={cn(
                          'text-[10px] font-semibold uppercase tracking-[0.16em]',
                          riskLabelClass(risk),
                        )}
                      >
                        {risk}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Radar className="mt-0.5 h-3 w-3 shrink-0 text-terminal-text/40" />
                      <p className="text-[11px] leading-relaxed text-terminal-text/65">
                        {representativeSignal}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-start gap-3 border-l-2 border-terminal-amber/40 bg-white/[0.015] px-5 py-3.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-terminal-amber/85" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                Narrative Watch
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-terminal-text/70">
                Prioritize negative and medium-risk narratives first, then reinforce strongest positive themes
                with social and web evidence.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
