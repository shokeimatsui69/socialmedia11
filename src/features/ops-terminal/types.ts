import type {
  AnalysisSession,
  AnalysisStageType,
  AudienceCluster,
  BrandPositionPosture,
  CommentIntentDistribution,
  CompetitorAudienceGap,
  CompetitorContentPattern,
  CompetitorMarketScope,
  CompetitorStealPlay,
  IntelligenceSource,
  ParallelTask,
  ProviderDiagnostic,
  ScrapedPost,
  ScrapedComment,
  ExtractedNarrative,
  Narrative as PlatformNarrative,
  NetworkNode,
  NetworkEdge,
  AccountHealthScore,
  ReportMetrics,
  ResponsePlan,
  SourceRun,
  StrategicIntelligenceLayer,
  ContentSuggestion,
  LiveActionEvent,
  WebEvidenceHit,
  TaskStatus,
  Sentiment,
  NarrativePressureType,
  Platform,
  ImportedProfileRow,
} from '../../types';

export type RunnerSession = AnalysisSession;
export type RunnerParallelTask = ParallelTask;
export type RunnerScrapedPost = ScrapedPost;
export type RunnerScrapedComment = ScrapedComment;
export type RunnerExtractedNarrative = ExtractedNarrative;
export type RunnerNarrative = PlatformNarrative;
export type RunnerNetworkNode = NetworkNode;
export type RunnerNetworkEdge = NetworkEdge;
export type RunnerAccountHealth = AccountHealthScore;
export type RunnerReportMetrics = ReportMetrics;
export type RunnerResponsePlan = ResponsePlan;
export type RunnerResponseSuggestion = ContentSuggestion;
export type RunnerEvent = LiveActionEvent;
export type RunnerWebEvidence = WebEvidenceHit;
export type RunnerTaskStatus = TaskStatus;
export type RunnerStageType = AnalysisStageType;
export type RunnerProfileRow = ImportedProfileRow;
export type RunnerPlatform = Platform;
export type RunnerSentiment = Sentiment;
export type RunnerNarrativePressureType = NarrativePressureType;
export type RunnerAudienceCluster = AudienceCluster;
export type RunnerIntentDistribution = CommentIntentDistribution;
export type RunnerProviderDiagnostic = ProviderDiagnostic;
export type RunnerSourceRun = SourceRun;
export type RunnerStrategicIntelligence = StrategicIntelligenceLayer;

export interface RunnerCompetitor {
  id: string;
  name: string;
  handle?: string;
  platform?: Platform;
  profileUrl?: string;
  websiteUrl?: string;
  position: string;
  risk: string;
  action?: string;
  evidenceSnippets?: string[];
  evidenceUrls?: string[];
  pressureType?: NarrativePressureType;
  confidence?: number;
  overlapScore?: number;
  healthStatus?: AccountHealthScore['status'];
  topNarrative?: string;
  counterPosition?: string;
  verificationState?: 'verified' | 'web-verified' | 'unverified' | 'fallback';
  battlefieldSummary?: string;
  stealPlays?: CompetitorStealPlay[];
  audienceGaps?: CompetitorAudienceGap[];
  contentPatterns?: CompetitorContentPattern[];
  marketScope?: CompetitorMarketScope;
  country?: string;
  category?: string;
  searchQuery?: string;
}

export interface RunnerOpsResponse {
  session: RunnerSession & {
    competitors?: RunnerCompetitor[];
    xSignals?: RunnerNarrative[];
    audienceClusters?: RunnerAudienceCluster[];
    intentDistribution?: RunnerIntentDistribution[];
    strategicIntelligence?: RunnerStrategicIntelligence;
    providerDiagnostics?: RunnerProviderDiagnostic[];
  };
  sourceRuns?: RunnerSourceRun[];
  audienceClusters?: RunnerAudienceCluster[];
  intentDistribution?: RunnerIntentDistribution[];
  runtime?: {
    startedAt?: string;
    completedAt?: string;
    durationMs?: number;
  };
}

export type OpsRunStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface OpsRunInput {
  instagramPostUrl: string;
  recentProfilePosts: number;
}

export interface OpsTerminalHeaderVM {
  missionTitle: string;
  accountHandle: string;
  platform: Platform;
  scrapeMode: AnalysisSession['scrapeMode'];
  status: OpsRunStatus;
  currentStageLabel: string;
  completedStages: number;
  totalStages: number;
  progress: number;
  confidenceScore: number;
  readinessScore: number;
  readinessLabel: string;
  updatedAt: string;
  runtime: OpsRuntimeVM;
}

export interface OpsRuntimeVM {
  startedAt?: string;
  completedAt?: string;
  elapsedMs: number;
  display: string;
  state: 'idle' | 'running' | 'completed' | 'failed';
}

