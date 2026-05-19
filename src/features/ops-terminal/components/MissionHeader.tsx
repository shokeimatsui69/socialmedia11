import React from 'react';
import { motion } from 'motion/react';
import { Activity, Gauge, Radar, Terminal } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { OpsTerminalHeaderVM } from '../types';

interface MissionHeaderProps {
  header: OpsTerminalHeaderVM;
}

interface TelemetryTileProps {
  label: string;
  value: string;
  helper?: string;
  accent?: 'green' | 'amber' | 'neutral';
  emphasized?: boolean;
  icon?: React.ReactNode;
  barWidth?: number;
  showBar?: boolean;
}

function TelemetryTile({
  label,
  value,
  helper,
  accent = 'neutral',
  emphasized = false,
  icon,
  barWidth = 0,
  showBar = false,
}: TelemetryTileProps) {
  const valueColor =
    accent === 'green'
      ? 'text-terminal-green'
      : accent === 'amber'
        ? 'text-terminal-amber'
        : 'text-terminal-text/90';

  const barColor =
    accent === 'green'
      ? 'bg-terminal-green/85'
      : accent === 'amber'
        ? 'bg-terminal-amber/80'
        : 'bg-terminal-text/40';

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1.5 px-4 py-3',
        emphasized && 'bg-white/[0.025]',
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-terminal-text/35">{icon}</span>}
        <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
          {label}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={cn(
            'truncate text-[13px] font-semibold tracking-[0.02em]',
            valueColor,
          )}
        >
          {value}
        </span>
        {helper && (
          <span className="text-[9px] uppercase tracking-[0.18em] text-terminal-text/40">
            {helper}
          </span>
        )}
      </div>
      {showBar && (
        <div className="mt-0.5 h-px w-full overflow-hidden bg-white/5">
          <motion.div
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={cn('h-full', barColor)}
          />
        </div>
      )}
    </div>
  );
}

export function MissionHeader({ header }: MissionHeaderProps) {
  const {
    missionTitle,
    status: runStatus,
    currentStageLabel,
    completedStages,
    totalStages,
    progress,
    confidenceScore,
    readinessScore,
    readinessLabel,
    platform,
    scrapeMode,
  } = header;
  const isStandby = runStatus === 'idle';
  const isRunning = runStatus === 'running';
  const isComplete = runStatus === 'completed';

  const platformLabel = platform.toUpperCase();
  const scrapeModeLabel = scrapeMode.replace(/_/g, ' ');

  const statusLabel = isStandby ? 'Standby' : isRunning ? 'Live' : 'Complete';
  const statusAccent = isComplete
    ? 'text-terminal-green'
    : isRunning
      ? 'text-terminal-amber'
      : 'text-terminal-text/55';
  const statusDot = isComplete
    ? 'bg-terminal-green'
    : isRunning
      ? 'bg-terminal-amber animate-pulse'
      : 'bg-terminal-text/30';

  const pipelineDisplay = isStandby
    ? 'Awaiting launch'
    : `${completedStages} / ${totalStages}`;
  const pipelineHelper = isStandby ? undefined : `${progress}%`;
  const confidenceDisplay = isStandby ? '—' : `${confidenceScore}%`;
  const readinessDisplay = isStandby ? '—' : `${readinessScore}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="shrink-0 border-b border-white/[0.06] bg-black/55 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-6 px-8 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-terminal-green/30 bg-terminal-green/[0.06]">
            <Terminal className="h-4 w-4 text-terminal-green" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-terminal-text/35">
              Live Operations · Mission Control · {platformLabel} · {scrapeModeLabel}
            </p>
            <p className="mt-0.5 truncate text-[14px] font-semibold tracking-[0.04em] text-terminal-text/95">
              {missionTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className={cn('h-1.5 w-1.5 rounded-full', statusDot)} />
          <span
            className={cn(
              'text-[10px] font-semibold uppercase tracking-[0.22em]',
              statusAccent,
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-white/[0.05] border-t border-white/[0.04] lg:grid-cols-4">
        <TelemetryTile
          label="Current Stage"
          value={currentStageLabel}
          icon={<Activity className="h-3 w-3" />}
        />
        <TelemetryTile
          label="Pipeline"
          value={pipelineDisplay}
          helper={pipelineHelper}
          accent="green"
          emphasized={isRunning || isComplete}
          icon={<Gauge className="h-3 w-3" />}
          barWidth={isStandby ? 0 : progress}
          showBar
        />
        <TelemetryTile
          label="Confidence"
          value={confidenceDisplay}
          accent={isStandby ? 'neutral' : 'green'}
          icon={<Radar className="h-3 w-3" />}
          barWidth={isStandby ? 0 : confidenceScore}
          showBar
        />
        <TelemetryTile
          label="Readiness"
          value={readinessDisplay}
          helper={isStandby ? 'Configure' : readinessLabel}
          accent={isStandby ? 'neutral' : 'amber'}
          barWidth={isStandby ? 0 : readinessScore}
          showBar
        />
      </div>
    </motion.div>
  );
}
