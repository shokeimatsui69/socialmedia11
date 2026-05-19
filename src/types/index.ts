export type Platform = 'instagram' | 'x' | 'facebook' | 'tiktok' | 'news' | 'forum';
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'scheduled';
export type CampaignStatus = 'active' | 'paused' | 'completed';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type AnalysisStageType = 
  | 'validating_inputs' 
  | 'collecting_posts' 
  | 'collecting_comments' 
  | 'collecting_mentions'
  | 'scanning_portals' 
  | 'scanning_forums' 
  | 'extracting_narratives' 
  | 'building_network_map'
  | 'scoring_account_health' 
  | 'flagging_review_items' 
  | 'assembling_report' 
  | 'ready_for_review'
  | 'planning_responses' 
  | 'awaiting_approval' 
  | 'supervising' 
  | 'completed';

export interface Client {
  id: string;
  name: string;
  industry: string;
  logo: string;
  accountManager: string;
}

export interface Campaign {
  id: string;
  clientId: string;
  name: string;
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  kpis: KPISet;
}

export interface KPISet {
  reach: number;
  engagement: number;
  sentimentScore: number;
  mentions: number;
  deltaReach: number;
  deltaEngagement: number;
  deltaSentiment: number;
}

export interface IngestionJob {
  id: string;
  clientId: string;
  source: Platform;
  status: JobStatus;
  progress: number;
  records: number;
  lastSync: string;
  interval: string;
  health: number;
  error?: string;
  narrativeExtractionStatus: 'pending' | 'active' | 'completed';
}

export interface AudienceCluster {
  id: string;
  clientId: string;
  name: string;
  size: number;
  activity: number;
  sentiment: Sentiment;
  topTopics: string[];
  keyVoices: string[];
  narrativeShare: { narrativeId: string, share: number }[];
  lastActivity: string;
  coordinates: { x: number, y: number };
}

export type NetworkNodeType = 
  | 'primary_account'
  | 'direct_commenter'
  | 'active_supporter'
  | 'neutral_observer'
  | 'critical_user'
  | 'high_influence_account'
  | 'possible_bot'
  | 'possible_coordinated_account'
  | 'possible_malicious_actor'
  | 'community_cluster'
  | 'follower_extension';

export type UserIntent = 
  | 'Supportive'
  | 'Curious'
  | 'Neutral'
  | 'Opportunistic'
  | 'Promotional'
  | 'Critical'
  | 'Disruptive'
  | 'Suspicious'
  | 'Coordinated Risk';

export interface NetworkNode {
  id: string;
  handle: string;
  platform: Platform;
  nodeType: NetworkNodeType;
  sentiment: Sentiment;
  intent: UserIntent;
  influenceScore: number;
  engagementScore: number;
  botLikelihood: number;
  maliciousRisk: number;
  coordinationRisk: number;
  healthContribution: number;
  profileMaturity: number;
  recentCommentSnippets: string[];
  connectedToPrimary: boolean;
  clusterId?: string;
  ring: 0 | 1 | 2 | 3;
}

export interface NetworkEdge {
  source: string;
  target: string;
  interactionDensity: number;
  isInferred: boolean;
}

export interface AccountHealthScore {
  score: number;
  status: 'Stable' | 'Watch' | 'At Risk' | 'Under Pressure';
  ratios: {
    positiveSupporter: number;
    neutralAudience: number;
    criticalPressure: number;
    suspiciousActivity: number;
    coordinatedRisk: number;
  };
  metrics: {
    engagementAuthenticity: number;
    narrativeStability: number;
    communityResilience: number;
  };
}

export interface NarrativePressure {
  dominantPositive: string;
  dominantNegative: string;
  emergingCriticism: string;
  topDiscussionTrigger: string;
  recommendation: string;
}

export interface ReviewFlag {
  id: string;
  handle: string;
  riskReason: string;
  botLikelihood: number;
  coordinationRisk: number;
  lastActivity: string;
  nodeId: string;
}

export interface CommentIntentDistribution {
  intent: UserIntent;
  percentage: number;
  count: number;
}

export interface ScrapedPost {
  id: string;
  url: string;
  timestamp: string;
  publishedAt: string;
  caption: string;
  summary: string;
  commentCount: number;
  likeCount: number;
  uniqueCommenters: number;
  dominantSentiment: Sentiment;
  sentimentSplit: { positive: number, neutral: number, negative: number };
  dominantNarratives: string[];
  narratives: string[];
  suspiciousAccountCount: number;
  engagementQuality: number;
  platform: Platform;
}

