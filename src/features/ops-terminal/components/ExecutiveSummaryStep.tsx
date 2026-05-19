import React from 'react';
import { AlertTriangle, BarChart3, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import type { OpsExecutiveSummaryVM, OpsRunStatus } from '../types';

interface ExecutiveSummaryStepProps {
  summary: OpsExecutiveSummaryVM;
  runStatus: OpsRunStatus;
}

function compact(value: number): string {
  if (value >= 1000) return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  return value.toLocaleString();
}

function healthAccent(status: OpsExecutiveSummaryVM['metrics']['healthStatus']): string {
  if (status === 'Stable') return 'text-terminal-green';
  if (status === 'Watch') return 'text-terminal-amber';
  return 'text-terminal-red';
}

export function ExecutiveSummaryStep({ summary, runStatus }: ExecutiveSummaryStepProps) {
  const isReady = summary.isReady && runStatus !== 'idle';

  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
          Step 02 · Briefing
        </p>
        <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">
          Executive Summary
        </h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
          First result-oriented briefing focused on audience status, risk, opportunity, and recommended action.
        </p>
      </header>

      {!isReady ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Launch the mission from Setup to unlock the executive briefing.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                  Executive Takeaway
                </p>
                <p className="mt-2.5 text-[15px] leading-relaxed text-terminal-text/95">
                  {summary.takeawaySentence}
                </p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] ${healthAccent(
                  summary.metrics.healthStatus,
                )}`}
              >
                {summary.metrics.healthStatus}
              </span>
            </div>
          </div>

          <div className="border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-terminal-text/55" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                Report Metrics
              </p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 md:grid-cols-4">
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">Posts</dt>
                <dd className="mt-1 text-[18px] font-semibold tracking-[0.02em] text-terminal-text/95">
                  {compact(summary.metrics.posts)}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">Comments</dt>
                <dd className="mt-1 text-[18px] font-semibold tracking-[0.02em] text-terminal-text/95">
                  {compact(summary.metrics.comments)}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">Commenters</dt>
                <dd className="mt-1 text-[18px] font-semibold tracking-[0.02em] text-terminal-text/95">
                  {compact(summary.metrics.commenters)}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                  Account Health
                </dt>
                <dd className={`mt-1 text-[18px] font-semibold tracking-[0.02em] ${healthAccent(summary.metrics.healthStatus)}`}>
                  {summary.metrics.health}
                </dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-white/[0.05] pt-3">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Sentiment Distribution
              </p>
              <div className="mt-2 flex h-2 overflow-hidden bg-white/[0.04]">
                <div className="h-full bg-terminal-green/85" style={{ width: `${summary.metrics.sentiment.positive}%` }} />
                <div className="h-full bg-terminal-amber/70" style={{ width: `${summary.metrics.sentiment.neutral}%` }} />
                <div className="h-full bg-terminal-red/75" style={{ width: `${summary.metrics.sentiment.negative}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] tracking-[0.04em] text-terminal-text/55">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-terminal-green/85" />
                  Positive {summary.metrics.sentiment.positive}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-terminal-amber/70" />
                  Neutral {summary.metrics.sentiment.neutral}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-terminal-red/75" />
                  Negative {summary.metrics.sentiment.negative}%
                </span>
              </div>
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
              <p className="mt-3 text-[13px] leading-relaxed text-terminal-text/85">{summary.mainOpportunity}</p>
            </div>

            <div className="border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-terminal-red/85" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                  Main Risk
                </p>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-terminal-text/85">{summary.mainRisk}</p>
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
              {summary.brandPositionSnapshot ? (
                <dl className="mt-4 space-y-2.5 text-[12px] leading-relaxed">
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-green/75">
                      Strength
                    </dt>
                    <dd className="text-terminal-text/85">
                      {summary.brandPositionSnapshot.strength ?? 'Pending positive narrative.'}
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-amber/80">
                      Weakness
                    </dt>
                    <dd className="text-terminal-text/85">
                      {summary.brandPositionSnapshot.weakness ?? 'Pending friction narrative.'}
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-red/85">
                      Threat
                    </dt>
                    <dd className="text-terminal-text/85">
                      {summary.brandPositionSnapshot.threat ?? 'Pending competitor data.'}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-[12px] leading-relaxed text-terminal-text/55">
                  Brand position will assemble after audience and competitor stages complete.
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
                  {summary.recommendation ??
                    'Recommendation will appear once the response plan stage completes.'}
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
