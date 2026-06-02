import React from 'react';
import { ExternalLink, Lightbulb, MessageSquare, Radar, ShieldAlert, Sparkles, Target } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { OpsSocialSignalsVM, OpsSocialSignalVM, RunnerSentiment } from '../types';

interface SocialSignalsStepProps {
  signals: OpsSocialSignalsVM;
}

function sentimentSurface(sentiment: RunnerSentiment): string {
  if (sentiment === 'negative') return 'border-terminal-red/30 bg-terminal-red/[0.04]';
  if (sentiment === 'positive') return 'border-terminal-green/25 bg-terminal-green/[0.03]';
  return 'border-white/[0.07] bg-white/[0.02]';
}

function sentimentLabel(sentiment: RunnerSentiment): string {
  if (sentiment === 'negative') return 'text-terminal-red';
  if (sentiment === 'positive') return 'text-terminal-green';
  return 'text-terminal-amber';
}

function intensityLabel(intensity: OpsSocialSignalVM['intensity']): string {
  if (intensity === 'high') return 'text-terminal-red';
  if (intensity === 'medium') return 'text-terminal-amber';
  return 'text-terminal-text/55';
}

function urgencyClass(urgency: 'low' | 'medium' | 'high'): string {
  if (urgency === 'high') return 'text-terminal-red';
  if (urgency === 'medium') return 'text-terminal-amber';
  return 'text-terminal-green';
}

function coverageClass(level?: 'strong' | 'moderate' | 'thin'): string {
  if (level === 'strong') return 'border-terminal-green/30 bg-terminal-green/[0.05] text-terminal-green';
  if (level === 'moderate') return 'border-terminal-amber/30 bg-terminal-amber/[0.05] text-terminal-amber';
  return 'border-white/[0.08] bg-white/[0.03] text-terminal-text/65';
}

function xaiAccent(state: 'ok' | 'warning' | 'error' | 'idle'): string {
  if (state === 'ok') return 'text-terminal-green';
  if (state === 'warning') return 'text-terminal-amber';
  if (state === 'error') return 'text-terminal-red';
  return 'text-terminal-text/55';
}