export interface ScrapedComment {
  id: string;
  postId: string;
  authorHandle: string;
  text: string;
  timestamp: string;
  sentiment: Sentiment;
  intent: UserIntent;
  riskFlag: boolean;
  suspiciousSignals: string[];
  replyToCommentId?: string;
}

export type NarrativePressureType = 'Positive Reinforcement' | 'Neutral/Informational' | 'Constructive Criticism' | 'Attack/Defamation' | 'Skeptical' | 'Malicious Falsehood' | 'Hostile Alignment';

export interface ExtractedNarrative {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  sentiment: Sentiment;
  confidence: number;
  commentCount: number;
  reachEstimate: number;
  pressureType: NarrativePressureType;
  sourcePostId?: string;
  supportingComments?: string[];
}

export interface WebEvidenceHit {
  id: string;
  narrativeId: string;
  originPostId: string;
  sourceType: 'portal' | 'news' | 'blog' | 'forum' | 'aggregator';
  sourceName: string;
  sourceDomain: string;
  title: string;
  excerpt: string;
  url: string;
  publishedAt: string;
  sentiment: Sentiment;
  relevanceScore: number;
  pressureType: NarrativePressureType;
  riskMarker?: string;
}

export type TaskStatus = 'waiting' | 'running' | 'completed' | 'warning' | 'failed';

export interface ParallelTask {
  id: string;
  label: string;
  status: TaskStatus;
  progress: number;
  recordsCount: number;
  startedAt?: string;
  elapsedTime?: string;
  lastEvent?: string;
  error?: string;
}

export type ActionStatus = 'queued' | 'awaiting_prerequisite' | 'ready' | 'dispatched' | 'completed' | 'failed' | 'intervention_needed';

export interface SupervisedAction {
  id: string;
  type: 'response' | 'moderation' | 'alert' | 'archival';
  label: string;
  status: ActionStatus;
  priority: Severity;
  operatorId?: string;
  responderGroupId?: string;
  narrativeId?: string;
  sourcePostId?: string;
  timestamp: string;
  prerequisites: string[];
  logs: { timestamp: string; event: string }[];
}

export interface ImportedProfileRow {
  username: string;
  full_name: string;
  profile_pic_url?: string;
  is_private: boolean;
  is_verified: boolean;
  follower_count?: number;
  is_new?: boolean;
  latest_reel_media_utc: number | string | null;
  duplicate_flag: boolean;
  cluster_assignment?: string;
}

export interface ImportedCommentRow {
  id: string;
  ownerUsername: string;
  ownerProfilePicUrl?: string;
  text: string;
  timestamp: string;
  postUrl: string;
}

export interface DemoScheduledAction {
  id: string;
  approvedResponse: string;
  assignedProfile: string;
  targetPostUrl: string;
  status: 'scheduled' | 'running' | 'completed';
  approvedAt: string;
  scheduledCompletionAt: string;
  countdownMinutes: number;
}

export interface DemoCompletedAction {
  id: string;
  profile: string;
  actionType: 'response';
  text: string;
  targetPost: string;
  approvedAt: string;
  completedAt: string;
  status: 'completed';
}

export interface AnalysisSession {
  id: string;
  clientId: string;
  primaryProfileUrl: string;
  accountHandle?: string;
  platform: Platform;
  scrapeMode: 'latest_n' | 'manual_urls' | 'specific_entries';
  postCount?: number;
  postUrls?: string[];
  sources: {
    posts: boolean;
    comments: boolean;
    mentions: boolean;
    portals: boolean;
    forums: boolean;
  };
  status: 'initializing' | 'active' | 'completed' | 'paused' | 'failed' | 'idle';
  currentStage: AnalysisStageType;
  progress: number;
  createdAt: string;
  updatedAt: string;
  parallelTasks: ParallelTask[];
  actionQueue: SupervisedAction[];
  scrapedPosts: ScrapedPost[];
  scrapedComments: ScrapedComment[];
  extractedNarratives: ExtractedNarrative[];
  webEvidence: WebEvidenceHit[];
  narratives: Narrative[];
  networkNodes: NetworkNode[];
  networkEdges: NetworkEdge[];
  accountHealth: AccountHealthScore;
  reviewQueue: ReviewFlag[];
  reportMetrics: ReportMetrics;
  responsePlan: ResponsePlan;
  approvals: ApprovalItem[];
  supervision: SupervisionState;
  events: LiveActionEvent[];
  isDemo?: boolean;
  rawProfileRows?: ImportedProfileRow[];
  rawCommentRows?: ImportedCommentRow[];
  demoScheduledActions?: DemoScheduledAction[];
  demoCompletedActions?: DemoCompletedAction[];
}

