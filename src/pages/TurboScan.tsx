import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ComponentType, FC, ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Badge, Button, Card } from '../components/ui/Primitives';
import { cn } from '../lib/utils';
import {
  DEFAULT_TURBO_SCAN_SETTINGS,
  detectInstagramUrl,
  runTurboScan,
  type DetectedInstagramUrl,
  type TurboScanSettings,
} from '../services/turboScan';
import type {
  CompetitorProfileInsight,
  ExtractedNarrative,
  IntelligencePipelineResult,
  ProviderDiagnostic,
} from '../types';

const PROGRESS_STEPS = [
  { key: 'validate', label: 'Validating Instagram URL' },
  { key: 'detect', label: 'Detecting URL type' },
  { key: 'instagram', label: 'Scraping Instagram source' },
  { key: 'narrative', label: 'Extracting narrative and content themes' },
  { key: 'x', label: 'Searching X/Twitter via Grok' },
  { key: 'web', label: 'Searching web context via OpenAI' },
  { key: 'competitor_discovery', label: 'Discovering competitors' },
  { key: 'competitor_analysis', label: 'Running competitor analysis' },
  { key: 'report', label: 'Generating final audience and brand-position report' },
] as const;

type ScanStatus = 'idle' | 'running' | 'completed' | 'failed';
type StepStatus = 'waiting' | 'running' | 'completed' | 'failed' | 'skipped';

const numberFormatter = new Intl.NumberFormat('en-US');

const clampNumber = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
};

const formatNumber = (value?: number) => numberFormatter.format(value || 0);

const formatElapsed = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

const readableInputType = (type?: string) => {
  if (!type) return 'Instagram URL';
  if (type === 'reel') return 'Instagram Reel';
  if (type === 'post') return 'Instagram Post';
  return 'Instagram Profile';
};

const firstPresent = (...values: Array<string | undefined | null>) =>
  values.find(value => typeof value === 'string' && value.trim())?.trim() || '';

const uniqueStrings = (items: Array<string | undefined | null>) =>
  Array.from(new Set(items.filter((item): item is string => Boolean(item?.trim()))));

const isStepSkipped = (key: typeof PROGRESS_STEPS[number]['key'], settings: TurboScanSettings) => {
  if (key === 'x') return !settings.includeXSearch;
  if (key === 'web') return !settings.includeWebSearch;
  if (key === 'competitor_discovery' || key === 'competitor_analysis') {
    return !settings.includeCompetitors || settings.competitorCount < 1;
  }
  return false;
};

const EmptyBlock = ({ label }: { label: string }) => (
  <div className="border border-dashed border-terminal-border/20 bg-black/20 p-6 text-center">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/25">{label}</p>
  </div>
);

const MetricBlock = ({ label, value }: { label: string; value: string | number }) => (
  <div className="border border-terminal-border/15 bg-black/30 p-4">
    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-terminal-green/35 mb-2">{label}</p>
    <p className="text-xl font-black tracking-tight text-terminal-text">{value}</p>
  </div>
);

const ToggleSetting = ({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'flex w-full items-center justify-between border border-terminal-border/20 bg-black/25 p-4 text-left transition-all',
      checked ? 'border-terminal-green/40 bg-terminal-green/[0.04]' : 'hover:border-terminal-border/50',
      disabled && 'cursor-not-allowed opacity-50',
    )}
  >
    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-terminal-text/70">{label}</span>
    <span
      className={cn(
        'h-5 w-10 border border-terminal-border/40 p-0.5 transition-all',
        checked && 'border-terminal-green bg-terminal-green/10',
      )}
    >
      <span
        className={cn(
          'block h-full w-4 bg-terminal-text/20 transition-transform',
          checked && 'translate-x-4 bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.45)]',
        )}
      />
    </span>
  </button>
);

const NumberSetting = ({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) => (
  <label className={cn('block border border-terminal-border/20 bg-black/25 p-4', disabled && 'opacity-50')}>
    <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.18em] text-terminal-text/55">{label}</span>
    <input
      type="number"
      min={min}
      max={max}
      disabled={disabled}
      value={value}
      onChange={event => onChange(clampNumber(Number(event.target.value), min, max))}
      className="h-11 w-full border border-terminal-border/30 bg-terminal-bg px-3 text-sm font-black text-terminal-green outline-none transition-all focus:border-terminal-green/60 disabled:cursor-not-allowed"
    />
  </label>
);

