import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  LayoutGrid,
  Lightbulb,
  Link2,
  MessageSquareText,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { OpsCompetitorsVM, OpsCompetitorVM, OpsStealPlayVM } from '../types';

interface CompetitorsStepProps {
  competitors: OpsCompetitorsVM;
}

function riskSurface(level: OpsCompetitorVM['riskLevel']): string {
  if (level === 'HIGH') return 'border-terminal-red/35 bg-terminal-red/[0.04]';
  if (level === 'MEDIUM') return 'border-terminal-amber/30 bg-terminal-amber/[0.03]';
  return 'border-white/[0.07] bg-white/[0.02]';
}

function riskLabelClass(level: OpsCompetitorVM['riskLevel']): string {
  if (level === 'HIGH') return 'text-terminal-red';
  if (level === 'MEDIUM') return 'text-terminal-amber';
  return 'text-terminal-text/65';
}

function riskAccentText(level: OpsCompetitorVM['riskLevel']): string {
  if (level === 'HIGH') return 'text-terminal-red/85';
  if (level === 'MEDIUM') return 'text-terminal-amber/85';
  return 'text-terminal-text/65';
}

function formatConfidence(value?: number): string {
  if (typeof value !== 'number') return 'Pending';
  return `${Math.round(value * 100)}%`;
}

function formatScore(value?: number): string {
  if (typeof value !== 'number') return 'Pending';
  return `${Math.round(value)}%`;
}

function SourcePill({ source }: { source?: string }) {
  const isOpenAi = source === 'openai';
  return (
    <span className={cn(
      'shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em]',
      isOpenAi ? 'text-terminal-green/80' : 'text-terminal-amber/80',
    )}>
      {isOpenAi ? 'OpenAI' : 'Fallback'}
    </span>
  );
}

function scopeLabel(scope?: string): string | undefined {
  if (scope === 'origin') return 'Origin market';
  if (scope === 'eu') return 'EU benchmark';
  if (scope === 'us') return 'US benchmark';
  if (scope === 'global') return 'Global';
  return undefined;
}

