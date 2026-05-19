import React from 'react';
import { ExternalLink, Globe2, Link2 } from 'lucide-react';
import { Card } from '../../../components/ui/Primitives';
import { OpsDemoResult } from '../types';

interface WebEvidenceStepProps {
  result: OpsDemoResult | null;
  isReady: boolean;
}

const OUTLET_LINKS: Record<string, string> = {
  'RetailWatch Daily': 'https://retailwatch.example.com',
  'SocialPulse Monitor': 'https://socialpulse.example.com',
  'Commerce Briefing': 'https://commercebriefing.example.com',
};

function deriveTitle(finding: string): string {
  const normalized = finding.trim().replace(/\.$/, '');
  const words = normalized.split(' ');
  if (words.length <= 8) return normalized;
  return `${words.slice(0, 8).join(' ')}...`;
}

export function WebEvidenceStep({ result, isReady }: WebEvidenceStepProps) {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-terminal-text/90">Web Evidence</h2>
        <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/60">
          Supporting evidence records used to validate narratives and final recommendation confidence.
        </p>
      </header>

      {!isReady || !result ? (
        <Card className="border-terminal-border/30 bg-black/35 p-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-terminal-text/55">
            Unlocks after web evidence stage completes.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {result.webEvidence.map((item) => {
            const sourceLink = OUTLET_LINKS[item.outlet];

            return (
              <Card key={item.outlet} className="border-terminal-border/30 bg-black/40 p-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_160px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-terminal-green/75" />
                      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">Source</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-terminal-text/85">{item.outlet}</p>
                    </div>

                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">Title</p>
                      <p className="mt-1 text-[11px] font-bold text-terminal-text/90">{deriveTitle(item.finding)}</p>
                    </div>

                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">Snippet</p>
                      <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/78">{item.finding}</p>
                    </div>
                  </div>

                  <div className="space-y-3 border-l border-terminal-border/18 pl-4">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">Relevance</p>
                      <p className="mt-1 text-[16px] font-bold text-terminal-green/82">{item.confidence}%</p>
                      <div className="mt-2 h-[2px] bg-white/5">
                        <div className="h-full bg-terminal-green/90" style={{ width: `${item.confidence}%` }} />
                      </div>
                    </div>

                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">Source Link</p>
                      {sourceLink ? (
                        <a
                          href={sourceLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-terminal-green/80 hover:text-terminal-green"
                        >
                          Open Source
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="mt-1 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-terminal-text/55">
                          <Link2 className="h-3 w-3" />
                          Not available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
