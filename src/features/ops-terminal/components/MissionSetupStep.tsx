import React from 'react';
import {
  Database,
  Globe2,
  ListChecks,
  MapPin,
  Play,
  Radar,
  RotateCcw,
  Settings2,
  Tags,
  Workflow,
  X,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { OpsProviderStatusVM, OpsRunInput, OpsRunStatus, OpsSourceRunVM, OpsTerminalViewModel } from '../types';
import {
  OPS_INSTAGRAM_COMMENTS_PER_POST,
  OPS_INSTAGRAM_DEFAULT_PROFILE_POSTS,
} from '../data';
import {
  formatOpsInputEntityType,
  formatOpsInputPlatform,
  type OpsInputDetectionResult,
} from '../inputLayer';
import {
  formatScannerType,
  type OpsScannerModule,
  type OpsScannerSelectionResult,
} from '../scannerSelection';
import {
  formatOpsTopicSignalType,
  type OpsTopicEntity,
  type OpsTopicExtractionResult,
} from '../topicExtraction';
import {
  MARKET_CONTINENT_OPTIONS,
  MARKET_COUNTRY_OPTIONS,
  formatMarketFilterLabel,
  normalizeCompetitorMarketFilter,
  normalizeMarketCountry,
  type CompetitorMarketFilter,
  type MarketContinent,
} from '../../../../shared/marketScope';

interface MissionSetupStepProps {
  input: OpsRunInput;
  setup: OpsTerminalViewModel['setup'];
  error: string;
  runStatus: OpsRunStatus;
  inputDetection: OpsInputDetectionResult;
  scannerSelection: OpsScannerSelectionResult;
  topicExtraction: OpsTopicExtractionResult;
  canStart: boolean;
  startDisabledReason?: string;
  onInstagramPostUrlChange: (value: string) => void;
  onRecentProfilePostsChange: (value: number) => void;
  onCompetitorMarketFilterChange: (value: CompetitorMarketFilter) => void;
  onStart: () => void;
  onReset: () => void;
}

const SOURCE_DEFINITIONS = [
  { key: 'posts', label: 'Posts' },
  { key: 'comments', label: 'Comments' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'portals', label: 'Portals' },
  { key: 'forums', label: 'Forums' },
] as const;

function readinessClass(readiness: OpsInputDetectionResult['readiness']): string {
  if (readiness === 'runnable') return 'border-terminal-green/30 bg-terminal-green/[0.045] text-terminal-green';
  if (readiness === 'pending_scanner') return 'border-terminal-amber/30 bg-terminal-amber/[0.045] text-terminal-amber';
  return 'border-terminal-red/30 bg-terminal-red/[0.045] text-terminal-red';
}

function readinessLabel(readiness: OpsInputDetectionResult['readiness']): string {
  if (readiness === 'runnable') return 'Runnable';
  if (readiness === 'pending_scanner') return 'Scanner pending';
  return 'Invalid';
}

function scannerStatusClass(status: OpsScannerModule['implementationStatus']): string {
  return status === 'available' ? 'text-terminal-green' : 'text-terminal-amber';
}

function topicSignalClass(signalType: OpsTopicEntity['signalType']): string {
  if (signalType === 'primary_topic') return 'border-terminal-green/25 bg-terminal-green/[0.05] text-terminal-green';
  if (signalType === 'trending_topic' || signalType === 'viral_topic') return 'border-terminal-amber/25 bg-terminal-amber/[0.05] text-terminal-amber';
  if (signalType === 'risk_topic' || signalType === 'controversial_topic') return 'border-terminal-red/25 bg-terminal-red/[0.045] text-terminal-red';
  if (signalType === 'competitor_related_topic') return 'border-terminal-green/20 bg-terminal-green/[0.035] text-terminal-green/80';
  return 'border-white/[0.08] bg-white/[0.03] text-terminal-text/70';
}

function classificationText(classification: OpsTerminalViewModel['setup']['targetClassification']): string {
  if (!classification) return 'Pending';
  return `${classification.label} · ${Math.round(classification.confidence * 100)}%`;
}

interface MarketScopeSelectorProps {
  value: CompetitorMarketFilter;
  disabled: boolean;
  onChange: (value: CompetitorMarketFilter) => void;
}

function MarketScopeSelector({ value, disabled, onChange }: MarketScopeSelectorProps) {
  const [customCountry, setCustomCountry] = React.useState('');
  const filter = normalizeCompetitorMarketFilter(value);
  const marketLabel = formatMarketFilterLabel(filter);

  const emit = (next: CompetitorMarketFilter) => onChange(normalizeCompetitorMarketFilter(next));
  const toggleContinent = (continent: MarketContinent) => {
    const continents = filter.continents.includes(continent)
      ? filter.continents.filter((item) => item !== continent)
      : [...filter.continents, continent];
    emit({ ...filter, continents });
  };
  const toggleCountry = (country: string) => {
    const normalized = normalizeMarketCountry(country);
    if (!normalized) return;
    const countries = filter.countries.includes(normalized)
      ? filter.countries.filter((item) => item !== normalized)
      : [...filter.countries, normalized];
    emit({ ...filter, countries });
  };
  const addCustomCountry = () => {
    const country = normalizeMarketCountry(customCountry);
    if (!country) return;
    emit({ ...filter, countries: filter.countries.includes(country) ? filter.countries : [...filter.countries, country] });
    setCustomCountry('');
  };
  const clearFilter = () => emit({ continents: [], countries: [] });

  return (
    <div className="space-y-3 border border-white/[0.08] bg-black/25 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Globe2 className="h-3.5 w-3.5 text-terminal-green/65" />
            <label className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
              Competitor Market Scope
            </label>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-terminal-text/40">
            Competitor discovery is limited to these selected markets.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="max-w-[280px] truncate border border-terminal-green/20 bg-terminal-green/[0.04] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-terminal-green/75">
            {marketLabel}
          </span>
          {(filter.continents.length > 0 || filter.countries.length > 0) && (
            <button
              type="button"
              disabled={disabled}
              onClick={clearFilter}
              className="border border-white/[0.08] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-terminal-text/45 transition-colors hover:border-terminal-red/35 hover:text-terminal-red disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {MARKET_CONTINENT_OPTIONS.map((continent) => {
          const active = filter.continents.includes(continent.id);
          return (
            <button
              key={continent.id}
              type="button"
              disabled={disabled}
              onClick={() => toggleContinent(continent.id)}
              className={cn(
                'border px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                active
                  ? 'border-terminal-green/45 bg-terminal-green/[0.08] text-terminal-green'
                  : 'border-white/[0.08] bg-white/[0.02] text-terminal-text/55 hover:border-white/[0.18] hover:text-terminal-text/85',
              )}
            >
              {continent.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
        <select
          value=""
          disabled={disabled}
          onChange={(event) => toggleCountry(event.target.value)}
          className="h-10 border border-white/[0.08] bg-black/40 px-3 text-[11px] tracking-[0.02em] text-terminal-text/75 outline-none transition-colors focus:border-terminal-green/50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Add competitor country"
        >
          <option value="">Add country...</option>
          {MARKET_COUNTRY_OPTIONS.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
        <input
          value={customCountry}
          disabled={disabled}
          onChange={(event) => setCustomCountry(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addCustomCountry();
            }
          }}
          placeholder="Custom country"
          className="h-10 border border-white/[0.08] bg-black/40 px-3 text-[11px] tracking-[0.02em] text-terminal-text/95 outline-none transition-colors placeholder:text-terminal-text/25 focus:border-terminal-green/50 disabled:cursor-not-allowed disabled:opacity-40"
        />
        <button
          type="button"
          disabled={disabled || !customCountry.trim()}
          onClick={addCustomCountry}
          className="inline-flex h-10 items-center justify-center gap-2 border border-white/[0.08] px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-terminal-text/65 transition-colors hover:border-terminal-green/35 hover:text-terminal-green disabled:cursor-not-allowed disabled:opacity-30"
        >
          <MapPin className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {filter.countries.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filter.countries.map((country) => (
            <span
              key={country}
              className="inline-flex items-center gap-1.5 border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-terminal-text/75"
            >
              {country}
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleCountry(country)}
                className="text-terminal-text/35 transition-colors hover:text-terminal-red disabled:cursor-not-allowed"
                aria-label={`Remove ${country}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function MissionSetupStep({
  input,
  setup,
  error,
  runStatus,
  inputDetection,
  scannerSelection,
  topicExtraction,
  canStart,
  startDisabledReason,
  onInstagramPostUrlChange,
  onRecentProfilePostsChange,
  onCompetitorMarketFilterChange,
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

  const detectedEntity = inputDetection.entity;
  const activeHandle = setup.accountHandle?.replace(/^@/, '') || detectedEntity?.handle || '—';
  const activePlatform = runStatus === 'idle' && detectedEntity?.platform
    ? formatOpsInputPlatform(detectedEntity.platform)
    : setup.platform
      ? setup.platform.toUpperCase()
      : '—';
  const activeScrapeMode = runStatus === 'idle' && inputDetection.readiness === 'pending_scanner'
    ? 'scanner pending'
    : setup.scrapeMode
      ? setup.scrapeMode.replace(/_/g, ' ')
      : '—';
  const activeMarketFilter = setup.competitorMarketFilter ?? input.competitorMarketFilter;
  const targetClassification = setup.targetClassification;
  const enabledSources = SOURCE_DEFINITIONS.filter((source) => setup.sources?.[source.key]);
  const hasInput = input.instagramPostUrl.trim().length > 0;
  const startDisabled = isRunning || !canStart;
  const primaryEntityLabel = detectedEntity?.label || (activeHandle === '—' ? '—' : `@${activeHandle}`);
  const primaryScanner = scannerSelection.primaryScanner;
  const primaryTopic = topicExtraction.primaryTopic;
  const activePostCount = (() => {
    if (runStatus === 'idle' && detectedEntity?.platform === 'tiktok') {
      return detectedEntity.type === 'tiktok_video' ? 1 : 10;
    }
    if (runStatus === 'idle' && detectedEntity?.platform === 'instagram') {
      return detectedEntity.instagram?.type === 'profile' ? input.recentProfilePosts : 1;
    }
    return setup.postCount || input.recentProfilePosts;
  })();
  const isInstagramScan =
    (runStatus === 'idle' && detectedEntity?.platform === 'instagram') ||
    (runStatus !== 'idle' && setup.platform === 'instagram');
  const instagramCommentTarget = isInstagramScan ? activePostCount * OPS_INSTAGRAM_COMMENTS_PER_POST : 0;

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
          Configure the input entity and launch the workflow. Ops Terminal classifies inputs, selects scanners, and extracts topic seeds before launch.
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
                Input Entity
              </label>
              <input
                className="w-full border border-white/[0.08] bg-black/40 px-3.5 py-2.5 text-[12px] tracking-[0.02em] text-terminal-text/95 outline-none transition-colors placeholder:text-terminal-text/25 focus:border-terminal-green/50 focus:bg-black/60"
                value={input.instagramPostUrl}
                disabled={isRunning}
                onChange={(event) => onInstagramPostUrlChange(event.target.value)}
                placeholder="Instagram URL, X profile, hashtag, topic, product, service, article URL..."
              />
              <p className="text-[10px] text-terminal-text/40">
                Instagram and TikTok profile/video inputs can run now. Other supported entities are classified and held until their scanner is implemented.
              </p>
            </div>

            {hasInput && (
              <div className={cn('space-y-3 border px-3.5 py-3', readinessClass(inputDetection.readiness))}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                      Detected Entity
                    </p>
                    <p className="mt-1 break-words text-[12px] font-semibold text-terminal-text/90">
                      {detectedEntity?.label || inputDetection.error || 'Input not recognized'}
                    </p>
                  </div>
                  <span className="shrink-0 border border-current/25 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]">
                    {readinessLabel(inputDetection.readiness)}
                  </span>
                </div>

                {detectedEntity && (
                  <dl className="grid grid-cols-1 gap-2 text-[10px] sm:grid-cols-3">
                    <div>
                      <dt className="uppercase tracking-[0.16em] text-terminal-text/35">Type</dt>
                      <dd className="mt-0.5 font-semibold text-terminal-text/75">
                        {formatOpsInputEntityType(detectedEntity.type)}
                      </dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-[0.16em] text-terminal-text/35">Platform</dt>
                      <dd className="mt-0.5 font-semibold text-terminal-text/75">
                        {formatOpsInputPlatform(detectedEntity.platform)}
                      </dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-[0.16em] text-terminal-text/35">Confidence</dt>
                      <dd className="mt-0.5 font-semibold text-terminal-text/75">
                        {Math.round(detectedEntity.confidence * 100)}%
                      </dd>
                    </div>
                    <div className="sm:col-span-3">
                      <dt className="uppercase tracking-[0.16em] text-terminal-text/35">Normalized</dt>
                      <dd className="mt-0.5 break-all font-semibold text-terminal-text/75">
                        {detectedEntity.normalizedValue}
                      </dd>
                    </div>
                  </dl>
                )}

                {(inputDetection.message || inputDetection.error) && (
                  <p className="text-[10px] leading-relaxed text-terminal-text/60">
                    {inputDetection.message || inputDetection.error}
                  </p>
                )}
              </div>
            )}

            {hasInput && scannerSelection.scanners.length > 0 && (
              <div className="space-y-3 border border-white/[0.08] bg-black/25 px-3.5 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-terminal-text/45">
                      Scanner Selection
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-terminal-text/90">
                      {primaryScanner?.label || 'No scanner selected'}
                    </p>
                  </div>
                  <span className={cn(
                    'shrink-0 border border-current/25 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]',
                    scannerSelection.canRun ? 'text-terminal-green' : 'text-terminal-amber',
                  )}>
                    {scannerSelection.canRun ? 'Executable' : 'Planned'}
                  </span>
                </div>

                <p className="text-[10px] leading-relaxed text-terminal-text/55">
                  {scannerSelection.message}
                </p>

                <ul className="space-y-2">
                  {scannerSelection.scanners.map((scanner) => (
                    <li key={scanner.id} className="border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-terminal-text/85">
                            {scanner.label}
                          </p>
                          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-terminal-text/35">
                            {scanner.isPrimary ? 'Primary' : 'Enrichment'} / {formatScannerType(scanner.type)}
                          </p>
                        </div>
                        <span className={cn('text-[9px] font-semibold uppercase tracking-[0.16em]', scannerStatusClass(scanner.implementationStatus))}>
                          {scanner.implementationStatus}
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] leading-relaxed text-terminal-text/55">
                        Targets: {scanner.targets.slice(0, 4).join(', ')}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasInput && topicExtraction.isReady && (
              <div className="space-y-3 border border-white/[0.08] bg-black/25 px-3.5 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Tags className="h-3.5 w-3.5 text-terminal-green/65" />
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-terminal-text/45">
                        Topic Extraction
                      </p>
                    </div>
                    <p className="mt-1 break-words text-[12px] font-semibold text-terminal-text/90">
                      {primaryTopic?.label || 'Topic seeds ready'}
                    </p>
                  </div>
                  <span className="shrink-0 border border-terminal-green/25 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-terminal-green">
                    {topicExtraction.readiness}
                  </span>
                </div>

                <p className="text-[10px] leading-relaxed text-terminal-text/55">
                  {topicExtraction.message}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {topicExtraction.topics.slice(0, 6).map((topic) => (
                    <span
                      key={topic.id}
                      title={topic.description}
                      className={cn(
                        'inline-flex max-w-full items-center gap-1.5 border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]',
                        topicSignalClass(topic.signalType),
                      )}
                    >
                      <span className="truncate">{topic.label}</span>
                      <span className="shrink-0 text-current/55">
                        {formatOpsTopicSignalType(topic.signalType)} / {Math.round(topic.confidence * 100)}%
                      </span>
                    </span>
                  ))}
                </div>

                {topicExtraction.clusters.length > 0 && (
                  <div className="space-y-1.5 border-t border-white/[0.05] pt-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-terminal-text/35">
                      Topic Clusters
                    </p>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {topicExtraction.clusters.slice(0, 4).map((cluster) => (
                        <li key={cluster.id} className="border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate text-[10px] font-semibold text-terminal-text/80">
                              {cluster.label}
                            </span>
                            <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em] text-terminal-text/40">
                              {Math.round(cluster.confidence * 100)}%
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-terminal-text/45">
                            {cluster.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Instagram Profile Posts Count
              </label>
              <input
                type="number"
                min={1}
                max={30}
                className="w-full border border-white/[0.08] bg-black/40 px-3.5 py-2.5 text-[12px] tracking-[0.02em] text-terminal-text/95 outline-none transition-colors focus:border-terminal-green/50 focus:bg-black/60"
                value={input.recentProfilePosts}
                disabled={isRunning}
                onChange={(event) => onRecentProfilePostsChange(Number.parseInt(event.target.value || '1', 10))}
              />
              <p className="text-[10px] text-terminal-text/40">Range 1-30. Applies to runnable Instagram profile scans.</p>
              <p className="text-[10px] leading-relaxed text-terminal-text/45">
                Default Ops depth is {OPS_INSTAGRAM_DEFAULT_PROFILE_POSTS} Instagram profile posts. The comment scraper
                collects up to {OPS_INSTAGRAM_COMMENTS_PER_POST} comments per Instagram post
                {isInstagramScan ? `, up to ${instagramCommentTarget.toLocaleString()} comments for this mission.` : '.'}
              </p>
              {detectedEntity?.platform === 'tiktok' && (
                <p className="text-[10px] text-terminal-text/40">
                  TikTok metadata scans use the backend default: 10 videos for profiles, 1 item for direct video URLs.
                </p>
              )}
            </div>

            <MarketScopeSelector
              value={input.competitorMarketFilter}
              disabled={isRunning}
              onChange={onCompetitorMarketFilterChange}
            />

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <button
                onClick={onStart}
                disabled={startDisabled}
                title={startDisabledReason}
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

            {!error && startDisabledReason && !isRunning && (
              <div className="border border-terminal-amber/25 bg-terminal-amber/[0.05] px-3 py-2">
                <p className="text-[10px] tracking-[0.04em] text-terminal-amber/90">{startDisabledReason}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="mb-5 flex items-center gap-2.5 border-b border-white/[0.05] pb-3">
            <Workflow className="h-4 w-4 text-terminal-text/55" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terminal-text/85">
              Mission Configuration
            </h3>
          </div>

          <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
            <div>
              <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Primary Entity
              </dt>
              <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                {primaryEntityLabel}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Platform
              </dt>
              <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                {activePlatform}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Target Type
              </dt>
              <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                {classificationText(targetClassification)}
              </dd>
              {targetClassification?.signals.length ? (
                <dd className="mt-1 line-clamp-2 text-[10px] leading-snug text-terminal-text/45">
                  Signals: {targetClassification.signals.slice(0, 4).join(', ')}
                </dd>
              ) : null}
            </div>
            <div>
              <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Scrape Mode
              </dt>
              <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                {activeScrapeMode}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Primary Scanner
              </dt>
              <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                {primaryScanner?.label || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Primary Topic
              </dt>
              <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                {primaryTopic?.label || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Post Count
              </dt>
              <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                {activePostCount}
              </dd>
            </div>
            {isInstagramScan && (
              <div>
                <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                  Comment Depth
                </dt>
                <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                  {OPS_INSTAGRAM_COMMENTS_PER_POST}/post · up to {instagramCommentTarget.toLocaleString()}
                </dd>
              </div>
            )}
            <div className="col-span-2">
              <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Competitor Market
              </dt>
              <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                {formatMarketFilterLabel(activeMarketFilter)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-white/[0.05] pt-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-3.5 w-3.5 text-terminal-text/45" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                Active Sources
              </p>
            </div>
            {enabledSources.length === 0 ? (
              <p className="mt-2 text-[11px] tracking-[0.04em] text-terminal-text/45">
                No scanner sources selected yet. Runnable Instagram intake uses the default source set.
              </p>
            ) : (
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {enabledSources.map((source) => (
                  <li
                    key={source.key}
                    className="border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-terminal-text/80"
                  >
                    {source.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {setup.postUrls?.length > 0 && (
            <div className="mt-5 border-t border-white/[0.05] pt-4">
              <div className="flex items-center gap-2">
                <Radar className="h-3.5 w-3.5 text-terminal-text/45" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                  Target Posts
                </p>
              </div>
              <ul className="mt-2 space-y-1.5">
                {setup.postUrls.slice(0, 5).map((url) => (
                  <li
                    key={url}
                    className="truncate text-[11px] tracking-[0.02em] text-terminal-text/65"
                    title={url}
                  >
                    {url}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {runStatus !== 'idle' && (
            <>
              <div className="mt-5 border-t border-white/[0.05] pt-4">
                <div className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-terminal-text/45" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                    Providers
                  </p>
                </div>
                <ul className="mt-2 space-y-1.5">
                  <ProviderRow provider={setup.providerHealth.apify} />
                  <ProviderRow provider={setup.providerHealth.xai} />
                  <ProviderRow provider={setup.providerHealth.openai} />
                </ul>
              </div>

              {setup.sourceRuns.length > 0 && (
                <div className="mt-5 border-t border-white/[0.05] pt-4">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-3.5 w-3.5 text-terminal-text/45" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terminal-text/70">
                      Source Runs
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {setup.sourceRuns.map((run) => (
                      <SourceRunRow key={run.id} run={run} />
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function providerStateClass(state: OpsProviderStatusVM['state'] | OpsSourceRunVM['state']): string {
  if (state === 'ok') return 'text-terminal-green';
  if (state === 'warning') return 'text-terminal-amber';
  if (state === 'error') return 'text-terminal-red';
  if (state === 'running') return 'text-terminal-amber';
  return 'text-terminal-text/55';
}

const ProviderRow: React.FC<{ provider: OpsProviderStatusVM }> = ({ provider }) => {
  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <span className="font-semibold text-terminal-text/80">{provider.label}</span>
        <span className={cn('text-[10px] font-semibold uppercase tracking-[0.18em]', providerStateClass(provider.state))}>
          {provider.state}
          {provider.timedOut ? ' · timeout' : ''}
        </span>
      </div>
      <p className="text-[10px] leading-snug text-terminal-text/60">{provider.summary}</p>
      {provider.detail && provider.detail !== provider.summary && (
        <p className="text-[10px] leading-snug text-terminal-text/45">{provider.detail}</p>
      )}
    </li>
  );
};

const SourceRunRow: React.FC<{ run: OpsSourceRunVM }> = ({ run }) => {
  return (
    <li className="flex items-center justify-between gap-3 text-[11px]">
      <span className="font-semibold text-terminal-text/80">{run.label}</span>
      <span className="flex items-center gap-2 text-[10px]">
        <span className="uppercase tracking-[0.14em] text-terminal-text/55">
          {run.records.toLocaleString()} rec
        </span>
        <span className={cn('font-semibold uppercase tracking-[0.18em]', providerStateClass(run.state))}>
          {run.state}
        </span>
      </span>
    </li>
  );
};