export interface OpsPipelineStageVM {
  id: string;
  label: string;
  detail: string;
  status: 'waiting' | 'running' | 'completed';
}

export interface OpsParallelTaskVM {
  id: string;
  label: string;
  status: TaskStatus;
  progress: number;
  recordsCount: number;
  lastEvent?: string;
}

export interface OpsExecutiveSummaryVM {
  isReady: boolean;
  takeawaySentence: string;
  mainOpportunity: string;
  mainRisk: string;
  metrics: {
    posts: number;
    comments: number;
    commenters: number;
    sentiment: { positive: number; neutral: number; negative: number };
    health: number;
    healthStatus: AccountHealthScore['status'];
    engagementAuthenticity: number;
    narrativeStability: number;
    reportReadiness: number;
    dominantNarratives: string[];
  };
  recommendation?: string;
  brandPositionSnapshot?: {
    strength?: string;
    weakness?: string;
    threat?: string;
  };
  strategicContext?: {
    audienceStatusOverview?: string;
    brandPositioningAnalysis?: string;
  };
}

export interface OpsNarrativeVM {
  id: string;
  title: string;
  description: string;
  sentiment: Sentiment;
  confidence?: number;
  reach?: number;
  pressureType?: NarrativePressureType;
  keywords?: string[];
  evidenceSnippets?: string[];
  representativeSignal?: string;
  narrativeEvidence?: Array<{
    commentId: string;
    label: string;
    summary: string;
    authorHandle?: string;
  }>;
}

export interface OpsNarrativesVM {
  isReady: boolean;
  themes: OpsNarrativeVM[];
  priorityTheme?: OpsNarrativeVM;
}

export interface OpsSocialSignalVM {
  id: string;
  source: string;
  signal: string;
  intensity: 'high' | 'medium' | 'low';
  sentiment: Sentiment;
  relevance: number;
}

export interface OpsSocialSignalsVM {
  isReady: boolean;
  signals: OpsSocialSignalVM[];
  topSignal?: OpsSocialSignalVM;
  derivedFromNarratives: boolean;
  xIntelligence: OpsXIntelligenceVM;
}

export interface OpsWebEvidenceVM {
  isReady: boolean;
  items: Array<{
    id: string;
    outlet: string;
    domain: string;
    title: string;
    excerpt: string;
    url: string;
    confidence: number;
    sentiment: Sentiment;
  }>;
  strongest?: OpsWebEvidenceVM['items'][number];
  webIntelligence: OpsWebIntelligenceVM;
  providerSummary?: string;
  providerState: 'ok' | 'warning' | 'error' | 'idle';
  newsSource?: OpsSourceRunVM;
}

export interface OpsAudienceSegmentVM {
  id: string;
  name: string;
  share: number;
  trend: 'up' | 'stable' | 'down';
  sentiment: Sentiment;
  influence: 'High' | 'Medium' | 'Emerging';
}

export interface OpsAudienceMapVM {
  isReady: boolean;
  segments: OpsAudienceSegmentVM[];
  dominant?: OpsAudienceSegmentVM;
  totalNodes: number;
  totalCommentersMapped: number;
  clusters: OpsAudienceClusterVM[];
  intentDistribution: OpsAudienceIntentVM[];
  source: 'clusters' | 'ratios' | 'empty';
}

export interface OpsCompetitorVM {
  id: string;
  name: string;
  handle?: string;
  profileUrl?: string;
  websiteUrl?: string;
  position: string;
  risk: string;
  action: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'WATCH';
  confidence?: number;
  evidenceUrls: string[];
  overlapScore?: number;
  healthStatus?: AccountHealthScore['status'];
  topNarrative?: string;
  counterPosition?: string;
  verificationState?: 'verified' | 'web-verified' | 'unverified' | 'fallback';
  battlefieldSummary?: string;
  narrativePressure?: string;
  stealPlays: OpsStealPlayVM[];
  audienceGaps: OpsAudienceGapVM[];
  contentPatterns: OpsContentPatternVM[];
  marketScope?: CompetitorMarketScope;
  country?: string;
  category?: string;
  searchQuery?: string;
}

export interface OpsStealPlayVM {
  competitorId: string;
  competitorName: string;
  competitorHandle?: string;
  title: string;
  whyItWorks: string;
  howToAdapt: string;
  evidence: string[];
  confidence: number;
  source: IntelligenceSource;
}

export interface OpsAudienceGapVM {
  praised: string[];
  askedFor: string[];
  complaints: string[];
  opportunity: string;
  evidence: string[];
  confidence: number;
  source: IntelligenceSource;
}

