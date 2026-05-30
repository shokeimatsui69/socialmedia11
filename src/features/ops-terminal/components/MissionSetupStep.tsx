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
  Workflow,
  X,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { OpsProviderStatusVM, OpsRunInput, OpsRunStatus, OpsSourceRunVM, OpsTerminalViewModel } from '../types';
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

  const activeHandle = setup.accountHandle?.replace(/^@/, '') || '—';
  const activePlatform = setup.platform ? setup.platform.toUpperCase() : '—';
  const activeScrapeMode = setup.scrapeMode ? setup.scrapeMode.replace(/_/g, ' ') : '—';
  const activeMarketFilter = setup.competitorMarketFilter ?? input.competitorMarketFilter;
  const enabledSources = SOURCE_DEFINITIONS.filter((source) => setup.sources?.[source.key]);

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
                Instagram Profile or Post URL
              </label>
              <input
                className="w-full border border-white/[0.08] bg-black/40 px-3.5 py-2.5 text-[12px] tracking-[0.02em] text-terminal-text/95 outline-none transition-colors placeholder:text-terminal-text/25 focus:border-terminal-green/50 focus:bg-black/60"
                value={input.instagramPostUrl}
                onChange={(event) => onInstagramPostUrlChange(event.target.value)}
                placeholder="https://www.instagram.com/handle/"
              />
              <p className="text-[10px] text-terminal-text/40">
                Profile URLs collect the latest N posts and comments. Post or reel URLs scan that single piece.
              </p>
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

            <MarketScopeSelector
              value={input.competitorMarketFilter}
              disabled={isRunning}
              onChange={onCompetitorMarketFilterChange}
            />

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
              Mission Configuration
            </h3>
          </div>

          <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
            <div>
              <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Primary Account
              </dt>
              <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                @{activeHandle}
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
                Scrape Mode
              </dt>
              <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                {activeScrapeMode}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-medium uppercase tracking-[0.22em] text-terminal-text/40">
                Post Count
              </dt>
              <dd className="mt-1 text-[12px] font-semibold tracking-[0.02em] text-terminal-text/90">
                {setup.postCount || input.recentProfilePosts}
              </dd>
            </div>
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
                No sources selected. Default Instagram intake will be used.
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
