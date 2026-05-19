import React from 'react';
import { Play, Settings2, Workflow } from 'lucide-react';
import { Badge, Button, Card } from '../../../components/ui/Primitives';
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
  const missionStatusLabel = runStatus === 'idle' ? 'Standby' : runStatus === 'running' ? 'Running' : 'Completed';
  const missionStatusVariant =
    runStatus === 'completed' ? 'positive' : runStatus === 'running' ? 'neutral' : 'outline';

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-terminal-text/90">Mission Setup</h2>
        <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/60">
          Configure Instagram target intake and launch the workflow. Global telemetry remains in the top mission strip.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="border-terminal-border/35 bg-black/40 p-5">
          <div className="mb-4 flex items-center justify-between border-b border-terminal-border/20 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-terminal-green/80" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/72">Target Intake</h3>
            </div>
            <Badge variant={missionStatusVariant} className="text-[8px]">
              {missionStatusLabel}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-terminal-text/45">
                Instagram Post URL
              </label>
              <input
                className="w-full border border-terminal-border/30 bg-terminal-bg px-3 py-2 text-[11px] outline-none transition-colors focus:border-terminal-green/50"
                value={input.instagramPostUrl}
                onChange={(event) => onInstagramPostUrlChange(event.target.value)}
                placeholder="https://www.instagram.com/p/POST_ID/"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-terminal-text/45">
                Profile Posts Count
              </label>
              <input
                type="number"
                min={1}
                max={30}
                className="w-full border border-terminal-border/30 bg-terminal-bg px-3 py-2 text-[11px] outline-none transition-colors focus:border-terminal-green/50"
                value={input.recentProfilePosts}
                onChange={(event) => onRecentProfilePostsChange(Number.parseInt(event.target.value || '1', 10))}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button className="h-9" onClick={onStart} disabled={runStatus === 'running'}>
                <Play className="h-3.5 w-3.5" />
                Start Analysis
              </Button>
              <Button variant="outline" className="h-9" onClick={onReset} disabled={runStatus === 'running'}>
                Reset
              </Button>
            </div>

            {error && <p className="text-[9px] uppercase tracking-[0.11em] text-terminal-red">{error}</p>}
          </div>
        </Card>

        <Card className="border-terminal-border/35 bg-black/40 p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-terminal-border/20 pb-3">
            <Workflow className="h-4 w-4 text-terminal-green/80" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/72">Launch Guidance</h3>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div className="border border-terminal-border/20 bg-black/25 p-3">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">Flow</p>
              <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/82">
                Instagram post → profile scrape → narratives → social and web evidence → competitors → brand position.
              </p>
            </div>

            <div className="border border-terminal-border/20 bg-black/25 p-3">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">Input Notes</p>
              <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-terminal-text/78">
                <li>- Use a direct Instagram post URL path.</li>
                <li>- Profile post count sets context depth for narrative extraction.</li>
                <li>- Launch when target and depth are confirmed.</li>
              </ul>
            </div>

            <div className="border border-terminal-border/20 bg-black/25 p-3">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-terminal-text/45">Run State</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-terminal-text/85">{missionStatusLabel}</p>
              <p className="mt-1 text-[9px] leading-relaxed text-terminal-text/62">
                Use step navigation to review outcomes as soon as execution begins.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