const SettingsPanel = ({
  settings,
  disabled,
  onChange,
}: {
  settings: TurboScanSettings;
  disabled: boolean;
  onChange: (settings: TurboScanSettings) => void;
}) => {
  const update = <K extends keyof TurboScanSettings>(key: K, value: TurboScanSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <NumberSetting
        label="Number of Instagram posts to analyze"
        min={1}
        max={25}
        value={settings.postCount}
        disabled={disabled}
        onChange={value => update('postCount', value)}
      />
      <NumberSetting
        label="Number of competitors to analyze"
        min={0}
        max={3}
        value={settings.competitorCount}
        disabled={disabled || !settings.includeCompetitors}
        onChange={value => update('competitorCount', value)}
      />
      <ToggleSetting
        label="Include X/Twitter narrative search"
        checked={settings.includeXSearch}
        disabled={disabled}
        onChange={value => update('includeXSearch', value)}
      />
      <ToggleSetting
        label="Include web intelligence search"
        checked={settings.includeWebSearch}
        disabled={disabled}
        onChange={value => update('includeWebSearch', value)}
      />
      <ToggleSetting
        label="Include competitor discovery"
        checked={settings.includeCompetitors}
        disabled={disabled}
        onChange={value => update('includeCompetitors', value)}
      />
    </div>
  );
};

const StepIcon = ({ status }: { status: StepStatus }) => {
  if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-terminal-green" />;
  if (status === 'failed') return <AlertTriangle className="h-4 w-4 text-terminal-red" />;
  if (status === 'running') return <Loader2 className="h-4 w-4 animate-spin text-terminal-amber" />;
  if (status === 'skipped') return <ChevronDown className="h-4 w-4 -rotate-90 text-terminal-text/25" />;
  return <div className="h-2 w-2 bg-terminal-text/15" />;
};

