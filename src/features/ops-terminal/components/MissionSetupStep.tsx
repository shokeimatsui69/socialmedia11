import React from 'react';
import {
  Crosshair,
  Globe,
  MessageSquareText,
  Play,
  Radar,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Target,
  Users2,
  Workflow,
} from 'lucide-react';
import { OpsRunInput } from '../types';

interface MissionSetupStepProps {
  input: OpsRunInput;
  error: string;
  runStatus: 'idle' | 'running' | 'completed';
  onInstagramPostUrlChange: (value: string) => void;
  onRecentProfilePostsChange: (value: number) => void;
  onStart: () => void;
  onReset: () => void;
}

export function MissionSetupStep({
  input,
  error,
  runStatus,
  onInstagramPostUrlChange,
  onRecentProfilePostsChange,
  onStart,
  onReset,
}: MissionSetupStepProps) {
  const isRunning = runStatus === 'running';
  const isComplete = runStatus === 'completed';

  const statusLabel = runStatus === 'idle' ? 'Standby' : isRunning ? 'Running' : 'Completed';
  const statusAccent = isComplete
    ? 'text-terminal-green'
    : isRunning
      ? 'text-terminal-amber'
      : 'text-terminal-text/55';

  const outputPreview = [
    { icon: MessageSquareText, label: 'Source Scrape', detail: 'Source post and profile context extraction.' },
    { icon: Target, label: 'Narratives', detail: 'Themes, sentiment, and narrative risk clusters.' },
    { icon: Radar, label: 'X / Grok Signals', detail: 'External social signal pressure and relevance.' },
    { icon: Globe, label: 'Web Evidence', detail: 'Supporting evidence records and confidence.' },
    { icon: Crosshair, label: 'Top 3 Competitors', detail: 'Competitor position and risk pressure view.' },
    { icon: Users2, label: 'Audience Status', detail: 'Segmented audience concerns and opportunities.' },
    { icon: ShieldCheck, label: 'Brand Position', detail: 'Final SWOT briefing and recommendation.' },
  ] as const;

  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
          Step 01 · Configuration
        </p>
        <h2 className="text-[18px] font-semibold tracking-[0.04em] text-terminal-text/95">
          Mission Setup
        </h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-terminal-text/55">
          Configure the Instagram target intake and launch the workflow. Telemetry stays in the top mission strip.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div className="border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="mb-5 flex items-center justify-between border-b border-white/[0.05] pb-3">
            <div className="flex items-center gap-2.5">
              <Settings2 className="h-4 w-4 text-terminal-text/55" />
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terminal-text/85">
                Target Intake
              </h3>
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${statusAccent}`}>
              {statusLabel}
            </span>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Instagram Post URL
              </label>
              <input
                className="w-full border border-white/[0.08] bg-black/40 px-3.5 py-2.5 text-[12px] tracking-[0.02em] text-terminal-text/95 outline-none transition-colors placeholder:text-terminal-text/25 focus:border-terminal-green/50 focus:bg-black/60"
                value={input.instagramPostUrl}
                onChange={(event) => onInstagramPostUrlChange(event.target.value)}
                placeholder="https://www.instagram.com/p/POST_ID/"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Profile Posts Count
              </label>
              <input
                type="number"
                min={1}
                max={30}
                className="w-full border border-white/[0.08] bg-black/40 px-3.5 py-2.5 text-[12px] tracking-[0.02em] text-terminal-text/95 outline-none transition-colors focus:border-terminal-green/50 focus:bg-black/60"
                value={input.recentProfilePosts}
                onChange={(event) => onRecentProfilePostsChange(Number.parseInt(event.target.value || '1', 10))}
              />
              <p className="text-[10px] text-terminal-text/40">Range 1–30. Drives breadth of profile context.</p>
            </div>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <button
                onClick={onStart}
                disabled={isRunning}
                className="group inline-flex h-10 flex-1 items-center justify-center gap-2 bg-terminal-green px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-black shadow-[0_0_18px_rgba(0,255,102,0.25)] transition-all hover:shadow-[0_0_28px_rgba(0,255,102,0.45)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Play className="h-3.5 w-3.5" />
                Start Analysis
              </button>
              <button
                onClick={onReset}
                disabled={isRunning}
                className="inline-flex h-10 items-center justify-center gap-2 border border-white/[0.08] bg-transparent px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-terminal-text/65 transition-colors hover:border-white/[0.16] hover:text-terminal-text/90 disabled:cursor-not-allowed disabled:opacity-30 sm:px-5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            {error && (
              <div className="border border-terminal-red/30 bg-terminal-red/[0.06] px-3 py-2">
                <p className="text-[10px] tracking-[0.04em] text-terminal-red/90">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="mb-5 flex items-center gap-2.5 border-b border-white/[0.05] pb-3">
            <Workflow className="h-4 w-4 text-terminal-text/55" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terminal-text/85">
              Analysis Output
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Mission Value
              </p>
              <p className="text-[12px] leading-relaxed text-terminal-text/85">
                Launching this mission produces a full intelligence package from source scrape through final
                brand-position recommendation.
              </p>
            </div>

            <ul className="grid grid-cols-1 gap-px overflow-hidden border border-white/[0.05] bg-white/[0.04] md:grid-cols-2">
              {outputPreview.map((item) => (
                <li key={item.label} className="bg-[#070907] p-3.5">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-3.5 w-3.5 text-terminal-text/45" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terminal-text/80">
                      {item.label}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-terminal-text/55">{item.detail}</p>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/[0.05] pt-4">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Launch Readiness
              </p>
              <p className={`mt-1 text-[14px] font-semibold tracking-[0.04em] ${statusAccent}`}>
                {statusLabel}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-terminal-text/55">
                View Executive Summary first after launch, then drill into narratives, evidence, competitors, and
                final brand position.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