export interface ReportMetrics {
  totalPostsAnalyzed: number;
  totalCommentsCollected: number;
  totalUniqueCommentersMapped: number;
  sentimentDistribution: { positive: number, neutral: number, negative: number };
  dominantNarratives: string[];
  accountHealthScore: number;
  suspiciousReviewCount: number;
  narrativeStability: number;
  engagementAuthenticity: number;
  reportReadiness: number;
}

export interface ResponsePlan {
  suggestions: ContentSuggestion[];
}

export interface SupervisionState {
  actionQueue: LiveActionEvent[];
  completedActions: LiveActionEvent[];
  failedActions: LiveActionEvent[];
  alerts: LiveActionEvent[];
  responderGroupHealth: { [groupId: string]: number };
}

export interface SourceRun {
  id: string;
  sessionId: string;
  source: Platform;
  status: 'waiting' | 'running' | 'completed' | 'warning' | 'failed';
  progress: number;
  recordsCollected: number;
  startTime: string;
  lastSync: string;
  errors?: string[];
}

export interface ResponderGroup {
  id: string;
  name: string;
  type: 'PR Rapid Response' | 'Regional Moderators' | 'Ambassador Program Pool' | 'Community Response Team' | 'Authorized Brand Support' | 'Approved Responder Groups';
  operator: string;
  accountCount: number;
  status: 'ready' | 'active' | 'standby';
  approvalState: 'pending' | 'approved' | 'restricted';
  capacity: number;
  activeCount: number;
  region: string;
}

export interface LiveActionEvent {
  id: string;
  timestamp: string;
  type: 'collection' | 'analysis' | 'approval' | 'response' | 'alert';
  message: string;
  severity: Severity;
  metadata?: any;
}

export interface IntakeRequest {
  url: string;
  handle: string;
  source: Platform;
  mode: 'latest_n' | 'manual_urls';
  count: number;
  urls: string;
}

export interface Narrative {
  id: string;
  clientId: string;
  title: string;
  description: string;
  sentiment: Sentiment;
  reach: number;
  mentions: number;
  sources: Platform[];
  trend: 'up' | 'down' | 'stable';
  signals: NarrativeSignal[];
  evidenceSnippets: string[];
}

export interface NarrativeSignal {
  id: string;
  timestamp: string;
  platform: Platform;
  strength: number;
  volatility: number;
}

export interface Report {
  id: string;
  clientId: string;
  name: string;
  status: 'draft' | 'ready' | 'reviewed' | 'exported' | 'published';
  updatedAt: string;
  date: string;
  type: 'Monthly' | 'Crisis' | 'Campaign' | 'Ad-hoc';
  clientName: string;
}

export interface ContentSuggestion {
  id: string;
  clientId: string;
  campaignId: string;
  type: 'Engagement Support' | 'Discussion Starter' | 'Reply Suggestion' | 'Risk Flag';
  content: string;
  goal: string;
  tone: string;
  platform: Platform;
  risk: Severity;
  status: ApprovalStatus;
  strategistNotes: string;
  reviewedBy?: string;
}

export interface ApprovalItem {
  id: string;
  clientId: string;
  type: 'content' | 'narrative' | 'report' | 'execution' | 'suggested_reply' | 'campaign_plan';
  title: string;
  summary: string;
  priority: Severity;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  submittedBy: string;
  associatedId: string;
  author: string;
  date: string;
}

export interface ExecutionRun {
  id: string;
  clientId: string;
  campaignId: string;
  name: string;
  status: 'scheduled' | 'active' | 'paused' | 'completed' | 'intervention-needed';
  progress: number;
  startTime: string;
  endTime?: string;
  owner: string;
  healthScore: number;
}

export interface ConversationThread {
  id: string;
  clientId: string;
  platform: Platform;
  author: string;
  content: string;
  timestamp: string;
  sentiment: Sentiment;
  status: 'unresolved' | 'assigned' | 'reviewed';
  narrativeTag?: string;
  recommendedResponse?: string;
  escalationFlag: boolean;
  replies: { author: string, content: string, timestamp: string }[];
}

export interface Alert {
  id: string;
  clientId: string;
  type: 'narrative_spike' | 'negative_sentiment' | 'ingestion_error' | 'execution_block' | 'security_risk';
  message: string;
  severity: Severity;
  timestamp: string;
  resolved: boolean;
  relatedId?: string;
}

export interface ActivityEvent {
  id: string;
  clientId: string;
  type: string;
  user: string;
  timestamp: string;
  description: string;
  metadata?: any;
}

export interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'active';
  lastSync: string;
  type: string;
}

export interface UserRole {
  id: string;
  name: string;
  role: 'admin' | 'strategist' | 'reviewer' | 'viewer';
  avatar: string;
}
