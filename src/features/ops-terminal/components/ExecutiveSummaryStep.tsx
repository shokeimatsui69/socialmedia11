import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { Badge, Card } from '../../../components/ui/Primitives';
import { OpsDemoResult } from '../types';

interface ExecutiveSummaryStepProps {
  result: OpsDemoResult | null;
  runStatus: 'idle' | 'running' | 'completed';
  canShowAudienceStatus: boolean;
  canShowBrandPosition: boolean;
}

export function ExecutiveSummaryStep({
  result,
  runStatus,
  canShowAudienceStatus,
  canShowBrandPosition,
}: ExecutiveSummaryStepProps) {
  const isReady = runStatus !== 'idle';

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-terminal-text/90">Executive Summary</h2>
        <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/60">
          First result-oriented briefing focused on audience status, risk, opportunity, and recommended action.
        </p>
      </header>

      {!isReady ? (
        <Card className="border-terminal-border/30 bg-black/35 p-5">
          <p className="text-[11px] leading-relaxed text-terminal-text/72">
            Start the mission from <span className="font-bold uppercase text-terminal-green/75">Mission Setup</span> to unlock
            the executive briefing.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="border-terminal-border/30 bg-black/40 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">Executive Takeaway</p>
                <p className="mt-2 text-[12px] leading-relaxed text-terminal-text/88">
                  {canShowAudienceStatus && result
                    ? result.audienceStatus.sentiment
                    : 'Audience summary is building as narrative and signal stages complete.'}
                </p>
              </div>
              <Badge variant={canShowAudienceStatus ? 'positive' : 'outline'} className="text-[8px]">
                {canShowAudienceStatus ? 'Ready' : 'Pending'}
              </Badge>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <Card className="border-terminal-border/30 bg-black/40 p-5">
              <div className="flex items-center gap-2 border-b border-terminal-border/15 pb-2">
                <TrendingUp className="h-4 w-4 text-terminal-green/80" />
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-terminal-text/70">Main Opportunity</p>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-terminal-text/84">
                {canShowAudienceStatus && result
                  ? result.audienceStatus.opportunities[0]
                  : 'Opportunity signal will unlock with audience and narrative processing.'}
              </p>
            </Card>

            <Card className="border-terminal-border/30 bg-black/40 p-5">
              <div className="flex items-center gap-2 border-b border-terminal-border/15 pb-2">
                <AlertTriangle className="h-4 w-4 text-terminal-red/80" />
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-terminal-text/70">Main Risk</p>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-terminal-text/84">
                {canShowAudienceStatus && result
                  ? result.audienceStatus.concerns[0]
                  : 'Risk signal will unlock with audience and competitor processing.'}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1.2fr]">
            <Card className="border-terminal-border/30 bg-black/40 p-5">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-terminal-green/80" />
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-terminal-text/70">
                  Brand Position Snapshot
                </p>
              </div>
              {canShowBrandPosition && result ? (
                <div className="mt-3 space-y-2 text-[10px] leading-relaxed">
                  <p className="text-terminal-text/84">
                    <span className="font-bold uppercase text-terminal-green/72">Strength:</span>{' '}
                    {result.brandPosition.strengths[0]}
                  </p>
                  <p className="text-terminal-text/84">
                    <span className="font-bold uppercase text-terminal-amber/78">Weakness:</span>{' '}
                    {result.brandPosition.weaknesses[0]}
                  </p>
                  <p className="text-terminal-text/84">
                    <span className="font-bold uppercase text-terminal-red/80">Threat:</span>{' '}
                    {result.brandPosition.threats[0]}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-[10px] leading-relaxed text-terminal-text/65">
                  Final brand-position synthesis unlocks at the final mission stage.
                </p>
              )}
            </Card>

            <Card className="border-terminal-green/35 bg-terminal-green/[0.07] p-5 shadow-[0_0_20px_rgba(0,255,102,0.14)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-terminal-green" />
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-green">
                  Recommended Action
                </p>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-terminal-text/92">
                {canShowBrandPosition && result
                  ? result.brandPosition.recommendation
                  : 'Recommendation will appear after audience status and brand-position stages complete.'}
              </p>
              <div className="mt-3 border-t border-terminal-green/25 pt-2">
                <p className="text-[8px] uppercase tracking-[0.12em] text-terminal-text/60">
                  Strategic confidence follows consistency across social and web evidence.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}