const ProgressTimeline = ({
  status,
  activeStepIndex,
  settings,
  elapsedSeconds,
}: {
  status: ScanStatus;
  activeStepIndex: number;
  settings: TurboScanSettings;
  elapsedSeconds: number;
}) => (
  <Card className="p-6">
    <div className="mb-6 flex flex-col gap-3 border-b border-terminal-border/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-black uppercase tracking-tight text-terminal-text">Scan Progress</h2>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-terminal-text/35">
          Instagram to X to Web to Competitor intelligence workflow
        </p>
      </div>
      <Badge
        variant={status === 'completed' ? 'positive' : status === 'failed' ? 'negative' : 'neutral'}
        className="w-fit"
      >
        {status === 'completed' ? 'Completed' : status === 'failed' ? 'Attention' : `Running ${formatElapsed(elapsedSeconds)}`}
      </Badge>
    </div>

    <div className="space-y-3">
      {PROGRESS_STEPS.map((step, index) => {
        const skipped = isStepSkipped(step.key, settings);
        const stepStatus: StepStatus = skipped
          ? 'skipped'
          : status === 'completed'
            ? 'completed'
            : status === 'failed' && index === activeStepIndex
              ? 'failed'
              : index < activeStepIndex
                ? 'completed'
                : index === activeStepIndex && status === 'running'
                  ? 'running'
                  : 'waiting';

        return (
          <div
            key={step.key}
            className={cn(
              'flex items-center gap-4 border border-terminal-border/10 bg-black/20 p-4 transition-all',
              stepStatus === 'running' && 'border-terminal-amber/35 bg-terminal-amber/[0.03]',
              stepStatus === 'completed' && 'border-terminal-green/20 bg-terminal-green/[0.025]',
              stepStatus === 'failed' && 'border-terminal-red/40 bg-terminal-red/[0.04]',
              stepStatus === 'skipped' && 'opacity-45',
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-terminal-border/20 bg-black/50">
              <StepIcon status={stepStatus} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-black uppercase tracking-wide text-terminal-text">{step.label}</p>
              <p className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-terminal-text/25">
                {stepStatus}
              </p>
              {step.key === 'report' && stepStatus === 'running' && (
                <p className="mt-2 text-[10px] font-bold leading-relaxed text-terminal-amber/70">
                  Waiting on the backend workflow to return the final report. Full scans with competitors can take several minutes.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </Card>
);

const SectionCard = ({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}) => (
  <Card className={cn('p-6', className)}>
    <div className="mb-5 flex items-center gap-3 border-b border-terminal-border/10 pb-4">
      <div className="flex h-9 w-9 items-center justify-center border border-terminal-border/25 bg-terminal-green/5 text-terminal-green">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-[12px] font-black uppercase tracking-[0.18em] text-terminal-green/70">{title}</h3>
    </div>
    {children}
  </Card>
);

const NarrativeList = ({ narratives }: { narratives?: ExtractedNarrative[] }) => {
  if (!narratives?.length) return <EmptyBlock label="No extracted narratives returned" />;

  return (
    <div className="space-y-3">
      {narratives.slice(0, 4).map(narrative => (
        <div key={narrative.id} className="border border-terminal-border/15 bg-black/25 p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-terminal-text">{narrative.label}</p>
            <Badge
              variant={narrative.sentiment === 'positive' ? 'positive' : narrative.sentiment === 'negative' ? 'negative' : 'info'}
              dot={false}
            >
              {narrative.sentiment}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-terminal-text/55">{narrative.description}</p>
          {!!narrative.keywords?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {narrative.keywords.slice(0, 5).map(keyword => (
                <span key={keyword} className="border border-terminal-border/20 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-terminal-text/35">
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const DiagnosticsBanner = ({ diagnostics }: { diagnostics?: ProviderDiagnostic[] }) => {
  const warnings = diagnostics?.filter(item => item.status !== 'ok') || [];
  if (!warnings.length) return null;

  return (
    <Card className="border-terminal-amber/25 bg-terminal-amber/[0.025] p-5">
      <div className="mb-3 flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-terminal-amber" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-amber">Workflow Notes</p>
      </div>
      <div className="space-y-2">
        {warnings.slice(0, 4).map((item, index) => (
          <p key={`${item.provider}-${index}`} className="text-xs leading-relaxed text-terminal-text/55">
            <span className="font-black uppercase text-terminal-text/70">{item.provider}:</span> {item.message}
          </p>
        ))}
      </div>
    </Card>
  );
};

interface CompetitorCardProps {
  competitor: CompetitorProfileInsight;
}

const CompetitorCard: FC<CompetitorCardProps> = ({ competitor }) => {
  const topNarrative = competitor.extractedNarratives?.[0];
  const criticalPressure = competitor.accountHealth?.ratios?.criticalPressure || 0;
  const strengths = uniqueStrings([
    competitor.accountHealth?.score ? `${competitor.accountHealth.status} audience health (${competitor.accountHealth.score}/100)` : '',
    topNarrative?.label ? `Owns narrative angle: ${topNarrative.label}` : '',
    competitor.scrapedPosts?.length ? `${competitor.scrapedPosts.length} posts indexed` : '',
  ]).slice(0, 3);
  const weaknesses = uniqueStrings([
    criticalPressure > 20 ? `${criticalPressure}% critical pressure detected` : '',
    competitor.overlapScore > 65 ? 'High overlap with the source positioning' : 'Lower shared audience signal',
    competitor.webEvidence?.length ? '' : 'Limited external evidence returned',
  ]).slice(0, 3);

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-terminal-text">@{competitor.handle}</p>
          <a
            href={competitor.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-terminal-green/55 hover:text-terminal-green"
          >
            Open profile <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Badge variant="info" dot={false}>{competitor.overlapScore}% overlap</Badge>
      </div>

      <div className="space-y-4 text-xs leading-relaxed text-terminal-text/60">
        <div>
          <p className="mb-1 text-[8px] font-black uppercase tracking-[0.2em] text-terminal-green/35">Narrative angle</p>
          <p>{topNarrative?.description || competitor.positioningSummary || 'Narrative angle unavailable.'}</p>
        </div>
        <div>
          <p className="mb-1 text-[8px] font-black uppercase tracking-[0.2em] text-terminal-green/35">Positioning difference</p>
          <p>{competitor.reason || competitor.positioningSummary || 'No positioning difference returned.'}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[8px] font-black uppercase tracking-[0.2em] text-terminal-green/35">Strengths</p>
            <ul className="space-y-1">
              {(strengths.length ? strengths : ['No strengths returned']).map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[8px] font-black uppercase tracking-[0.2em] text-terminal-green/35">Weaknesses</p>
            <ul className="space-y-1">
              {(weaknesses.length ? weaknesses : ['No weaknesses returned']).map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
        <div>
          <p className="mb-1 text-[8px] font-black uppercase tracking-[0.2em] text-terminal-green/35">Opportunity gap</p>
          <p>{competitor.opportunitySignals?.[0] || 'No explicit opportunity gap returned for this competitor.'}</p>
        </div>
      </div>
    </Card>
  );
};

const ResultsDashboard = ({
  result,
  detected,
}: {
  result: IntelligencePipelineResult;
  detected?: DetectedInstagramUrl;
}) => {
  const session = result.session;
  const metrics = session.reportMetrics;
  const strategic = session.strategicIntelligence;
  const competitors = session.competitorProfiles?.slice(0, 3) || [];
  const themes = uniqueStrings([
    ...(metrics?.dominantNarratives || []),
    ...(session.extractedNarratives?.map(item => item.label) || []),
  ]).slice(0, 8);
  const sourceUrl = firstPresent(session.primaryProfileUrl, detected?.normalizedUrl);
  const sourceTitle = firstPresent(session.accountHandle ? `@${session.accountHandle}` : '', detected?.shortcode, 'Instagram source');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-terminal-border/30 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="positive">Scan complete</Badge>
            {detected && <Badge variant="info" dot={false}>{readableInputType(detected.type)}</Badge>}
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-terminal-text">Intelligence Report</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-terminal-text/45">
            Complete audience, narrative, competitor, and brand-positioning output from the TurboScan workflow.
          </p>
        </div>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 border border-terminal-border/30 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-terminal-green/60 transition-all hover:border-terminal-green/50 hover:text-terminal-green"
          >
            Source <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <DiagnosticsBanner diagnostics={session.providerDiagnostics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Source profile/post summary" icon={FileText}>
          <div className="mb-5">
            <p className="text-2xl font-black text-terminal-text">{sourceTitle}</p>
            <p className="mt-2 break-all text-xs text-terminal-text/45">{sourceUrl || 'No source URL returned'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricBlock label="Posts" value={formatNumber(metrics?.totalPostsAnalyzed)} />
            <MetricBlock label="Comments" value={formatNumber(metrics?.totalCommentsCollected)} />
            <MetricBlock label="Unique audience" value={formatNumber(metrics?.totalUniqueCommentersMapped)} />
            <MetricBlock label="Health score" value={`${metrics?.accountHealthScore || session.accountHealth?.score || 0}/100`} />
          </div>
        </SectionCard>

        <SectionCard title="Extracted narrative" icon={MessageSquare}>
          <NarrativeList narratives={session.extractedNarratives} />
        </SectionCard>

        <SectionCard title="Core content themes" icon={BarChart3}>
          {themes.length ? (
            <div className="flex flex-wrap gap-2">
              {themes.map(theme => (
                <span key={theme} className="border border-terminal-border/25 bg-black/25 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-terminal-text/65">
                  {theme}
                </span>
              ))}
            </div>
          ) : (
            <EmptyBlock label="No content themes returned" />
          )}
        </SectionCard>

        <SectionCard title="Audience status" icon={Users}>
          <p className="mb-5 text-sm leading-relaxed text-terminal-text/60">
            {strategic?.audienceStatusOverview || 'No audience status summary returned.'}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <MetricBlock label="Positive" value={`${metrics?.sentimentDistribution?.positive || 0}%`} />
            <MetricBlock label="Neutral" value={`${metrics?.sentimentDistribution?.neutral || 0}%`} />
            <MetricBlock label="Negative" value={`${metrics?.sentimentDistribution?.negative || 0}%`} />
          </div>
        </SectionCard>

        <SectionCard title="Follower narrative map" icon={Activity}>
          <p className="mb-4 text-sm leading-relaxed text-terminal-text/60">
            {formatNumber(session.networkNodes?.length)} nodes and {formatNumber(session.networkEdges?.length)} audience links mapped from the Instagram source.
          </p>
          {result.intentDistribution?.length ? (
            <div className="space-y-2">
              {result.intentDistribution.slice(0, 6).map(intent => (
                <div key={intent.intent} className="flex items-center justify-between border border-terminal-border/15 bg-black/20 px-4 py-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-terminal-text/55">{intent.intent}</span>
                  <span className="text-sm font-black text-terminal-green">{intent.percentage}%</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyBlock label="No follower intent map returned" />
          )}
        </SectionCard>

        <SectionCard title="Web sentiment and topic status" icon={Globe}>
          <p className="text-sm leading-relaxed text-terminal-text/60">
            {strategic?.webSentimentAndTopicPositioning || strategic?.webIntelligenceSummary || 'No web intelligence summary returned.'}
          </p>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-terminal-green/35">
            Evidence hits: {formatNumber(session.webEvidence?.length)}
          </p>
        </SectionCard>

        <SectionCard title="X/Twitter narrative signals" icon={Search}>
          <p className="text-sm leading-relaxed text-terminal-text/60">
            {strategic?.xIntelligenceSummary || strategic?.crossPlatformNarrativeAlignment || 'No X/Twitter narrative signals returned.'}
          </p>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-terminal-green/35">
            Momentum: {strategic?.trendMomentumAnalysis || 'Not available'}
          </p>
        </SectionCard>

        <SectionCard title="Competitor analysis" icon={Target}>
          <p className="text-sm leading-relaxed text-terminal-text/60">
            {strategic?.competitorPositioningComparison || 'No competitor analysis returned.'}
          </p>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-terminal-green/35">
            Competitors analyzed: {formatNumber(competitors.length)}
          </p>
        </SectionCard>

        <SectionCard title="Brand positioning summary" icon={ShieldCheck}>
          <p className="text-sm leading-relaxed text-terminal-text/60">
            {strategic?.brandPositioningAnalysis || strategic?.brandPerceptionInsights || 'No brand positioning summary returned.'}
          </p>
        </SectionCard>

        <SectionCard title="Strategic content recommendations" icon={Zap}>
          {strategic?.contentStrategyRecommendations?.length ? (
            <div className="space-y-3">
              {strategic.contentStrategyRecommendations.slice(0, 6).map(recommendation => (
                <div key={recommendation} className="border border-terminal-border/15 bg-black/25 p-4 text-sm leading-relaxed text-terminal-text/65">
                  {recommendation}
                </div>
              ))}
            </div>
          ) : (
            <EmptyBlock label="No strategic recommendations returned" />
          )}
        </SectionCard>
      </div>

      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-terminal-border/20 pb-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-terminal-text">Top Competitors</h3>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-terminal-text/30">Comparison cards from competitor discovery</p>
          </div>
          <Badge variant={competitors.length ? 'positive' : 'outline'} dot={competitors.length > 0}>
            {competitors.length ? `${competitors.length} found` : 'None'}
          </Badge>
        </div>
        {competitors.length ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {competitors.map(competitor => <CompetitorCard key={competitor.handle} competitor={competitor} />)}
          </div>
        ) : (
          <EmptyBlock label="No competitors found or competitor discovery was disabled" />
        )}
      </section>
    </div>
  );
};

export default function TurboScan() {
  const [url, setUrl] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<TurboScanSettings>(DEFAULT_TURBO_SCAN_SETTINGS);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [detected, setDetected] = useState<DetectedInstagramUrl | undefined>();
  const [result, setResult] = useState<IntelligencePipelineResult | null>(null);
  const [error, setError] = useState('');
  const [scanStartedAt, setScanStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isScanning = scanStatus === 'running';
  const liveDetection = useMemo(() => detectInstagramUrl(url), [url]);
  const canSubmit = Boolean(url.trim()) && !isScanning;

  useEffect(() => {
    if (scanStatus !== 'running') return;

    const interval = window.setInterval(() => {
      setActiveStepIndex(index => Math.min(index + 1, PROGRESS_STEPS.length - 1));
    }, 1800);

    return () => window.clearInterval(interval);
  }, [scanStatus]);

  useEffect(() => {
    if (scanStatus !== 'running' || !scanStartedAt) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - scanStartedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [scanStartedAt, scanStatus]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setResult(null);
    setActiveStepIndex(0);
    setElapsedSeconds(0);

    const detection = detectInstagramUrl(url);
    if (!detection.isValid || !detection.detected) {
      setDetected(undefined);
      setScanStatus('failed');
      setError(detection.error || 'Enter a valid Instagram URL.');
      return;
    }

    const normalizedSettings = {
      ...settings,
      postCount: clampNumber(settings.postCount, 1, 25),
      competitorCount: settings.includeCompetitors ? clampNumber(settings.competitorCount, 0, 3) : 0,
    };

    setSettings(normalizedSettings);
    setDetected(detection.detected);
    setScanStatus('running');
    setScanStartedAt(Date.now());
    setActiveStepIndex(1);

    try {
      const response = await runTurboScan(detection.detected, normalizedSettings);
      setResult(response);
      setScanStatus('completed');
      setScanStartedAt(null);
      setActiveStepIndex(PROGRESS_STEPS.length - 1);
    } catch (scanError) {
      setScanStatus('failed');
      setScanStartedAt(null);
      setError(scanError instanceof Error ? scanError.message : String(scanError));
    }
  };

  return (
    <div className="min-h-screen pb-20 font-mono">
      <section className="mx-auto max-w-5xl border-b border-terminal-border/25 pb-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center border border-terminal-green/35 bg-terminal-green/10">
            <Zap className="h-5 w-5 text-terminal-green" />
          </div>
          <Badge variant="positive">Unified scan entry</Badge>
        </div>

        <h1 className="text-5xl font-black uppercase tracking-tight text-terminal-text md:text-7xl">TurboScan</h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-terminal-text/58 md:text-lg">
          Paste an Instagram post, Reel, or profile URL and generate a complete audience, narrative, competitor, and brand-positioning analysis.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-terminal-green/35" />
              <input
                type="text"
                value={url}
                disabled={isScanning}
                onChange={event => setUrl(event.target.value)}
                placeholder="https://www.instagram.com/p/... or https://www.instagram.com/profile/"
                className="h-16 w-full border border-terminal-border/40 bg-black/35 pl-14 pr-5 text-sm font-bold text-terminal-text outline-none transition-all placeholder:text-terminal-text/18 focus:border-terminal-green/60 focus:bg-black/55 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <Button type="submit" disabled={!canSubmit} className="h-16 px-8 text-[11px] md:w-48">
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Start Scan
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-6">
              {url.trim() && liveDetection.isValid && liveDetection.detected && (
                <Badge variant="info" dot={false}>{readableInputType(liveDetection.detected.type)} detected</Badge>
              )}
              {url.trim() && !liveDetection.isValid && (
                <p className="text-xs font-bold text-terminal-amber">{liveDetection.error}</p>
              )}
            </div>
            <button
              type="button"
              disabled={isScanning}
              onClick={() => setSettingsOpen(value => !value)}
              className="inline-flex items-center justify-center gap-2 border border-terminal-border/25 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-terminal-text/55 transition-all hover:border-terminal-green/45 hover:text-terminal-green disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Settings className="h-3.5 w-3.5" />
              Scan settings
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', settingsOpen && 'rotate-180')} />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {settingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="border border-terminal-border/25 bg-terminal-panel/35 p-5">
                  <SettingsPanel settings={settings} disabled={isScanning} onChange={setSettings} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </section>

      <div className="mx-auto mt-8 max-w-6xl space-y-8">
        {scanStatus === 'idle' && !result && (
          <Card className="p-8 text-center">
            <Globe className="mx-auto mb-4 h-10 w-10 text-terminal-green/25" />
            <p className="text-sm font-black uppercase tracking-[0.22em] text-terminal-text/35">
              Ready for an Instagram URL
            </p>
          </Card>
        )}

        {(scanStatus === 'running' || scanStatus === 'completed' || scanStatus === 'failed') && (
          <ProgressTimeline status={scanStatus} activeStepIndex={activeStepIndex} settings={settings} elapsedSeconds={elapsedSeconds} />
        )}

        {error && (
          <Card className="border-terminal-red/35 bg-terminal-red/[0.035] p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-terminal-red" />
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-terminal-red">Scan Error</h2>
                <p className="mt-2 text-sm leading-relaxed text-terminal-text/65">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {result && <ResultsDashboard result={result} detected={detected} />}
      </div>
    </div>
  );
}
