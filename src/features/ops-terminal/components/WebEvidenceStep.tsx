import React from 'react';
import { ExternalLink, FileSearch, Globe2 } from 'lucide-react';
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

export function WebEvidenceStep({ evidence }: WebEvidenceStepProps) {
  const { isReady, items, strongest } = evidence;

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
      ) : items.length === 0 ? (
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
      ) : (
        <div className="space-y-5">
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
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
