import React from 'react';
import { Activity, CheckCircle2, Globe2, Layers, ShieldAlert, ShieldCheck, Target, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { OpsBrandPositionPanelVM, OpsBrandPositionVM } from '../types';

interface BrandPositionStepProps {
  position: OpsBrandPositionVM;
  panel?: OpsBrandPositionPanelVM;
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

const POSTURE_CLASS: Record<string, string> = {
  Defend: 'border-terminal-amber/35 bg-terminal-amber/[0.08] text-terminal-amber',
  Grow: 'border-terminal-green/35 bg-terminal-green/[0.08] text-terminal-green',
  Reposition: 'border-sky-400/30 bg-sky-400/[0.07] text-sky-200',
  Repair: 'border-terminal-red/35 bg-terminal-red/[0.08] text-terminal-red',
};

function formatConfidence(value?: number): string {
  if (typeof value !== 'number') return 'Pending';
  return `${Math.round(value * 100)}%`;
}

function positionLabel(classification?: OpsBrandPositionVM['targetClassification']): string {
  if (!classification) return 'Position';
  if (classification.kind === 'politician') return 'Political Position';
  if (classification.kind === 'creator') return 'Creator Position';
  if (classification.kind === 'public_figure') return 'Public Position';
  if (classification.kind === 'organization') return 'Organization Position';
  if (classification.kind === 'media') return 'Media Position';
  if (classification.kind === 'brand') return 'Brand Position';
  return 'Target Position';
}

function thesisLabel(classification?: OpsBrandPositionVM['targetClassification']): string {
  return `${positionLabel(classification)} Thesis`;
}

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
      {items.length === 0 ? (
        <p className="mt-3 text-[11px] leading-relaxed text-terminal-text/45">No entries returned yet.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-terminal-text/85">
          {items.map((item, idx) => (
            <li key={`${item}-${idx}`} className="flex gap-2">
              <span className="mt-1.5 h-px w-2 shrink-0 bg-terminal-text/35" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DecisionList({
  title,
  icon,
  items,
  tone = 'text-terminal-text/45',
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone?: string;
}) {
  return (
    <div className="border border-white/[0.06] bg-white/[0.018] p-4">
      <p className={cn('flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em]', tone)}>
        {icon}
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-[11px] leading-relaxed text-terminal-text/45">Pending advanced synthesis.</p>
      ) : (
        <ul className="mt-2.5 space-y-2 text-[12px] leading-relaxed text-terminal-text/82">
          {items.slice(0, 5).map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-2">
              <span className="mt-1.5 h-px w-2 shrink-0 bg-terminal-text/35" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BrandPositionStep({ position, panel }: BrandPositionStepProps) {
  const {
    isReady,
    derived,
    takeaway,
    posture,
    confidence,
    source,
    positionThesis,
    proofPoints,
    priorityActions,
    narrativeLevers,
    competitorPressures,
    strengths,
    weaknesses,
    opportunities,
    threats,
    recommendation,
  } = position;
  const targetClassification = position.targetClassification ?? panel?.targetClassification;
  const dynamicPositionLabel = positionLabel(targetClassification);
  const dynamicThesisLabel = thesisLabel(targetClassification);
  const postureLabel = posture ?? 'Reposition';
  const hasStrategicPanel =
    Boolean(panel) &&
    (panel?.audienceStatusOverview ||
      panel?.brandPositioningAnalysis ||
      panel?.brandPerceptionInsights ||
      panel?.narrativeOverlapAndDifferentiation ||
      panel?.webSummary ||
      (panel?.marketOpportunitySignals?.length ?? 0) > 0 ||
      (panel?.audienceMigrationPatterns?.length ?? 0) > 0 ||
      (panel?.contentStrategyRecommendations?.length ?? 0) > 0);

  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
          Step 08 - Decision
        </p>
        <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">{dynamicPositionLabel}</h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
          Decision-maker thesis, priority actions, proof points, and pressure signals for this target type.
        </p>
      </header>

      {!isReady ? (
        <div className="border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-terminal-text/45">
            Unlocks when the final position stage completes.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex flex-col gap-4 border-b border-white/[0.05] pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Target className="h-4 w-4 text-terminal-text/55" />
                  <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-terminal-text/90">
                    {dynamicThesisLabel}
                  </h3>
                  {targetClassification && (
                    <span className="border border-terminal-green/20 bg-terminal-green/[0.04] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-terminal-green/80">
                      {targetClassification.label} · {Math.round(targetClassification.confidence * 100)}%
                    </span>
                  )}
                  {derived && (
                    <span className="text-[9px] uppercase tracking-[0.18em] text-terminal-text/35">
                      {source === 'openai' ? 'OpenAI advanced synthesis' : 'Fallback synthesis'}
                    </span>
                  )}
                </div>
                <p className="mt-3 max-w-4xl text-[15px] leading-relaxed text-terminal-text/92">
                  {positionThesis || takeaway}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <span className={cn('border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]', POSTURE_CLASS[postureLabel])}>
                  {postureLabel}
                </span>
                <span className="border border-white/[0.08] bg-black/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                  {formatConfidence(confidence)}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <DecisionList
                title="Proof Points"
                icon={<CheckCircle2 className="h-3 w-3" />}
                items={proofPoints}
                tone="text-terminal-green/75"
              />
              <DecisionList
                title="Priority Actions"
                icon={<Activity className="h-3 w-3" />}
                items={priorityActions}
                tone="text-terminal-green/75"
              />
              <DecisionList
                title="Narrative Levers"
                icon={<Layers className="h-3 w-3" />}
                items={narrativeLevers}
                tone="text-terminal-text/45"
              />
              <DecisionList
                title="Competitor Pressures"
                icon={<ShieldAlert className="h-3 w-3" />}
                items={competitorPressures}
                tone="text-terminal-amber/85"
              />
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
                {recommendation}
              </p>
            </div>
          </div>

          <div className="border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                  SWOT Context
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-terminal-text/55">
                  Secondary context behind the decision panel.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SwotBlock title="Strengths" items={strengths} tone="green" />
              <SwotBlock title="Weaknesses" items={weaknesses} tone="amber" />
              <SwotBlock title="Opportunities" items={opportunities} tone="positive" />
              <SwotBlock title="Threats" items={threats} tone="red" />
            </div>
          </div>

          {hasStrategicPanel && panel && (
            <div className="border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-center gap-2.5 border-b border-white/[0.05] pb-3">
                <Layers className="h-4 w-4 text-terminal-text/55" />
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-terminal-text/85">
                  Strategic Intelligence Layer
                </h3>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {panel.brandPositioningAnalysis && (
                  <div>
                    <p className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/45">
                      <Target className="h-3 w-3" /> {dynamicPositionLabel}
                    </p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-terminal-text/85">
                      {panel.brandPositioningAnalysis}
                    </p>
                  </div>
                )}
                {panel.brandPerceptionInsights && (
                  <div>
                    <p className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/45">
                      <Layers className="h-3 w-3" /> Brand Perception
                    </p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-terminal-text/85">
                      {panel.brandPerceptionInsights}
                    </p>
                  </div>
                )}
                {panel.audienceStatusOverview && (
                  <div>
                    <p className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/45">
                      <Users className="h-3 w-3" /> Audience Status
                    </p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-terminal-text/85">
                      {panel.audienceStatusOverview}
                    </p>
                  </div>
                )}
                {panel.narrativeOverlapAndDifferentiation && (
                  <div>
                    <p className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/45">
                      <Layers className="h-3 w-3" /> Narrative Overlap
                    </p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-terminal-text/85">
                      {panel.narrativeOverlapAndDifferentiation}
                    </p>
                  </div>
                )}
                {panel.webSummary && (
                  <div className="lg:col-span-2">
                    <p className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-terminal-text/45">
                      <Globe2 className="h-3 w-3" /> Web Intelligence Summary
                    </p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-terminal-text/85">
                      {panel.webSummary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
