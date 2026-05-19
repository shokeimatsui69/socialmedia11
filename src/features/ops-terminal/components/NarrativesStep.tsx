import React from 'react';
import { MessageSquareText, Radar, ShieldAlert } from 'lucide-react';
import { Badge, Card } from '../../../components/ui/Primitives';
import { OpsDemoResult } from '../types';

interface NarrativesStepProps {
  result: OpsDemoResult | null;
  isReady: boolean;
}

function riskFromSentiment(sentiment: 'positive' | 'neutral' | 'negative'): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (sentiment === 'negative') return 'HIGH';
  if (sentiment === 'neutral') return 'MEDIUM';
  return 'LOW';
}

export function NarrativesStep({ result, isReady }: NarrativesStepProps) {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-terminal-text/90">
          Narratives & Themes
        </h2>
        <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/60">
          Extracted discussion themes, sentiment, and representative signals for quick narrative review.
        </p>
      </header>

      {!isReady || !result ? (
        <Card className="border-terminal-border/30 bg-black/35 p-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-terminal-text/55">
            Unlocks after narrative extraction stage completes.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {result.narrativeThemes.map((theme, index) => {
              const risk = riskFromSentiment(theme.sentiment);
              const representativeSignal = result.socialSignals[index]?.signal || result.socialSignals[0]?.signal;

              return (
                <Card key={theme.title} className="border-terminal-border/30 bg-black/40 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MessageSquareText className="h-4 w-4 text-terminal-green/75" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-terminal-text/88">{theme.title}</p>
                    </div>
                    <Badge
                      variant={theme.sentiment === 'positive' ? 'positive' : theme.sentiment === 'negative' ? 'negative' : 'outline'}
                    >
                      {theme.sentiment}
                    </Badge>
                  </div>

                  <p className="mt-3 text-[10px] leading-relaxed text-terminal-text/80">{theme.evidence}</p>

                  <div className="mt-3 border-t border-terminal-border/15 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[8px] font-black uppercase tracking-[0.13em] text-terminal-text/45">Risk Level</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-terminal-amber/80">{risk}</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Radar className="mt-0.5 h-3.5 w-3.5 text-terminal-green/70" />
                      <p className="text-[9px] leading-relaxed text-terminal-text/68">{representativeSignal}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="border-terminal-border/30 bg-black/35 p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-terminal-amber/80" />
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-terminal-text/65">Narrative Watch</p>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-terminal-text/75">
              Prioritize negative and medium-risk narratives first, then reinforce strongest positive themes with social and
              web evidence.
            </p>
          </Card>
        </div>
      )}
    </section>
  );
}
