import React from 'react';
import { AlertTriangle, Crosshair } from 'lucide-react';
import { Badge, Card } from '../../../components/ui/Primitives';
import { cn } from '../../../lib/utils';
import { OpsDemoResult } from '../types';

interface CompetitorsStepProps {
  result: OpsDemoResult | null;
  isReady: boolean;
}

function riskLevel(riskText: string): 'HIGH' | 'MEDIUM' | 'WATCH' {
  const risk = riskText.toLowerCase();
  if (risk.includes('capture') || risk.includes('aggressive')) return 'HIGH';
  if (risk.includes('shift') || risk.includes('dilute') || risk.includes('overlap')) return 'MEDIUM';
  return 'WATCH';
}

function riskBadgeClass(level: 'HIGH' | 'MEDIUM' | 'WATCH'): string {
  if (level === 'HIGH') return 'text-terminal-red border-terminal-red/30 bg-terminal-red/[0.08]';
  if (level === 'MEDIUM') return 'text-terminal-amber border-terminal-amber/30 bg-terminal-amber/[0.08]';
  return 'text-terminal-text/70 border-terminal-border/30 bg-black/25';
}

function detectedReason(text: string): string {
  const normalized = text.trim().replace(/\.$/, '');
  if (normalized.length <= 92) return normalized;
  return `${normalized.slice(0, 89)}...`;
}

export function CompetitorsStep({ result, isReady }: CompetitorsStepProps) {
  const topCompetitors = result?.competitors.slice(0, 3) ?? [];

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-terminal-text/90">Competitors</h2>
        <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/60">
          Top 3 competitor comparison with detected reason, risk pressure, position summary, and evidence narrative.
        </p>
      </header>

      {!isReady || !result ? (
        <Card className="border-terminal-border/30 bg-black/35 p-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-terminal-text/55">
            Unlocks after competitor discovery and comparison stages complete.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between border border-terminal-border/25 bg-black/30 px-3 py-2">
            <div className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-terminal-green/80" />
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-terminal-text/68">Top 3 Comparator Grid</p>
            </div>
            <Badge variant="outline" dot={false} className="text-[8px]">
              Exactly 3 Competitors
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {topCompetitors.map((competitor) => {
              const risk = riskLevel(competitor.risk);
              return (
                <Card key={competitor.name} className="border-terminal-border/30 bg-black/40 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-terminal-text/92">{competitor.name}</p>
                    <span
                      className={cn(
                        'border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em]',
                        riskBadgeClass(risk),
                      )}
                    >
                      {risk}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-[10px] leading-relaxed">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.13em] text-terminal-text/45">Detected Reason</p>
                      <p className="mt-1 text-terminal-text/82">{detectedReason(competitor.risk)}</p>
                    </div>

                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.13em] text-terminal-text/45">Sentiment / Risk</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-terminal-amber/82">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Audience pressure: {risk}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.13em] text-terminal-text/45">Position Summary</p>
                      <p className="mt-1 text-terminal-text/82">{competitor.position}</p>
                    </div>

                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.13em] text-terminal-text/45">
                        Key Narrative / Evidence
                      </p>
                      <p className="mt-1 text-terminal-text/82">{competitor.action}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
