import React from 'react';
import { MessageSquareText, Radar, ShieldAlert } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { OpsNarrativesVM, OpsNarrativeVM, RunnerSentiment } from '../types';

interface NarrativesStepProps {
  narratives: OpsNarrativesVM;
}

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

function riskFromSentiment(sentiment: RunnerSentiment): RiskLevel {
  if (sentiment === 'negative') return 'HIGH';
  if (sentiment === 'neutral') return 'MEDIUM';
  return 'LOW';
}

function sentimentSurface(sentiment: RunnerSentiment): string {
  if (sentiment === 'negative') return 'border-terminal-red/30 bg-terminal-red/[0.04]';
  if (sentiment === 'positive') return 'border-terminal-green/25 bg-terminal-green/[0.03]';
  return 'border-white/[0.07] bg-white/[0.02]';
}

function sentimentLabelClass(sentiment: RunnerSentiment): string {
  if (sentiment === 'negative') return 'text-terminal-red';
  if (sentiment === 'positive') return 'text-terminal-green';
  return 'text-terminal-amber';
}

function riskLabelClass(risk: RiskLevel): string {
  if (risk === 'HIGH') return 'text-terminal-red';
  if (risk === 'MEDIUM') return 'text-terminal-amber';
  return 'text-terminal-green/85';
}

function compactReach(value?: number): string | null {
  if (!value || value <= 0) return null;
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

interface NarrativeCardProps {
  theme: OpsNarrativeVM;
  index: number;
}

const NarrativeCard: React.FC<NarrativeCardProps> = ({ theme, index }) => {
  const risk = riskFromSentiment(theme.sentiment);
  const reach = compactReach(theme.reach);

  return (
    <article className={cn('border p-5', sentimentSurface(theme.sentiment))}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-3.5 w-3.5 text-terminal-text/45" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terminal-text/80">
            Theme {String(index + 1).padStart(2, '0')}
          </p>
        </div>
        <span className={cn('text-[10px] font-semibold uppercase tracking-[0.18em]', sentimentLabelClass(theme.sentiment))}>
          {theme.sentiment}
        </span>
      </div>

      <h3 className="mt-3 text-[14px] font-semibold leading-snug tracking-[0.02em] text-terminal-text/95">
        {theme.title}
      </h3>

      <p className="mt-2.5 text-[12px] leading-relaxed text-terminal-text/70">{theme.description}</p>

      <div className="mt-4 space-y-2.5 border-t border-white/[0.05] pt-3">
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-terminal-text/40">Risk Level</p>
            <p className={cn('mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em]', riskLabelClass(risk))}>
              {risk}
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-terminal-text/40">Reach</p>
            <p className="mt-0.5 text-[11px] text-terminal-text/85">{reach ?? '—'}</p>
          </div>
        </div>

        {theme.confidence !== undefined && (
          <div>
            <div className="flex items-center justify-between text-[10px] tracking-[0.04em] text-terminal-text/45">
              <span className="uppercase tracking-[0.18em]">Confidence</span>
              <span className="text-terminal-text/80">{Math.round(theme.confidence * 100)}%</span>
            </div>
            <div className="mt-1 h-[2px] overflow-hidden bg-white/[0.05]">
              <div
                className={cn(
                  'h-full',
                  theme.sentiment === 'negative'
                    ? 'bg-terminal-red/75'
                    : theme.sentiment === 'positive'
                      ? 'bg-terminal-green/85'
                      : 'bg-terminal-amber/70',
                )}
                style={{ width: `${Math.round(theme.confidence * 100)}%` }}
              />
            </div>
          </div>
        )}

        {theme.representativeSignal && (
          <div className="flex items-start gap-2">
            <Radar className="mt-0.5 h-3 w-3 shrink-0 text-terminal-text/40" />
            <p className="text-[11px] leading-relaxed text-terminal-text/65">{theme.representativeSignal}</p>
          </div>
        )}

        {theme.narrativeEvidence && theme.narrativeEvidence.length > 0 && (
          <div className="space-y-1.5">
            {theme.narrativeEvidence.slice(0, 2).map((item) => (
              <div key={item.commentId} className="border-l border-white/[0.08] pl-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-terminal-text/45">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-terminal-text/60">{item.summary}</p>
              </div>
            ))}
          </div>
        )}

        {theme.keywords && theme.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {theme.keywords.slice(0, 4).map((keyword) => (
              <span
                key={keyword}
                className="border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-terminal-text/65"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export function NarrativesStep({ narratives }: NarrativesStepProps) {
  const { isReady, themes, priorityTheme } = narratives;

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

      {!isReady ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Unlocks after narrative extraction stage completes.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {priorityTheme && (
            <div className="border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Strategic Takeaway
              </p>
              <p className="mt-2.5 text-[14px] leading-relaxed text-terminal-text/90">
                Priority narrative to address now:{' '}
                <span className="font-semibold text-terminal-text/95">{priorityTheme.title}</span>{' '}
                <span
                  className={cn(
                    'text-[11px] font-semibold uppercase tracking-[0.16em]',
                    riskLabelClass(riskFromSentiment(priorityTheme.sentiment)),
                  )}
                >
                  · {riskFromSentiment(priorityTheme.sentiment)} risk
                </span>{' '}
                before amplification across social channels.
              </p>
            </div>
          )}

          {themes.length === 0 ? (
            <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
                No narrative themes returned yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {themes.map((theme, index) => (
                <NarrativeCard key={theme.id} theme={theme} index={index} />
              ))}
            </div>
          )}

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
