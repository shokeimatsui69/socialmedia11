import React from 'react';
import { ExternalLink, FileSearch, Globe2, MessageCircle, Newspaper } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { OpsWebEvidenceVM } from '../types';

interface WebEvidenceStepProps {
  evidence: OpsWebEvidenceVM;
}

function confidenceAccent(confidence: number): string {
  if (confidence >= 85) return 'text-terminal-green';
  if (confidence >= 70) return 'text-terminal-text/90';
  return 'text-terminal-amber';
}

function confidenceBar(confidence: number): string {
  if (confidence >= 85) return 'bg-terminal-green/85';
  if (confidence >= 70) return 'bg-terminal-text/55';
  return 'bg-terminal-amber/70';
}

function providerAccent(state: OpsWebEvidenceVM['providerState']): string {
  if (state === 'ok') return 'text-terminal-green';
  if (state === 'warning') return 'text-terminal-amber';
  if (state === 'error') return 'text-terminal-red';
  return 'text-terminal-text/55';
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function WebEvidenceStep({ evidence }: WebEvidenceStepProps) {
  const { isReady, items, strongest, webIntelligence, providerSummary, providerState, newsSource } = evidence;
  const hasParsedSummary = Boolean(webIntelligence?.summary);
  const hasParsedSentiment = Boolean(webIntelligence?.sentiment);
  const hasMarketNarratives = (webIntelligence?.marketNarratives.length ?? 0) > 0;
  const hasIndustryDiscussions = (webIntelligence?.industryDiscussions.length ?? 0) > 0;
  const hasParsedContext =
    hasParsedSummary || hasParsedSentiment || hasMarketNarratives || hasIndustryDiscussions;

  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
          Step 05 · Validation
        </p>
        <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">Web Evidence</h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
          Supporting evidence records used to validate narratives and final recommendation confidence.
        </p>
      </header>

      {!isReady ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Unlocks after web evidence stage completes.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-3.5 w-3.5 text-terminal-text/55" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                    OpenAI Web Intelligence
                  </p>
                </div>
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-[0.18em]',
                    providerAccent(providerState),
                  )}
                >
                  {providerState}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-terminal-text/80">
                {providerSummary ?? 'No provider summary available.'}
              </p>
            </div>
            {newsSource && (
              <div className="border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-3.5 w-3.5 text-terminal-text/55" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                      News Source Run
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-[0.18em]',
                      newsSource.state === 'ok'
                        ? 'text-terminal-green'
                        : newsSource.state === 'warning'
                          ? 'text-terminal-amber'
                          : 'text-terminal-red',
                    )}
                  >
                    {newsSource.state}
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-terminal-text/80">
                  {newsSource.records.toLocaleString()} record(s) collected
                </p>
              </div>
            )}
          </div>

          {hasParsedSummary && (
            <div className="border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Web Summary
              </p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-terminal-text/90">
                {webIntelligence.summary}
              </p>
            </div>
          )}

          {hasParsedSentiment && webIntelligence.sentiment && (
            <div className="border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Web Sentiment
              </p>
              <div className="mt-2.5 flex h-2 overflow-hidden bg-white/[0.04]">
                <div className="h-full bg-terminal-green/85" style={{ width: `${clamp(webIntelligence.sentiment.positive)}%` }} />
                <div className="h-full bg-terminal-amber/70" style={{ width: `${clamp(webIntelligence.sentiment.neutral)}%` }} />
                <div className="h-full bg-terminal-red/75" style={{ width: `${clamp(webIntelligence.sentiment.negative)}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] tracking-[0.04em] text-terminal-text/55">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-terminal-green/85" />
                  Positive {clamp(webIntelligence.sentiment.positive)}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-terminal-amber/70" />
                  Neutral {clamp(webIntelligence.sentiment.neutral)}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-terminal-red/75" />
                  Negative {clamp(webIntelligence.sentiment.negative)}%
                </span>
              </div>
            </div>
          )}

          {(hasMarketNarratives || hasIndustryDiscussions) && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {hasMarketNarratives && (
                <div className="border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 text-terminal-green/80" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                      Market Narratives
                    </p>
                  </div>
                  <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-terminal-text/80">
                    {webIntelligence.marketNarratives.slice(0, 6).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1.5 h-px w-2 shrink-0 bg-terminal-text/35" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hasIndustryDiscussions && (
                <div className="border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 text-terminal-amber/85" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                      Industry Discussions
                    </p>
                  </div>
                  <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-terminal-text/80">
                    {webIntelligence.industryDiscussions.slice(0, 6).map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1.5 h-px w-2 shrink-0 bg-terminal-text/35" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {items.length === 0 ? (
            !hasParsedContext && (
              <div className="flex items-start gap-3 border border-white/[0.06] bg-white/[0.02] p-6">
                <div className="flex h-9 w-9 items-center justify-center border border-white/[0.08] bg-white/[0.03]">
                  <FileSearch className="h-4 w-4 text-terminal-text/55" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold tracking-[0.04em] text-terminal-text/85">
                    No web evidence returned yet
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-terminal-text/55">
                    The web evidence pass completed without qualifying outlet matches. Narratives and social signals
                    remain the primary validation surface for the recommendation.
                  </p>
                </div>
              </div>
            )
          ) : (
            <>
              {strongest && (
                <div className="border border-white/[0.06] bg-white/[0.02] p-5">
                  <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                    Strategic Takeaway
                  </p>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-terminal-text/90">
                    Strongest supporting evidence currently comes from{' '}
                    <span className="font-semibold text-terminal-text/95">{strongest.outlet}</span> at{' '}
                    <span className={`font-semibold ${confidenceAccent(strongest.confidence)}`}>
                      {strongest.confidence}%
                    </span>{' '}
                    relevance.
                  </p>
                </div>
              )}

              <ul className="divide-y divide-white/[0.05] border border-white/[0.06] bg-white/[0.015]">
                {items.map((item) => (
                  <li key={item.id} className="grid grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-[1fr_180px]">
                    <div className="min-w-0 space-y-2.5">
                      <div className="flex items-center gap-2 text-terminal-text/55">
                        <Globe2 className="h-3.5 w-3.5" />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/75">
                          {item.outlet}
                        </p>
                        <span className="text-[10px] tracking-[0.04em] text-terminal-text/40">{item.domain}</span>
                      </div>
                      <h3 className="text-[14px] font-semibold leading-snug tracking-[0.02em] text-terminal-text/95">
                        {item.title}
                      </h3>
                      <p className="text-[12px] leading-relaxed text-terminal-text/70">{item.excerpt}</p>
                    </div>

                    <div className="space-y-3 border-t border-white/[0.05] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                      <div>
                        <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                          Relevance
                        </p>
                        <p className={`mt-1 text-[24px] font-semibold tracking-[0.02em] ${confidenceAccent(item.confidence)}`}>
                          {item.confidence}%
                        </p>
                        <div className="mt-2 h-[2px] overflow-hidden bg-white/[0.05]">
                          <div
                            className={`h-full ${confidenceBar(item.confidence)}`}
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                      </div>

                      {item.url && (
                        <div>
                          <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">Source</p>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-terminal-green/85 transition-colors hover:text-terminal-green"
                          >
                            Open Source
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {!webIntelligence?.isParsed && webIntelligence?.rawSummary && (
            <div className="border border-dashed border-white/[0.08] bg-white/[0.015] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/55">
                Provider Summary
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-terminal-text/75">
                {webIntelligence.rawSummary.slice(0, 600)}
                {webIntelligence.rawSummary.length > 600 ? '…' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