export interface OpsContentPatternVM {
  winningFormat: string;
  hookStyle: string;
  proofMechanism: string;
  ctaPattern: string;
  cadenceSignal: string;
  recommendedAdaptation: string;
  evidence: string[];
  confidence: number;
  source: IntelligenceSource;
}

export interface OpsCompetitorsVM {
  isReady: boolean;
  competitors: OpsCompetitorVM[];
  expectedSlots: number;
  highestRisk?: OpsCompetitorVM;
  topStealPlays: OpsStealPlayVM[];
  emptyState?: OpsCompetitorEmptyStateVM;
}

export interface OpsBrandPositionVM {
  isReady: boolean;
  derived: boolean;
  takeaway: string;
  posture?: BrandPositionPosture;
  confidence?: number;
  source?: 'openai' | 'fallback' | 'xai' | 'web';
  positionThesis?: string;
  proofPoints: string[];
  priorityActions: string[];
  narrativeLevers: string[];
  competitorPressures: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendation: string;
}

export interface OpsMissionEventVM {
  id: string;
  timestamp: string;
  message: string;
  tone: 'info' | 'running' | 'success' | 'warning';
}

export interface OpsProviderStatusVM {
  provider: ProviderDiagnostic['provider'];
  label: string;
  state: 'ok' | 'warning' | 'error' | 'idle';
  summary: string;
  detail?: string;
  durationMs?: number;
  timedOut?: boolean;
}

export interface OpsProviderHealthVM {
  apify: OpsProviderStatusVM;
  xai: OpsProviderStatusVM;
  openai: OpsProviderStatusVM;
  diagnostics: ProviderDiagnostic[];
}

export interface OpsSourceRunVM {
  id: string;
  source: Platform;
  label: string;
  state: 'ok' | 'warning' | 'error' | 'idle' | 'running';
  records: number;
  errors?: string[];
}

export interface OpsWebIntelligenceVM {
  isParsed: boolean;
  summary?: string;
  sentiment?: { positive: number; neutral: number; negative: number };
  marketNarratives: string[];
  industryDiscussions: string[];
  evidence: Array<{
    id: string;
    outlet: string;
    domain: string;
    title: string;
    excerpt: string;
    url: string;
    confidence: number;
    sentiment: Sentiment;
  }>;
  rawSummary?: string;
}

export interface OpsAudienceClusterVM {
  id: string;
  name: string;
  size: number;
  activity: number;
  sentiment: Sentiment;
  topTopics: string[];
  keyVoices: string[];
  narrativeShare: { narrativeId: string; share: number }[];
  share: number;
  intent: 'positive' | 'neutral' | 'negative';
}

export interface OpsAudienceIntentVM {
  intent: string;
  percentage: number;
  count: number;
}

export interface OpsBrandPositionPanelVM {
  audienceStatusOverview?: string;
  brandPositioningAnalysis?: string;
  brandPerceptionInsights?: string;
  narrativeOverlapAndDifferentiation?: string;
  marketOpportunitySignals: string[];
  audienceMigrationPatterns: string[];
  contentStrategyRecommendations: string[];
  webSummary?: string;
}

export interface OpsCompetitorEmptyStateVM {
  message: string;
  comparisonText?: string;
  taskState?: 'completed' | 'warning' | 'failed' | 'running' | 'waiting';
  taskRecords?: number;
}

export interface OpsXIntelligenceVM {
  state: 'ok' | 'warning' | 'error' | 'idle';
  summary?: string;
  alignment?: string;
  momentum?: string;
  errors: string[];
  taskRecords?: number;
}

export interface OpsTerminalViewModel {
  header: OpsTerminalHeaderVM;
  pipeline: {
    stages: OpsPipelineStageVM[];
    parallelTasks: OpsParallelTaskVM[];
    activeStageIndex: number;
  };
  setup: {
    primaryProfileUrl: string;
    accountHandle: string;
    platform: Platform;
    scrapeMode: AnalysisSession['scrapeMode'];
    postCount: number;
    postUrls: string[];
    sources: AnalysisSession['sources'];
    sourceRuns: OpsSourceRunVM[];
    providerHealth: OpsProviderHealthVM;
  };
  executiveSummary: OpsExecutiveSummaryVM;
  narratives: OpsNarrativesVM;
  socialSignals: OpsSocialSignalsVM;
  webEvidence: OpsWebEvidenceVM;
  audienceMap: OpsAudienceMapVM;
  competitors: OpsCompetitorsVM;
  brandPosition: OpsBrandPositionVM;
  events: OpsMissionEventVM[];
  providerHealth: OpsProviderHealthVM;
  webIntelligence: OpsWebIntelligenceVM;
  xIntelligence: OpsXIntelligenceVM;
  brandPositionPanel: OpsBrandPositionPanelVM;
}