function FieldList({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-terminal-text/45">No strong signal in sample.</span>;
  return (
    <ul className="mt-1.5 space-y-1">
      {items.slice(0, 2).map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2">
          <span className="mt-1.5 h-px w-2 shrink-0 bg-terminal-text/35" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TopStealStrip({ plays }: { plays: OpsStealPlayVM[] }) {
  if (!plays.length) return null;
  return (
    <div className="border border-terminal-green/25 bg-terminal-green/[0.035] p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-green/75">
            <Lightbulb className="h-3.5 w-3.5" /> What To Steal
          </p>
          <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-terminal-text/60">
            Top competitor plays worth adapting with your own proof, voice, and offer.
          </p>
        </div>
        <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-terminal-text/40">
          {plays.length} prioritized
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {plays.map((play, index) => (
          <div key={`${play.competitorId}-${play.title}-${index}`} className="border border-white/[0.06] bg-black/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[12px] font-semibold leading-snug text-terminal-text/90">{play.title}</p>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[10px] font-semibold text-terminal-green/85">
                  {formatConfidence(play.confidence)}
                </span>
                <SourcePill source={play.source} />
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-terminal-text/62">
              From {play.competitorHandle ? `@${play.competitorHandle}` : play.competitorName}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-terminal-text/82">{play.howToAdapt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CompetitorCardProps {
  competitor: OpsCompetitorVM;
}

const CompetitorCard: React.FC<CompetitorCardProps> = ({ competitor }) => {
  const evidenceCount = competitor.evidenceUrls.length;
  const stealPlay = competitor.stealPlays[0];
  const audienceGap = competitor.audienceGaps[0];
  const contentPattern = competitor.contentPatterns[0];

  return (
    <article className={cn('border p-5', riskSurface(competitor.riskLevel))}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold leading-snug tracking-[0.02em] text-terminal-text/95">
            {competitor.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-terminal-text/45">
            {competitor.handle && <span>@{competitor.handle}</span>}
            {competitor.profileUrl && /instagram\.com/i.test(competitor.profileUrl) && (
              <a
                href={competitor.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-terminal-green/80 hover:text-terminal-green"
              >
                Instagram <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {competitor.websiteUrl && (
              <a
                href={competitor.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-terminal-green/80 hover:text-terminal-green"
              >
                Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {scopeLabel(competitor.marketScope) && (
              <span className="border border-white/[0.07] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-terminal-text/50">
                {scopeLabel(competitor.marketScope)}
              </span>
            )}
            {competitor.country && (
              <span className="border border-white/[0.07] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-terminal-text/50">
                {competitor.country}
              </span>
            )}
            {competitor.category && (
              <span className="border border-white/[0.07] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-terminal-text/50">
                {competitor.category}
              </span>
            )}
          </div>
        </div>
        <span
          className={cn('shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em]', riskLabelClass(competitor.riskLevel))}
        >
          {competitor.riskLevel}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 border border-white/[0.05] bg-black/10 text-center">
        <div className="px-2 py-3">
          <p className="text-[9px] uppercase tracking-[0.16em] text-terminal-text/40">Confidence</p>
          <p className="mt-1 text-[13px] font-semibold text-terminal-text/90">{formatConfidence(competitor.confidence)}</p>
        </div>
        <div className="border-x border-white/[0.05] px-2 py-3">
          <p className="text-[9px] uppercase tracking-[0.16em] text-terminal-text/40">Evidence</p>
          <p className="mt-1 text-[13px] font-semibold text-terminal-text/90">{evidenceCount}</p>
        </div>
        <div className="px-2 py-3">
          <p className="text-[9px] uppercase tracking-[0.16em] text-terminal-text/40">Overlap</p>
          <p className="mt-1 text-[13px] font-semibold text-terminal-text/90">{formatScore(competitor.overlapScore)}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-3 text-[12px] leading-relaxed">
        {competitor.battlefieldSummary && (
          <div>
            <dt className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">
              <Activity className="h-3 w-3" /> Battlefield
            </dt>
            <dd className="mt-1 text-terminal-text/80">{competitor.battlefieldSummary}</dd>
          </div>
        )}

        <div>
          <dt className="text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">Narrative Pressure</dt>
          <dd className={cn('mt-1 flex gap-1.5 text-[12px]', riskAccentText(competitor.riskLevel))}>
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{competitor.narrativePressure || competitor.risk}</span>
          </dd>
        </div>

        <div>
          <dt className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">
            <Target className="h-3 w-3" /> Market Position
          </dt>
          <dd className="mt-1 text-terminal-text/80">{competitor.position}</dd>
        </div>

        {competitor.topNarrative && (
          <div>
            <dt className="text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">Top Narrative</dt>
            <dd className="mt-1 text-terminal-text/80">{competitor.topNarrative}</dd>
          </div>
        )}

        <div className="border-t border-white/[0.05] pt-3">
          <dt className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-green/75">
            <ShieldCheck className="h-3 w-3" /> Counter-Position
          </dt>
          <dd className="mt-1 text-terminal-text/85">{competitor.counterPosition || competitor.action}</dd>
        </div>

        {stealPlay && (
          <div className="border-t border-terminal-green/20 pt-3">
            <dt className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-green/80">
                <Lightbulb className="h-3 w-3" /> Steal This
              </span>
              <SourcePill source={stealPlay.source} />
            </dt>
            <dd className="mt-2 space-y-2">
              <p className="text-[12px] font-semibold text-terminal-text/90">{stealPlay.title}</p>
              <p className="text-terminal-text/72">{stealPlay.whyItWorks}</p>
              <p className="flex gap-1.5 text-terminal-green/85">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{stealPlay.howToAdapt}</span>
              </p>
            </dd>
          </div>
        )}

        {audienceGap && (
          <div className="border-t border-white/[0.05] pt-3">
            <dt className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">
                <MessageSquareText className="h-3 w-3" /> Audience Gap
              </span>
              <SourcePill source={audienceGap.source} />
            </dt>
            <dd className="mt-2 space-y-2 text-terminal-text/75">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-terminal-green/70">They Praise</p>
                <FieldList items={audienceGap.praised} />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-terminal-amber/80">They Ask For</p>
                <FieldList items={audienceGap.askedFor} />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-terminal-red/75">They Complain About</p>
                <FieldList items={audienceGap.complaints} />
              </div>
              <p className="border-t border-white/[0.05] pt-2 text-terminal-text/85">{audienceGap.opportunity}</p>
            </dd>
          </div>
        )}

        {contentPattern && (
          <div className="border-t border-white/[0.05] pt-3">
            <dt className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">
                <LayoutGrid className="h-3 w-3" /> Winning Pattern
              </span>
              <SourcePill source={contentPattern.source} />
            </dt>
            <dd className="mt-2 space-y-2 text-terminal-text/75">
              <p><span className="text-terminal-text/45">Format:</span> {contentPattern.winningFormat}</p>
              <p><span className="text-terminal-text/45">Hook:</span> {contentPattern.hookStyle}</p>
              <p><span className="text-terminal-text/45">Proof:</span> {contentPattern.proofMechanism}</p>
              <p><span className="text-terminal-text/45">CTA:</span> {contentPattern.ctaPattern}</p>
              <p className="text-terminal-green/85">{contentPattern.recommendedAdaptation}</p>
            </dd>
          </div>
        )}

        {competitor.searchQuery && (
          <div className="border-t border-white/[0.05] pt-3">
            <dt className="text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">Search Basis</dt>
            <dd className="mt-1 text-terminal-text/70">{competitor.searchQuery}</dd>
          </div>
        )}
      </dl>

      {competitor.evidenceUrls.length > 0 && (
        <div className="mt-4 border-t border-white/[0.05] pt-3">
          <p className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/40">
            <Link2 className="h-3 w-3" /> Evidence URLs
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {competitor.evidenceUrls.slice(0, 3).map((url, index) => (
              <a
                key={`${competitor.id}-evidence-${index}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1 border border-white/[0.08] px-2 py-1 text-[10px] text-terminal-text/65 hover:border-terminal-green/35 hover:text-terminal-green"
              >
                Source {index + 1}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export function CompetitorsStep({ competitors }: CompetitorsStepProps) {
  const { isReady, competitors: list, highestRisk, topStealPlays, emptyState } = competitors;

  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
          Step 07 - Competitive
        </p>
        <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">Competitors</h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
          Evidence-first competitive battlefield. OpenAI verifies origin-market, EU, and US competitors with source
          evidence before they appear here.
        </p>
      </header>

      {!isReady ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Unlocks after competitor discovery and comparison stages complete.
          </p>
        </div>
      ) : list.length === 0 ? (
        <div className="space-y-3">
          <div className="border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-terminal-green/80" />
              <div>
                <p className="text-[12px] font-semibold tracking-[0.04em] text-terminal-text/85">
                  {emptyState?.message ?? 'No OpenAI-verified competitors found.'}
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-terminal-text/55">
                  The runner did not fabricate adjacent accounts. Competitors appear only when OpenAI verifies
                  the business, market/category overlap, and source evidence.
                </p>
              </div>
            </div>
            {emptyState?.taskState && (
              <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-terminal-text/55">
                Competitor discovery {emptyState.taskState} - {(emptyState.taskRecords ?? 0).toLocaleString()} verified profile(s)
              </p>
            )}
            {emptyState?.comparisonText && (
              <div className="mt-3 border-t border-white/[0.05] pt-3">
                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-terminal-text/45">
                  Strategic Competitor View
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-terminal-text/80">
                  {emptyState.comparisonText}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <TopStealStrip plays={topStealPlays} />

          <div className="border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                  Strategic Takeaway
                </p>
                <p className="mt-2.5 text-[14px] leading-relaxed text-terminal-text/90">
                  {highestRisk ? (
                    <>
                      Top verified threat is{' '}
                      <span className="font-semibold text-terminal-text/95">{highestRisk.name}</span> with{' '}
                      <span className={cn('text-[11px] font-semibold uppercase tracking-[0.16em]', riskLabelClass(highestRisk.riskLevel))}>
                        {highestRisk.riskLevel} risk
                      </span>
                      , {formatConfidence(highestRisk.confidence)} confidence, and {highestRisk.evidenceUrls.length} evidence source(s).
                    </>
                  ) : (
                    'Competitor pressure profile pending.'
                  )}
                </p>
                {highestRisk?.counterPosition && (
                  <p className="mt-2 text-[12px] leading-relaxed text-terminal-text/70">
                    Recommended counter-position: {highestRisk.counterPosition}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                {list.length} verified
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((competitor) => (
              <CompetitorCard key={competitor.id} competitor={competitor} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