export function SocialSignalsStep({ signals }: SocialSignalsStepProps) {
  const { isReady, signals: items, topSignal, xIntelligence } = signals;
  const hasDeepDive =
    xIntelligence.narrativeRadar.length > 0 ||
    xIntelligence.liveDiscussions.length > 0 ||
    xIntelligence.responsePlaybook.length > 0 ||
    xIntelligence.riskWatchlist.length > 0 ||
    xIntelligence.audienceQuestions.length > 0 ||
    xIntelligence.whitespaceOpportunities.length > 0;

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
          Grok-powered X/Twitter intelligence only: live discussion, narrative movement, risks, and response plays.
        </p>
      </header>

      {!isReady ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Unlocks after Grok/X intelligence stage completes.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Radar className="h-3.5 w-3.5 text-terminal-text/55" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                  X / Grok Intelligence
                </p>
              </div>
              <span className={cn('text-[10px] font-semibold uppercase tracking-[0.18em]', xaiAccent(xIntelligence.state))}>
                {xIntelligence.state}
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-terminal-text/80">{xIntelligence.summary}</p>
            {xIntelligence.errors.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-[11px] text-terminal-text/65">
                {xIntelligence.errors.map((errorMessage, idx) => (
                  <li key={`${errorMessage}-${idx}`} className="truncate">• {errorMessage}</li>
                ))}
              </ul>
            )}
            {(xIntelligence.alignment || xIntelligence.momentum) && (
              <div className="mt-3 grid grid-cols-1 gap-3 border-t border-white/[0.05] pt-3 md:grid-cols-2">
                {xIntelligence.alignment && (
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-terminal-text/45">
                      X Resonance
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-terminal-text/80">{xIntelligence.alignment}</p>
                  </div>
                )}
                {xIntelligence.momentum && (
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-terminal-text/45">
                      X Trend Momentum
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-terminal-text/80">{xIntelligence.momentum}</p>
                  </div>
                )}
              </div>
            )}
            {(xIntelligence.evidenceLevel || xIntelligence.queryFocus.length > 0) && (
              <div className="mt-3 space-y-3 border-t border-white/[0.05] pt-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-terminal-text/45">
                    X Search Coverage
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-terminal-text/65">
                    {xIntelligence.evidenceRationale ||
                      'Grok checked the current X query angles for this target. Coverage describes search confidence, not positive signal strength.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {xIntelligence.evidenceLevel && (
                    <span className={cn('border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em]', coverageClass(xIntelligence.evidenceLevel))}>
                      {xIntelligence.evidenceLevel} coverage
                    </span>
                  )}
                  {xIntelligence.queryFocus.slice(0, 4).map((query) => (
                    <span key={query} className="max-w-full break-words border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-terminal-text/55">
                      {query}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasDeepDive && (
            <div className="space-y-5">
              {xIntelligence.narrativeRadar.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-terminal-green/75" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                      Grok Narrative Radar
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    {xIntelligence.narrativeRadar.slice(0, 6).map((item) => (
                      <article key={`${item.label}-${item.whatIsHappening}`} className={cn('border p-4', sentimentSurface(item.sentiment))}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-terminal-text/90">{item.label}</p>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-terminal-text/40">
                              {item.momentum} momentum
                            </p>
                          </div>
                          <span className={cn('shrink-0 text-[9px] font-semibold uppercase tracking-[0.16em]', urgencyClass(item.urgency))}>
                            {item.urgency}
                          </span>
                        </div>
                        <p className="mt-3 text-[12px] leading-relaxed text-terminal-text/75">{item.whatIsHappening}</p>
                        {item.evidence.length > 0 && (
                          <ul className="mt-3 space-y-1 border-t border-white/[0.05] pt-3">
                            {item.evidence.slice(0, 2).map((evidence) => (
                              <li key={evidence} className="text-[10px] leading-snug text-terminal-text/55">
                                {evidence}
                              </li>
                            ))}
                          </ul>
                        )}
                        {item.keywords.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {item.keywords.slice(0, 4).map((keyword) => (
                              <span key={keyword} className="border border-white/[0.08] bg-black/20 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-terminal-text/45">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {xIntelligence.liveDiscussions.length > 0 && (
                <div className="border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-terminal-text/55" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                      Live X Discussions
                    </p>
                  </div>
                  <div className="space-y-2">
                    {xIntelligence.liveDiscussions.slice(0, 5).map((discussion) => (
                      <article key={`${discussion.title}-${discussion.url || discussion.summary}`} className="border border-white/[0.06] bg-black/20 px-3 py-2.5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-terminal-text/85">{discussion.title}</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-terminal-text/65">{discussion.summary}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className={cn('text-[9px] font-semibold uppercase tracking-[0.16em]', sentimentLabel(discussion.sentiment))}>
                              {discussion.sentiment}
                            </span>
                            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-terminal-text/40">
                              {discussion.relevance}%
                            </span>
                            {discussion.url && (
                              <a href={discussion.url} target="_blank" rel="noreferrer" className="text-terminal-green/80 transition-colors hover:text-terminal-green" aria-label={`Open ${discussion.title}`}>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                        {discussion.whyItMatters && (
                          <p className="mt-2 text-[10px] leading-relaxed text-terminal-text/45">
                            Why it matters: {discussion.whyItMatters}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {(xIntelligence.responsePlaybook.length > 0 || xIntelligence.riskWatchlist.length > 0) && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {xIntelligence.responsePlaybook.length > 0 && (
                    <div className="border border-terminal-green/20 bg-terminal-green/[0.025] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Lightbulb className="h-3.5 w-3.5 text-terminal-green/80" />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                          Response Playbook
                        </p>
                      </div>
                      <ul className="space-y-3">
                        {xIntelligence.responsePlaybook.slice(0, 4).map((play) => (
                          <li key={`${play.move}-${play.timing}`} className="border border-white/[0.06] bg-black/20 px-3 py-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-[11px] font-semibold text-terminal-text/85">{play.move}</p>
                              <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em] text-terminal-green/75">
                                {Math.round(play.confidence * 100)}%
                              </span>
                            </div>
                            <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/60">{play.why}</p>
                            <p className="mt-2 text-[10px] leading-relaxed text-terminal-text/45">
                              Angle: {play.copyAngle}
                            </p>
                            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-terminal-text/35">
                              Timing: {play.timing}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {xIntelligence.riskWatchlist.length > 0 && (
                    <div className="border border-terminal-red/20 bg-terminal-red/[0.02] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <ShieldAlert className="h-3.5 w-3.5 text-terminal-red/80" />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                          Risk Watchlist
                        </p>
                      </div>
                      <ul className="space-y-3">
                        {xIntelligence.riskWatchlist.slice(0, 4).map((risk) => (
                          <li key={`${risk.risk}-${risk.trigger}`} className="border border-white/[0.06] bg-black/20 px-3 py-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-[11px] font-semibold text-terminal-text/85">{risk.risk}</p>
                              <span className={cn('shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em]', urgencyClass(risk.severity))}>
                                {risk.severity}
                              </span>
                            </div>
                            <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/55">
                              Trigger: {risk.trigger}
                            </p>
                            <p className="mt-2 text-[10px] leading-relaxed text-terminal-text/70">
                              Move: {risk.recommendedMove}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {(xIntelligence.audienceQuestions.length > 0 || xIntelligence.whitespaceOpportunities.length > 0) && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {xIntelligence.audienceQuestions.length > 0 && (
                    <div className="border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                        Audience Questions To Answer
                      </p>
                      <ul className="mt-3 space-y-2">
                        {xIntelligence.audienceQuestions.slice(0, 5).map((question) => (
                          <li key={question} className="text-[11px] leading-relaxed text-terminal-text/70">
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {xIntelligence.whitespaceOpportunities.length > 0 && (
                    <div className="border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                        Whitespace Opportunities
                      </p>
                      <ul className="mt-3 space-y-2">
                        {xIntelligence.whitespaceOpportunities.slice(0, 5).map((opportunity) => (
                          <li key={opportunity} className="text-[11px] leading-relaxed text-terminal-text/70">
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {items.length === 0 ? (
            <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
                No qualifying X signals found by Grok.
              </p>
            </div>
          ) : (
          <>
          {topSignal && (
            <div className="border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Strategic Takeaway
              </p>
              <p className="mt-2.5 text-[14px] leading-relaxed text-terminal-text/90">
                Highest X pressure currently comes from{' '}
                <span className="font-semibold text-terminal-text/95">{topSignal.source}</span> with{' '}
                <span
                  className={cn(
                    'text-[11px] font-semibold uppercase tracking-[0.16em]',
                    intensityLabel(topSignal.intensity),
                  )}
                >
                  · {topSignal.intensity} intensity
                </span>
                .
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((signal) => (
              <article key={signal.id} className={cn('border p-5', sentimentSurface(signal.sentiment))}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Radar className="h-3.5 w-3.5 text-terminal-text/45" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terminal-text/65">
                      X Signal
                    </p>
                  </div>
                  <span
                    className={cn('text-[10px] font-semibold uppercase tracking-[0.18em]', sentimentLabel(signal.sentiment))}
                  >
                    {signal.sentiment}
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
                      {signal.relevance}%
                    </p>
                  </div>
                  <div className="h-[2px] overflow-hidden bg-white/[0.05]">
                    <div
                      className={cn(
                        'h-full',
                        signal.sentiment === 'negative'
                          ? 'bg-terminal-red/75'
                          : signal.sentiment === 'positive'
                            ? 'bg-terminal-green/85'
                            : 'bg-terminal-amber/70',
                      )}
                      style={{ width: `${signal.relevance}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-terminal-text/40">Intensity</p>
                    <p className={cn('text-[10px] font-semibold uppercase tracking-[0.16em]', intensityLabel(signal.intensity))}>
                      {signal.intensity}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-start gap-3 border-l-2 border-terminal-green/40 bg-white/[0.015] px-5 py-3.5">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-terminal-green/85" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                X Intelligence Note
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-terminal-text/70">
                These signals come only from Grok/X search. If no X evidence appears, treat the absence as a
                channel-specific finding, not a full-market conclusion.
              </p>
            </div>
          </div>
          </>
          )}
        </div>
      )}
    </section>
  );
}
