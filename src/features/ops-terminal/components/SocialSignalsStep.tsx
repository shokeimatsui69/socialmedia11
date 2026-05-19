import React from 'react';
import { Radar, Sparkles } from 'lucide-react';
import { Badge, Card } from '../../../components/ui/Primitives';
import { OpsDemoResult } from '../types';

interface SocialSignalsStepProps {
  result: OpsDemoResult | null;
  isReady: boolean;
}

function relevanceFromIntensity(intensity: 'high' | 'medium' | 'low'): number {
  if (intensity === 'high') return 88;
  if (intensity === 'medium') return 73;
  return 59;
}

function sentimentFromSignal(signal: string): 'positive' | 'neutral' | 'negative' {
  const normalized = signal.toLowerCase();
  if (normalized.includes('positive') || normalized.includes('amplification')) return 'positive';
  if (normalized.includes('increasing') || normalized.includes('friction')) return 'negative';
  return 'neutral';
}

export function SocialSignalsStep({ result, isReady }: SocialSignalsStepProps) {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-terminal-text/90">Social / X Signals</h2>
        <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/60">
          External social pulse from X and related communities, ranked by relevance and sentiment.
        </p>
      </header>

      {!isReady || !result ? (
        <Card className="border-terminal-border/30 bg-black/35 p-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-terminal-text/55">
            Unlocks after social signal discovery stage completes.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {result.socialSignals.map((signal) => {
            const relevance = relevanceFromIntensity(signal.intensity);
            const sentiment = sentimentFromSignal(signal.signal);

            return (
              <Card key={signal.signal} className="border-terminal-border/30 bg-black/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Radar className="h-4 w-4 text-terminal-green/75" />
                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/58">External Signal</p>
                  </div>
                  <Badge variant={sentiment === 'positive' ? 'positive' : sentiment === 'negative' ? 'negative' : 'outline'}>
                    {sentiment}
                  </Badge>
                </div>

                <p className="mt-2 text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">{signal.source}</p>
                <p className="mt-2 text-[10px] leading-relaxed text-terminal-text/82">{signal.signal}</p>

                <div className="mt-3 space-y-2 border-t border-terminal-border/15 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[8px] uppercase tracking-[0.12em] text-terminal-text/45">Relevance Score</p>
                    <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-terminal-green/75">{relevance}%</p>
                  </div>
                  <div className="h-[2px] bg-white/5">
                    <div className="h-full bg-terminal-green/90" style={{ width: `${relevance}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[8px] uppercase tracking-[0.12em] text-terminal-text/45">Intensity</p>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-terminal-amber/80">{signal.intensity}</p>
                  </div>
                </div>
              </Card>
            );
          })}

          <Card className="border-terminal-border/30 bg-black/35 p-4 md:col-span-2 xl:col-span-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-terminal-green/75" />
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-terminal-text/65">Social Intelligence Note</p>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-terminal-text/75">
              These signals represent external market conversation pressure and should be cross-checked against web evidence
              before final positioning decisions.
            </p>
          </Card>
        </div>
      )}
    </section>
  );
}
