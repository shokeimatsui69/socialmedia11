import type {
  AnalysisSession,
  AnalysisStageType,
  ParallelTask,
  ScrapedPost,
  ScrapedComment,
  ExtractedNarrative,
  Narrative as PlatformNarrative,
  NetworkNode,
  NetworkEdge,
  AccountHealthScore,
  ReportMetrics,
  ResponsePlan,
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

export interface RunnerCompetitor {
  id: string;
  name: string;
  handle?: string;
  platform?: Platform;
  position: string;
  risk: string;
  action?: string;
  evidenceSnippets?: string[];
  pressureType?: NarrativePressureType;
  confidence?: number;
}

export interface RunnerOpsResponse {
  session: RunnerSession & {
    competitors?: RunnerCompetitor[];
    xSignals?: RunnerNarrative[];
  };
}

export type OpsRunStatus = 'idle' | 'running' | 'completed';

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
  };
  recommendation?: string;
  brandPositionSnapshot?: {
    strength?: string;
    weakness?: string;
    threat?: string;
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
}

export interface OpsCompetitorVM {
  id: string;
  name: string;
  position: string;
  risk: string;
  action: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'WATCH';
}

export interface OpsCompetitorsVM {
  isReady: boolean;
  competitors: OpsCompetitorVM[];
  expectedSlots: number;
  highestRisk?: OpsCompetitorVM;
}

export interface OpsBrandPositionVM {
  isReady: boolean;
  derived: boolean;
  takeaway: string;
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
  };
  executiveSummary: OpsExecutiveSummaryVM;
  narratives: OpsNarrativesVM;
  socialSignals: OpsSocialSignalsVM;
  webEvidence: OpsWebEvidenceVM;
  audienceMap: OpsAudienceMapVM;
  competitors: OpsCompetitorsVM;
  brandPosition: OpsBrandPositionVM;
  events: OpsMissionEventVM[];
}
