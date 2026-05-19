import React from 'react';
import { Target } from 'lucide-react';
import { Badge, Card } from '../../../components/ui/Primitives';
import { OpsDemoResult } from '../types';

interface BrandPositionStepProps {
  result: OpsDemoResult | null;
  isReady: boolean;
}

function SwotBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'green' | 'amber' | 'red';
}) {
  const toneClass =
    tone === 'green'
      ? 'border-terminal-green/25 bg-terminal-green/[0.05] text-terminal-green/78'
      : tone === 'amber'
        ? 'border-terminal-amber/25 bg-terminal-amber/[0.05] text-terminal-amber/85'
        : 'border-terminal-red/28 bg-terminal-red/[0.05] text-terminal-red/82';

  return (
    <div className={`border p-3 ${toneClass}`}>
      <p className="text-[8px] font-black uppercase tracking-[0.14em]">{title}</p>
      <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-terminal-text/86">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

export function BrandPositionStep({ result, isReady }: BrandPositionStepProps) {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-terminal-text/90">Brand Position</h2>
        <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/60">
          Final SWOT strategic briefing with recommendation highlighted as the mission decision output.
        </p>
      </header>

      {!isReady || !result ? (
        <Card className="border-terminal-border/30 bg-black/35 p-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-terminal-text/55">
            Unlocks when the final brand-position stage completes.
          </p>
        </Card>
      ) : (
        <Card className="border-terminal-green/35 bg-black/45 p-5">
          <div className="mb-4 border-b border-terminal-border/20 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-terminal-green" />
                <h3 className="text-[12px] font-black uppercase tracking-[0.16em] text-terminal-text/92">
                  Final Brand Position Briefing
                </h3>
              </div>
              <Badge variant="positive" dot>
                Ready
              </Badge>
            </div>
            <p className="mt-2 text-[9px] uppercase tracking-[0.13em] text-terminal-text/56">
              Final decision output after audience and competitor stages
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SwotBlock title="Strengths" items={result.brandPosition.strengths} tone="green" />
              <SwotBlock title="Weaknesses" items={result.brandPosition.weaknesses} tone="amber" />
              <SwotBlock title="Opportunities" items={result.brandPosition.opportunities} tone="green" />
              <SwotBlock title="Threats" items={result.brandPosition.threats} tone="red" />
            </div>

            <div className="border border-terminal-green/40 bg-terminal-green/[0.09] p-4 shadow-[0_0_24px_rgba(0,255,102,0.16)]">
              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-terminal-green">Final Recommendation</p>
              <p className="mt-2 text-[12px] leading-relaxed text-terminal-text/92">{result.brandPosition.recommendation}</p>
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}
