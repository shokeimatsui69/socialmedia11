import { create } from 'zustand';
import { 
  Client, Campaign, IngestionJob, AudienceCluster, Narrative, 
  Report, ContentSuggestion, ApprovalItem, ExecutionRun, 
  ConversationThread, Alert, ActivityEvent, Integration,
  NetworkNode, NetworkEdge, AccountHealthScore, NarrativePressure,
  ReviewFlag, AnalysisSession, ResponderGroup, LiveActionEvent, 
  SourceRun, IntakeRequest, AnalysisStageType, CommentIntentDistribution,
  ParallelTask, WebEvidenceHit, ExtractedNarrative, DemoScheduledAction, DemoCompletedAction,
  UserIntent
} from '../types';
import * as initialData from '../data/mockData';
import { demoProfiles, demoComments } from '../data/demoData';
import { 
  JAKSIC_PROFILES, JAKSIC_COMMENTS, JAKSIC_NARRATIVES, 
  JAKSIC_CONVERSATIONS, JAKSIC_DEMO_SAFE_RESPONSES 
} from '../data/jaksicDemoData';

interface AppState {
  isSidebarOpen: boolean;
  activeClientId: string;
  theme: 'dark' | 'light';
  
  // Data State
  clients: Client[];
  campaigns: Campaign[];
  ingestionJobs: IngestionJob[];
  audienceClusters: AudienceCluster[];
  narratives: Narrative[];
  reports: Report[];
  contentSuggestions: ContentSuggestion[];
  approvalItems: ApprovalItem[];
  executionRuns: ExecutionRun[];
  conversations: ConversationThread[];
  alerts: Alert[];
  activityEvents: ActivityEvent[];
  integrations: Integration[];
  userRole: string;

  // Network Intelligence State
  networkNodes: NetworkNode[];
  networkEdges: NetworkEdge[];
  accountHealth: AccountHealthScore;
  narrativePressure: NarrativePressure;
  reviewQueue: ReviewFlag[];
  intentDistribution: CommentIntentDistribution[];
  webEvidence: WebEvidenceHit[];
  extractedNarratives: ExtractedNarrative[];

  // Live Operations State
  activeSession: AnalysisSession | null;
  sessions: AnalysisSession[];
  responderGroups: ResponderGroup[];
  liveEvents: LiveActionEvent[];
  sourceRuns: SourceRun[];

  activeOpsTab: 'overview' | 'terminal' | 'intelligence' | 'planning' | 'supervisor';
  unlockedOpsTabs: ('overview' | 'terminal' | 'intelligence' | 'planning' | 'supervisor')[];
  autoOpsSwitchEnabled: boolean;

  // Actions
  toggleSidebar: () => void;
  setActiveClient: (clientId: string) => void;
  startAnalysis: (request: IntakeRequest) => void;
  startDemoSession: (request: IntakeRequest) => void;
  approveDemoAction: (suggestionId: string) => void;
  tickSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
  hydrateSessionData: (sessionId: string) => void;
  resetToMockData: () => void;
  setOpsTab: (tab: 'overview' | 'terminal' | 'intelligence' | 'planning' | 'supervisor') => void;
  toggleAutoOpsSwitch: () => void;
  addLiveEvent: (event: Omit<LiveActionEvent, 'id'>) => void;
  
  // Exports
  exportReport: (reportId: string) => void;
  exportMetrics: () => void;
  exportReviewFlags: () => void;
  exportSessionBundle: (sessionId: string) => void;
  
  // Mutations
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  resolveAlert: (alertId: string) => void;
  addActivityEvent: (event: Omit<ActivityEvent, 'id'>) => void;
  updateApprovalStatus: (itemId: string, status: 'approved' | 'rejected') => void;
  updateSuggestionStatus: (suggestionId: string, status: any) => void;
  updateJobStatus: (jobId: string, status: any) => void;
  updateExecutionStatus: (executionId: string, status: any) => void;
  addContentSuggestion: (suggestion: Omit<ContentSuggestion, 'id'>) => void;
  mockDownload: (fileName: string, data: any) => void;
}

export const useStore = create<AppState>((set, get) => ({
  isSidebarOpen: true,
  activeClientId: '1',
  theme: 'dark',
  userRole: 'Admin Control',

  // Initial Data
  clients: initialData.mockClients,
  campaigns: initialData.mockCampaigns,
  ingestionJobs: initialData.mockIngestionJobs,
  audienceClusters: initialData.mockAudienceClusters,
  narratives: initialData.mockNarratives,
  reports: initialData.mockReports,
  contentSuggestions: initialData.mockContentSuggestions,
  approvalItems: initialData.mockApprovalItems,
  executionRuns: initialData.mockExecutionRuns,
  conversations: initialData.mockConversations,
  alerts: initialData.mockAlerts,
  activityEvents: initialData.mockActivityEvents,
  integrations: initialData.mockIntegrations,

  // Network Intelligence Initial Data
  networkNodes: initialData.mockNetworkNodes,
  networkEdges: initialData.mockNetworkEdges,
  accountHealth: initialData.mockAccountHealth,
  narrativePressure: initialData.mockNarrativePressure,
  reviewQueue: initialData.mockReviewQueue,
  intentDistribution: [],
  webEvidence: initialData.mockWebEvidenceHits,
  extractedNarratives: initialData.mockExtractedNarratives,

  // Live Operations Initial Data
  activeOpsTab: 'overview',
  unlockedOpsTabs: ['overview'],
  autoOpsSwitchEnabled: true,

  activeSession: {
    id: 'jaksic_official_demo',
    clientId: '1',
    primaryProfileUrl: 'https://www.instagram.com/jaksic.official/',
    accountHandle: 'jaksic.official',
    platform: 'instagram',
    scrapeMode: 'specific_entries',
    postCount: 3,
    postUrls: [
      'https://www.instagram.com/p/DRpmfFqiHeE/',
      'https://www.instagram.com/p/DHMA3r-omu9/',
      'https://www.instagram.com/p/DHELu5KIUlc/'
    ],
    sources: { posts: true, comments: true, mentions: true, portals: true, forums: true },
    status: 'idle',
    currentStage: 'validating_inputs',
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
    isPrimaryDemo: true,
    parallelTasks: [],
    actionQueue: [],
    scrapedPosts: [],
    scrapedComments: [],
    extractedNarratives: [],
    webEvidence: [],
    narratives: [],
    networkNodes: [],
    networkEdges: [],
    accountHealth: { score: 100, status: 'Stable', ratios: { positiveSupporter: 0, neutralAudience: 0, criticalPressure: 0, suspiciousActivity: 0, coordinatedRisk: 0 }, metrics: { engagementAuthenticity: 0, narrativeStability: 0, communityResilience: 0 } },
    reviewQueue: [],
    reportMetrics: { totalPostsAnalyzed: 0, totalCommentsCollected: 0, totalUniqueCommentersMapped: 0, sentimentDistribution: { positive: 0, neutral: 0, negative: 0 }, dominantNarratives: [], accountHealthScore: 100, suspiciousReviewCount: 0, narrativeStability: 100, engagementAuthenticity: 100, reportReadiness: 0 },
    responsePlan: { suggestions: [] },
    approvals: [],
    supervision: { actionQueue: [], completedActions: [], failedActions: [], alerts: [], responderGroupHealth: {} },
    events: [],
    demoScheduledActions: [],
    demoCompletedActions: [],
  },
  sessions: [
    {
      id: 'jaksic_official_demo',
      clientId: '1',
      primaryProfileUrl: 'https://www.instagram.com/jaksic.official/',
      accountHandle: 'jaksic.official',
      platform: 'instagram',
      scrapeMode: 'specific_entries',
      postCount: 3,
      postUrls: [
        'https://www.instagram.com/p/DRpmfFqiHeE/',
        'https://www.instagram.com/p/DHMA3r-omu9/',
        'https://www.instagram.com/p/DHELu5KIUlc/'
      ],
      sources: { posts: true, comments: true, mentions: true, portals: true, forums: true },
      status: 'idle',
      currentStage: 'validating_inputs',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
      isPrimaryDemo: true,
      parallelTasks: [],
      actionQueue: [],
      scrapedPosts: [],
      scrapedComments: [],
      extractedNarratives: [],
      webEvidence: [],
      narratives: [],
      networkNodes: [],
      networkEdges: [],
      accountHealth: { score: 100, status: 'Stable', ratios: { positiveSupporter: 0, neutralAudience: 0, criticalPressure: 0, suspiciousActivity: 0, coordinatedRisk: 0 }, metrics: { engagementAuthenticity: 0, narrativeStability: 0, communityResilience: 0 } },
      reviewQueue: [],
      reportMetrics: { totalPostsAnalyzed: 0, totalCommentsCollected: 0, totalUniqueCommentersMapped: 0, sentimentDistribution: { positive: 0, neutral: 0, negative: 0 }, dominantNarratives: [], accountHealthScore: 100, suspiciousReviewCount: 0, narrativeStability: 100, engagementAuthenticity: 100, reportReadiness: 0 },
      responsePlan: { suggestions: [] },
      approvals: [],
      supervision: { actionQueue: [], completedActions: [], failedActions: [], alerts: [], responderGroupHealth: {} },
      events: [],
      demoScheduledActions: [],
      demoCompletedActions: [],
    },
    {
      id: 'koi_log_demo',
      clientId: '1',
      primaryProfileUrl: 'https://www.instagram.com/koi__log/',
      accountHandle: 'koi__log',
      platform: 'instagram',
      scrapeMode: 'latest_n',
      postCount: 5,
      sources: { posts: true, comments: true, mentions: true, portals: true, forums: true },
      status: 'idle',
      currentStage: 'validating_inputs',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
      parallelTasks: [],
      actionQueue: [],
      scrapedPosts: [],
      scrapedComments: [],
      extractedNarratives: [],
      webEvidence: [],
      narratives: [],
      networkNodes: [],
      networkEdges: [],
      accountHealth: { score: 100, status: 'Stable', ratios: { positiveSupporter: 0, neutralAudience: 0, criticalPressure: 0, suspiciousActivity: 0, coordinatedRisk: 0 }, metrics: { engagementAuthenticity: 0, narrativeStability: 0, communityResilience: 0 } },
      reviewQueue: [],
      reportMetrics: { totalPostsAnalyzed: 0, totalCommentsCollected: 0, totalUniqueCommentersMapped: 0, sentimentDistribution: { positive: 0, neutral: 0, negative: 0 }, dominantNarratives: [], accountHealthScore: 100, suspiciousReviewCount: 0, narrativeStability: 100, engagementAuthenticity: 100, reportReadiness: 0 },
      responsePlan: { suggestions: [] },
      approvals: [],
      supervision: { actionQueue: [], completedActions: [], failedActions: [], alerts: [], responderGroupHealth: {} },
      events: [],
      demoScheduledActions: [],
      demoCompletedActions: [],
    },
    ...initialData.mockAnalysisSessions
  ],
  responderGroups: initialData.mockResponderGroups,
  liveEvents: initialData.mockLiveEvents,
  sourceRuns: [],

  // Exports
  exportReport: (reportId: string) => {
    const report = get().reports.find(r => r.id === reportId);
    if (report) get().mockDownload(`report-${reportId}`, report);
  },
  exportMetrics: () => {
    const metrics = {
      campaigns: get().campaigns,
      client: get().clients.find(c => c.id === get().activeClientId),
      timestamp: new Date().toISOString()
    };
    get().mockDownload('metrics-snapshot', metrics);
  },
  exportReviewFlags: () => {
    const flags = get().reviewQueue;
    get().mockDownload('review-flags', flags);
  },
  exportSessionBundle: (sessionId: string) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (session) get().mockDownload(`session-bundle-${sessionId}`, session);
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActiveClient: (clientId) => set({ activeClientId: clientId }),
  setActiveSession: (sessionId) => set((state) => {
    const session = state.sessions.find(s => s.id === sessionId);
    if (session) {
      setTimeout(() => useStore.getState().hydrateSessionData(sessionId), 0);
    }
    return { activeSession: session || null };
  }),

  hydrateSessionData: (sessionId) => set((state) => {
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return state;

    return {
      ingestionJobs: session.status === 'active' || session.status === 'completed' 
        ? [
            { 
              id: `job-${session.id}`, 
              clientId: session.clientId, 
              source: session.platform, 
              status: session.status === 'completed' ? 'completed' : 'running', 
              progress: session.progress, 
              records: session.reportMetrics.totalCommentsCollected, 
              lastSync: session.updatedAt, 
              interval: 'Real-time', 
              health: session.accountHealth.score,
              narrativeExtractionStatus: session.progress > 50 ? 'completed' : 'active'
            },
            ...initialData.mockIngestionJobs
          ]
        : initialData.mockIngestionJobs,
      narratives: session.narratives.length > 0 ? [...session.narratives, ...initialData.mockNarratives] : initialData.mockNarratives,
      networkNodes: session.networkNodes.length > 0 ? [...session.networkNodes] : initialData.mockNetworkNodes,
      networkEdges: session.networkEdges.length > 0 ? [...session.networkEdges] : initialData.mockNetworkEdges,
      webEvidence: session.webEvidence.length > 0 ? [...session.webEvidence] : initialData.mockWebEvidenceHits,
      extractedNarratives: session.extractedNarratives.length > 0 ? [...session.extractedNarratives] : initialData.mockExtractedNarratives,
      accountHealth: session.accountHealth,
      contentSuggestions: session.responsePlan.suggestions.length > 0 
        ? [...session.responsePlan.suggestions, ...initialData.mockContentSuggestions] 
        : initialData.mockContentSuggestions,
      approvalItems: session.approvals.length > 0 
        ? [...session.approvals, ...initialData.mockApprovalItems] 
        : initialData.mockApprovalItems,
      liveEvents: session.events.length > 0 ? [...session.events] : initialData.mockLiveEvents,
      alerts: session.status === 'active' && session.progress > 80 
        ? [{ id: `al-session-${session.id}`, clientId: session.clientId, type: 'narrative_spike', message: `High engagement detected on session ${session.accountHandle}`, severity: 'medium', timestamp: new Date().toISOString(), resolved: false }, ...initialData.mockAlerts]
        : initialData.mockAlerts,
      reports: (session.status === 'completed' || session.progress > 70)
        ? [{ id: `rep-${session.id}`, clientId: session.clientId, name: `Live Analysis: ${session.accountHandle}`, status: 'ready', date: new Date().toISOString().split('T')[0], type: 'Ad-hoc', clientName: initialData.mockClients.find(c => c.id === session.clientId)?.name || 'Client', updatedAt: session.updatedAt }, ...initialData.mockReports]
        : initialData.mockReports
    };
  }),

  resetToMockData: () => set({
    clients: initialData.mockClients,
    campaigns: initialData.mockCampaigns,
    ingestionJobs: initialData.mockIngestionJobs,
    audienceClusters: initialData.mockAudienceClusters,
    narratives: initialData.mockNarratives,
    reports: initialData.mockReports,
    contentSuggestions: initialData.mockContentSuggestions,
    approvalItems: initialData.mockApprovalItems,
    executionRuns: initialData.mockExecutionRuns,
    conversations: initialData.mockConversations,
    alerts: initialData.mockAlerts,
    activityEvents: initialData.mockActivityEvents,
    integrations: initialData.mockIntegrations,
    networkNodes: initialData.mockNetworkNodes,
    networkEdges: initialData.mockNetworkEdges,
    accountHealth: initialData.mockAccountHealth,
    activeSession: null
  }),

  setOpsTab: (tab) => set({ activeOpsTab: tab }),
  toggleAutoOpsSwitch: () => set((state) => ({ autoOpsSwitchEnabled: !state.autoOpsSwitchEnabled })),

  startAnalysis: (request) => set((state) => {
    if (request.handle === 'koi__log' || request.url.includes('koi__log')) {
      setTimeout(() => get().startDemoSession(request), 0);
      return state;
    }

    const sessionId = `s-${Date.now()}`;
    const parallelTasks: ParallelTask[] = [
      { id: 'task-ig-profile', label: 'Instagram Profile Scan', status: 'running', progress: 0, recordsCount: 0, startedAt: new Date().toISOString() },
      { id: 'task-ig-posts', label: 'Instagram Post Collection', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-ig-comments', label: 'Instagram Comment Collection', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-portal', label: 'Portal Scan', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-forum', label: 'Forum Scan', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-narrative', label: 'Narrative Extraction', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-evidence', label: 'Web Evidence Search', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-map', label: 'Network Map Build', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-health', label: 'Account Health Scoring', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-report', label: 'Report Assembly', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-response', label: 'Response Preparation', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-approval', label: 'Approval Gate', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-queue', label: 'Supervised Action Queue', status: 'waiting', progress: 0, recordsCount: 0 },
    ];

    const newSession: AnalysisSession = {
      id: sessionId,
      clientId: state.activeClientId,
      primaryProfileUrl: request.url,
      accountHandle: request.handle,
      platform: request.source,
      scrapeMode: request.mode,
      postCount: request.count,
      postUrls: request.urls ? request.urls.split('\n').filter(u => u.trim()) : [],
      sources: {
        posts: true,
        comments: true,
        mentions: request.source === 'tiktok' || request.source === 'instagram',
        portals: request.source === 'x' || request.source === 'news',
        forums: request.source === 'forum'
      },
      status: 'active',
      currentStage: 'validating_inputs',
      progress: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parallelTasks,
      actionQueue: [],
      scrapedPosts: [],
      scrapedComments: [],
      extractedNarratives: [],
      webEvidence: [],
      narratives: [],
      networkNodes: [],
      networkEdges: [],
      accountHealth: initialData.mockAccountHealth,
      reviewQueue: [],
      reportMetrics: {
        totalPostsAnalyzed: 0,
        totalCommentsCollected: 0,
        totalUniqueCommentersMapped: 0,
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
        dominantNarratives: [],
        accountHealthScore: 0,
        suspiciousReviewCount: 0,
        narrativeStability: 0,
        engagementAuthenticity: 0,
        reportReadiness: 0
      },
      responsePlan: { suggestions: [] },
      approvals: [],
      supervision: {
        actionQueue: [],
        completedActions: [],
        failedActions: [],
        alerts: [],
        responderGroupHealth: { 'group-01': 100, 'group-02': 95, 'group-03': 88 }
      },
      events: [
        { id: `le-${Date.now()}`, timestamp: new Date().toISOString(), type: 'collection', message: `Initializing tactical intake for ${request.handle}...`, severity: 'low' }
      ]
    };

    const newSourceRun: SourceRun = {
      id: `sr-${Date.now()}`,
      sessionId: newSession.id,
      source: request.source,
      status: 'running',
      progress: 0,
      recordsCollected: 0,
      startTime: new Date().toISOString(),
      lastSync: new Date().toISOString(),
    };

    return {
      sessions: [newSession, ...state.sessions],
      activeSession: newSession,
      sourceRuns: [newSourceRun, ...state.sourceRuns],
      liveEvents: [newSession.events[0], ...state.liveEvents]
    };
  }),

  startDemoSession: (request) => {
    const sessionId = `s-demo-${Date.now()}`;

    const parallelTasks: ParallelTask[] = [
      { id: 'task-ig-profile', label: 'Instagram Profile Scan', status: 'running', progress: 0, recordsCount: 15, startedAt: new Date().toISOString() },
      { id: 'task-ig-posts', label: 'Instagram Post Collection', status: 'waiting', progress: 0, recordsCount: 2 },
      { id: 'task-ig-comments', label: 'Instagram Comment Collection', status: 'waiting', progress: 0, recordsCount: 10 },
      { id: 'task-narrative', label: 'Narrative Extraction', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-evidence', label: 'Web Evidence Search', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-map', label: 'Network Map Build', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-report', label: 'Report Assembly', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-response', label: 'Response Preparation', status: 'waiting', progress: 0, recordsCount: 0 },
      { id: 'task-approval', label: 'Approval Gate', status: 'waiting', progress: 0, recordsCount: 0 },
    ];

    const newSession: AnalysisSession = {
      id: sessionId,
      clientId: get().activeClientId,
      primaryProfileUrl: request.url,
      accountHandle: request.handle,
      platform: 'instagram',
      scrapeMode: 'manual_urls',
      postCount: 2,
      postUrls: request.urls ? request.urls.split('\n').filter(u => u.trim()) : [],
      sources: { posts: true, comments: true, mentions: true, portals: true, forums: false },
      status: 'active',
      currentStage: 'validating_inputs',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parallelTasks,
      actionQueue: [],
      scrapedPosts: [],
      scrapedComments: [],
      extractedNarratives: [],
      webEvidence: [],
      narratives: [],
      networkNodes: [],
      networkEdges: [],
      accountHealth: { ...initialData.mockAccountHealth, score: 92 },
      reviewQueue: [],
      reportMetrics: {
        totalPostsAnalyzed: 2,
        totalCommentsCollected: demoComments.length,
        totalUniqueCommentersMapped: Array.from(new Set(demoComments.map((c: any) => c.ownerUsername))).length,
        sentimentDistribution: { positive: 85, neutral: 10, negative: 5 },
        dominantNarratives: ['Cat Personality', 'Community Warmth'],
        accountHealthScore: 92,
        suspiciousReviewCount: 0,
        narrativeStability: 95,
        engagementAuthenticity: 98,
        reportReadiness: 0
      },
      responsePlan: { suggestions: [] },
      approvals: [],
      supervision: {
        actionQueue: [],
        completedActions: [],
        failedActions: [],
        alerts: [],
        responderGroupHealth: { 'group-01': 100, 'group-02': 100, 'group-03': 100 }
      },
      events: [
        { id: `le-${Date.now()}`, timestamp: new Date().toISOString(), type: 'collection', message: `Initializing tactical demo intake for ${request.handle}...`, severity: 'low' }
      ],
      isDemo: true,
      rawProfileRows: demoProfiles,
      rawCommentRows: demoComments,
      demoScheduledActions: [],
      demoCompletedActions: []
    };

    set((state) => ({
      sessions: [newSession, ...state.sessions],
      activeSession: newSession,
      liveEvents: [newSession.events[0], ...state.liveEvents]
    }));

    const interval = setInterval(() => {
      const state = useStore.getState();
      const activeSession = state.activeSession;
      if (activeSession && activeSession.id === sessionId && activeSession.status === 'active' && activeSession.currentStage !== 'completed') {
        state.tickSession(sessionId);
      } else {
        clearInterval(interval);
      }
    }, 5000);
  },

  approveDemoAction: (suggestionId) => set((state) => {
    const session = state.activeSession;
    if (!session || !session.isDemo) return state;

    // Find in session suggestions or global suggestions
    const suggestion = session.responsePlan.suggestions.find(s => s.id === suggestionId) ||
                       state.contentSuggestions.find(s => s.id === suggestionId);

    if (!suggestion) return state;

    const isKorean = suggestion.content === '가자미는 고양이와 어떤 관련이 있습니까?';
    const actor = isKorean ? '@stellajoannaja' : '@ambassador_01';
    
    const approvedAt = new Date().toISOString();
    // 5 mins for Korean, 1 min for others in demo
    const durationMs = isKorean ? 5 * 60000 : 1 * 60000;
    const scheduledCompletionAt = new Date(Date.now() + durationMs).toISOString();

    const scheduledAction: DemoScheduledAction = {
      id: `demo-sch-${Date.now()}`,
      approvedResponse: suggestion.content,
      assignedProfile: actor,
      targetPostUrl: session.postUrls?.[0] || session.primaryProfileUrl,
      status: 'scheduled',
      approvedAt: approvedAt,
      scheduledCompletionAt: scheduledCompletionAt,
      countdownMinutes: isKorean ? 5 : 1
    };

    const newEvent: LiveActionEvent = {
      id: `le-sch-${Date.now()}`,
      timestamp: approvedAt,
      type: 'approval',
      message: `ACTION APPROVED: [${actor}] scheduled to respond on ${scheduledAction.targetPostUrl}`,
      severity: 'medium'
    };

    // Update session: move from suggestions to scheduled
    const updatedSession = {
      ...session,
      demoScheduledActions: [...(session.demoScheduledActions || []), scheduledAction],
      approvals: session.approvals.filter(a => a.associatedId !== suggestionId),
      responsePlan: {
        suggestions: session.responsePlan.suggestions.map(s => 
          s.id === suggestionId ? { ...s, status: 'approved' as any } : s
        )
      },
      events: [newEvent, ...session.events]
    };

    // Auto-switch to supervisor if enabled
    const targetTab = 'supervisor';
    const newUnlocked = state.unlockedOpsTabs.includes(targetTab) 
      ? state.unlockedOpsTabs 
      : [...state.unlockedOpsTabs, targetTab as any];

    return {
      sessions: state.sessions.map(s => s.id === session.id ? updatedSession : s),
      activeSession: updatedSession,
      liveEvents: [newEvent, ...state.liveEvents].slice(0, 50),
      unlockedOpsTabs: newUnlocked,
      activeOpsTab: state.autoOpsSwitchEnabled ? targetTab : state.activeOpsTab
    };
  }),

  tickSession: (sessionId) => set((state) => {
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session || session.status !== 'active') return state;

    // --- Persistency Ticker for Demo Actions (Calculated from timestamp) ---
    const stages: AnalysisStageType[] = [
      'validating_inputs', 'collecting_posts', 'collecting_comments', 'collecting_mentions',
      'scanning_portals', 'scanning_forums', 'extracting_narratives', 'building_network_map',
      'scoring_account_health', 'flagging_review_items', 'assembling_report', 'ready_for_review',
      'planning_responses', 'awaiting_approval', 'supervising', 'completed'
    ];

    const currentIndex = stages.indexOf(session.currentStage);
    let nextStage: AnalysisStageType = session.currentStage;
    let nextProgress = session.progress + (session.isDemo ? 10 : 5);
    let nextStatus: AnalysisSession['status'] = session.status;

    if (nextProgress >= (currentIndex + 1) * (100 / (stages.length - 1))) {
      if (currentIndex < stages.length - 1) {
        nextStage = stages[currentIndex + 1];
        // Demo shortcuts
        if (session.isDemo) {
          if (nextStage === 'scanning_forums') nextStage = 'extracting_narratives';
          if (nextStage === 'collecting_mentions') nextStage = 'scanning_portals';
        }
      } else {
        nextStatus = 'completed';
      }
    }

    if (nextProgress >= 100) {
      nextProgress = 100;
      nextStatus = 'completed';
      nextStage = 'completed';
    }

    let updatedSession = { ...session, currentStage: nextStage, progress: nextProgress, status: nextStatus, updatedAt: new Date().toISOString() };

    // --- Demo Countdown Logic (Persistent) ---
    if (session.isDemo && session.demoScheduledActions?.length) {
      const now = Date.now();
      const stillScheduled: DemoScheduledAction[] = [];
      const newlyCompleted: DemoCompletedAction[] = [];

      session.demoScheduledActions.forEach(action => {
        const completionTime = new Date(action.scheduledCompletionAt).getTime();
        if (now >= completionTime) {
          const completed: DemoCompletedAction = {
            id: `comp-${action.id}`,
            profile: action.assignedProfile,
            actionType: 'response',
            text: action.approvedResponse,
            targetPost: action.targetPostUrl,
            approvedAt: action.approvedAt,
            completedAt: new Date().toISOString(),
            status: 'completed'
          };
          newlyCompleted.push(completed);
          updatedSession.events = [
            { id: `le-comp-${Date.now()}`, timestamp: completed.completedAt, type: 'response', message: `ACTION COMPLETED: ${completed.profile} successfully posted response.`, severity: 'low' },
            ...updatedSession.events
          ];
        } else {
          const diffMs = completionTime - now;
          stillScheduled.push({ ...action, countdownMinutes: Math.ceil(diffMs / 60000) });
        }
      });

      if (newlyCompleted.length > 0 || stillScheduled.length !== session.demoScheduledActions.length) {
        updatedSession.demoScheduledActions = stillScheduled;
        updatedSession.demoCompletedActions = [...(session.demoCompletedActions || []), ...newlyCompleted];
      }
    }

    // --- Tab Orchestration Logic ---
    const stageToTab = (stage: AnalysisStageType): AppState['activeOpsTab'] => {
      if (stage.includes('collecting') || stage.includes('scanning') || stage === 'validating_inputs') return 'terminal';
      if (stage.includes('narrative') || stage === 'building_network_map' || stage === 'scoring_account_health') return 'intelligence';
      if (stage === 'planning_responses' || stage === 'awaiting_approval' || stage.includes('report') || stage === 'ready_for_review') return 'planning';
      if (stage === 'supervising' || stage === 'completed') return 'supervisor';
      return 'overview';
    };

    const targetTab = stageToTab(nextStage);
    const hasNewTab = !state.unlockedOpsTabs.includes(targetTab);
    const newUnlocked = hasNewTab ? [...state.unlockedOpsTabs, targetTab] : state.unlockedOpsTabs;
    const newActiveTab = state.autoOpsSwitchEnabled && targetTab !== state.activeOpsTab ? targetTab : state.activeOpsTab;

    if (hasNewTab) {
      updatedSession.events = [
        { id: `le-unlock-${Date.now()}`, timestamp: new Date().toISOString(), type: 'analysis', message: `TAB UNLOCKED: ${targetTab.toUpperCase()}_VIEW is now accessible.`, severity: 'medium' },
        ...updatedSession.events
      ];
    }

    // --- Demo Data Population ---
    if (session.isDemo) {
      const isJaksic = session.id === 'jaksic_official_demo' || session.accountHandle === 'jaksic.official';

      if (nextStage === 'validating_inputs' && (!updatedSession.rawProfileRows || updatedSession.rawProfileRows.length === 0)) {
        updatedSession.rawProfileRows = isJaksic ? JAKSIC_PROFILES : [];
        updatedSession.events = [
          { id: `le-val-${Date.now()}`, timestamp: new Date().toISOString(), type: 'system', message: `Account ${session.accountHandle} verified and ready for seed hydration.`, severity: 'low' },
          ...updatedSession.events
        ];
      }

      if (nextStage === 'collecting_posts' && updatedSession.scrapedPosts.length === 0) {
        if (isJaksic) {
          updatedSession.scrapedPosts = [
            { 
              id: 'DRpmfFqiHeE', platform: 'instagram', url: 'https://www.instagram.com/p/DRpmfFqiHeE/', publishedAt: '2024-04-20T10:00:00Z', timestamp: '2024-04-20T10:00:00Z',
              caption: 'Strateški razgovor o regionalnoj stabilnosti.', 
              summary: 'Key diplomatic post with high engagement volume.',
              likeCount: 45200, commentCount: 1240, uniqueCommenters: 850, dominantSentiment: 'neutral', engagementQuality: 88,
              sentimentSplit: { positive: 40, neutral: 45, negative: 15 },
              dominantNarratives: ['Leadership Discussion', 'Regional Stability'], narratives: ['Leadership Discussion', 'Regional Stability'],
              suspiciousAccountCount: 12
            },
            { 
              id: 'DHMA3r-omu9', platform: 'instagram', url: 'https://www.instagram.com/p/DHMA3r-omu9/', publishedAt: '2024-04-21T14:30:00Z', timestamp: '2024-04-21T14:30:00Z',
              caption: 'Digitalna transformacija i budućnost ekonomije.', 
              summary: 'Economic policy announcement.',
              likeCount: 32100, commentCount: 840, uniqueCommenters: 620, dominantSentiment: 'positive', engagementQuality: 92,
              sentimentSplit: { positive: 60, neutral: 30, negative: 10 },
              dominantNarratives: ['Economic Growth', 'Modernization'], narratives: ['Economic Growth', 'Modernization'],
              suspiciousAccountCount: 5
            },
            { 
              id: 'DHELu5KIUlc', platform: 'instagram', url: 'https://www.instagram.com/p/DHELu5KIUlc/', publishedAt: '2024-04-22T09:15:00Z', timestamp: '2024-04-22T09:15:00Z',
              caption: 'Izveštaj o rezultatima rada u prethodnom kvartalu.', 
              summary: 'Quarterly results report.',
              likeCount: 28400, commentCount: 520, uniqueCommenters: 410, dominantSentiment: 'neutral', engagementQuality: 85,
              sentimentSplit: { positive: 35, neutral: 50, negative: 15 },
              dominantNarratives: ['Public Support', 'Criticism / Friction'], narratives: ['Public Support', 'Criticism / Friction'],
              suspiciousAccountCount: 8
            }
          ];
          updatedSession.reportMetrics.totalPostsAnalyzed = 3;
          updatedSession.reportMetrics.totalUniqueCommentersMapped = 1880;
        } else {
          updatedSession.scrapedPosts = [
            { 
              id: `post-demo-1-${session.id}`, platform: 'instagram', url: 'https://www.instagram.com/p/DXbdSTgAJuF/', publishedAt: '2024-04-20T10:00:00Z', timestamp: '2024-04-20T10:00:00Z',
              caption: 'Sunshine and whiskers. #koi_log #catlife', 
              summary: 'Highly aesthetic lifestyle post for koi__log.',
              likeCount: 15400, commentCount: 342, uniqueCommenters: 280, dominantSentiment: 'positive', engagementQuality: 98,
              sentimentSplit: { positive: 90, neutral: 8, negative: 2 },
              dominantNarratives: ['Cat Personality', 'Aesthetic Warmth'], narratives: ['Cat Personality', 'Aesthetic Warmth'],
              suspiciousAccountCount: 0
            },
            { 
              id: `post-demo-2-${session.id}`, platform: 'instagram', url: 'https://www.instagram.com/p/DV0jaK5j3JL/', publishedAt: '2024-04-21T14:30:00Z', timestamp: '2024-04-21T14:30:00Z',
              caption: 'Wait for the jump... #playfulcat', 
              summary: 'Action sequence featuring playful jumping behavior.',
              likeCount: 12900, commentCount: 156, uniqueCommenters: 120, dominantSentiment: 'positive', engagementQuality: 96,
              sentimentSplit: { positive: 92, neutral: 6, negative: 2 },
              dominantNarratives: ['Playful Curiosity', 'Friendship'], narratives: ['Playful Curiosity', 'Friendship'],
              suspiciousAccountCount: 0
            }
          ];
          updatedSession.reportMetrics.totalPostsAnalyzed = 2;
          updatedSession.reportMetrics.totalUniqueCommentersMapped = 400;
        }
        updatedSession.events = [{ id: `le-${Date.now()}`, timestamp: new Date().toISOString(), type: 'collection', message: `${updatedSession.scrapedPosts.length} primary posts indexed for ${session.accountHandle}.`, severity: 'low' }, ...updatedSession.events];
      }

      if (nextStage === 'collecting_comments' && updatedSession.scrapedComments.length === 0) {
        if (isJaksic) {
          updatedSession.scrapedComments = JAKSIC_COMMENTS.map((c, i) => ({
            id: `sc-j-${i}`,
            postId: c.postUrl.split('/').filter(Boolean).pop() || '',
            authorHandle: `@${c.ownerUsername}`,
            text: c.text,
            timestamp: c.timestamp,
            sentiment: i % 3 === 0 ? 'positive' : i % 3 === 1 ? 'neutral' : 'negative',
            intent: i % 3 === 0 ? 'Supportive' : i % 3 === 1 ? 'Neutral' : 'Critical',
            riskFlag: c.text.includes('jebo') || c.text.includes('Mrs'),
            suspiciousSignals: []
          }));
          updatedSession.reportMetrics.totalCommentsCollected = updatedSession.scrapedComments.length;
          updatedSession.reportMetrics.sentimentDistribution = { positive: 45, neutral: 40, negative: 15 };
        } else {
          updatedSession.scrapedComments = updatedSession.rawCommentRows?.map((c, i) => ({
            id: `sc-demo-${i}-${session.id}`,
            postId: c.postUrl.includes('DXbdST') ? updatedSession.scrapedPosts[0].id : updatedSession.scrapedPosts[1].id,
            authorHandle: `@${c.ownerUsername}`,
            text: c.text,
            timestamp: c.timestamp,
            sentiment: 'positive',
            intent: 'Supportive',
            riskFlag: false,
            suspiciousSignals: []
          })) || [];
          updatedSession.reportMetrics.totalCommentsCollected = updatedSession.scrapedComments.length;
          updatedSession.reportMetrics.sentimentDistribution = { positive: 90, neutral: 8, negative: 2 };
        }
        updatedSession.events = [{ id: `le-${Date.now()}`, timestamp: new Date().toISOString(), type: 'collection', message: `${updatedSession.scrapedComments.length} comments imported from seed set.`, severity: 'low' }, ...updatedSession.events];
      }

      if (nextStage === 'extracting_narratives' && updatedSession.extractedNarratives.length === 0) {
        if (isJaksic) {
          updatedSession.extractedNarratives = JAKSIC_NARRATIVES.map(n => ({
            ...n,
            commentCount: n.supportingComments.length * 10,
            reachEstimate: 500000,
            pressureType: n.sentiment === 'positive' ? 'Positive Reinforcement' : 'Hostile Alignment'
          }));
          updatedSession.reportMetrics.accountHealthScore = 82;
          updatedSession.reportMetrics.narrativeStability = 78;
          updatedSession.reportMetrics.engagementAuthenticity = 92;
        } else {
          updatedSession.extractedNarratives = [
            { id: `en-demo-1-${session.id}`, label: 'Cat Personality', description: 'Discourse highlighting the unique traits of the cat.', keywords: ['adorable', 'personality', 'character'], sentiment: 'positive', confidence: 0.98, commentCount: 65, reachEstimate: 450000, pressureType: 'Positive Reinforcement' },
            { id: `en-demo-2-${session.id}`, label: 'Community Warmth', description: 'Interactions emphasizing a supportive and loving follower base.', keywords: ['love', 'community', 'warmth'], sentiment: 'positive', confidence: 0.96, commentCount: 42, reachEstimate: 320000, pressureType: 'Positive Reinforcement' },
            { id: `en-demo-3-${session.id}`, label: 'Playful Curiosity', description: 'Curiosity-driven comments about the cat’s habits and toys.', keywords: ['playful', 'curious', 'toy', 'jump'], sentiment: 'positive', confidence: 0.94, commentCount: 30, reachEstimate: 150000, pressureType: 'Constructive Criticism' },
          ];
          updatedSession.reportMetrics.accountHealthScore = 96;
          updatedSession.reportMetrics.narrativeStability = 94;
          updatedSession.reportMetrics.engagementAuthenticity = 98;
        }
        updatedSession.narratives = updatedSession.extractedNarratives.map(en => ({
          id: en.id,
          clientId: session.clientId,
          title: en.label,
          description: en.description,
          sentiment: en.sentiment,
          reach: (en as any).reachEstimate || 100000,
          mentions: (en as any).commentCount || 10,
          sources: [session.platform],
          trend: 'up',
          signals: [],
          evidenceSnippets: [`Validated through ${session.accountHandle} audience seed sync.`]
        }));
        updatedSession.reportMetrics.dominantNarratives = updatedSession.extractedNarratives.map(n => n.label);
        updatedSession.events = [{ id: `le-${Date.now()}`, timestamp: new Date().toISOString(), type: 'analysis', message: `Narrative matrix constructed from ${isJaksic ? 'public figure' : 'pet-sector'} data.`, severity: 'medium' }, ...updatedSession.events];
      }

      if (nextStage === 'building_network_map' && updatedSession.networkNodes.length === 0) {
        if (isJaksic) {
          const mainNode: NetworkNode = { id: `node-primary-${session.id}`, handle: session.accountHandle || 'jaksic.official', platform: 'instagram', nodeType: 'primary_account', sentiment: 'neutral', intent: 'Neutral', influenceScore: 99, engagementScore: 98, botLikelihood: 1, maliciousRisk: 0, coordinationRisk: 0, healthContribution: 100, profileMaturity: 100, recentCommentSnippets: [], connectedToPrimary: true, ring: 0 };
          
          const profileNodes: NetworkNode[] = JAKSIC_PROFILES.map((p, i) => {
            const hasNegativeNarrative = p.cluster_assignment === 'Economic Criticism' || p.cluster_assignment === 'Hostile Escalation';
            const intent: UserIntent = p.cluster_assignment === 'Public Support' ? 'Supportive' : 
                                       p.cluster_assignment === 'Hostile Escalation' ? 'Disruptive' : 
                                       p.cluster_assignment === 'Economic Criticism' ? 'Critical' : 'Neutral';
            
            return {
              id: `node-p-${i}-${session.id}`, 
              handle: `@${p.username}`, 
              platform: 'instagram', 
              nodeType: p.cluster_assignment === 'Primary Entity' ? 'primary_account' : 'direct_commenter', 
              sentiment: hasNegativeNarrative ? 'negative' : 'positive', 
              intent, 
              influenceScore: p.follower_count ? Math.min(90, Math.floor(p.follower_count / 100)) : 30, 
              engagementScore: 65, 
              botLikelihood: p.username.includes('__') ? 40 : 2, 
              maliciousRisk: p.cluster_assignment === 'Hostile Escalation' ? 85 : 0, 
              coordinationRisk: p.duplicate_flag ? 75 : 5, 
              healthContribution: hasNegativeNarrative ? 20 : 80, 
              profileMaturity: p.is_new ? 20 : 85, 
              recentCommentSnippets: [], 
              connectedToPrimary: true, 
              ring: 1
            };
          });
          
          updatedSession.networkNodes = [mainNode, ...profileNodes.filter(n => n.nodeType !== 'primary_account')];
          updatedSession.networkEdges = profileNodes.filter(n => n.nodeType !== 'primary_account').map(pn => ({ source: pn.id, target: mainNode.id, interactionDensity: 90, isInferred: false }));
          updatedSession.reportMetrics.reportReadiness = 95;
        } else {
          const primaryNode: NetworkNode = { id: `node-primary-${session.id}`, handle: session.accountHandle || 'koi__log', platform: 'instagram', nodeType: 'primary_account', sentiment: 'positive', intent: 'Supportive', influenceScore: 99, engagementScore: 98, botLikelihood: 1, maliciousRisk: 0, coordinationRisk: 0, healthContribution: 100, profileMaturity: 100, recentCommentSnippets: [], connectedToPrimary: true, ring: 0 };
          const commenterNodes: NetworkNode[] = (updatedSession.scrapedComments || []).map((c, i) => ({
            id: `node-comm-${i}-${session.id}`, handle: c.authorHandle, platform: 'instagram', nodeType: 'direct_commenter', sentiment: 'positive', intent: 'Supportive', influenceScore: 45, engagementScore: 65, botLikelihood: 2, maliciousRisk: 0, coordinationRisk: 5, healthContribution: 80, profileMaturity: 85, recentCommentSnippets: [c.text], connectedToPrimary: true, ring: 1
          }));
          updatedSession.networkNodes = [primaryNode, ...commenterNodes];
          updatedSession.networkEdges = commenterNodes.map(cn => ({ source: cn.id, target: primaryNode.id, interactionDensity: 90, isInferred: false }));
          updatedSession.reportMetrics.reportReadiness = 100;
        }
        updatedSession.events = [{ id: `le-${Date.now()}`, timestamp: new Date().toISOString(), type: 'analysis', message: `Audience graph hydrated with ${updatedSession.networkNodes.length} nodes.`, severity: 'medium' }, ...updatedSession.events];
      }

      if (nextStage === 'planning_responses' && updatedSession.responsePlan.suggestions.length === 0) {
        let suggestions: ContentSuggestion[] = [];
        if (isJaksic) {
          suggestions = JAKSIC_DEMO_SAFE_RESPONSES.map((text, i) => ({
            id: `jsug-${i}`, clientId: session.clientId, campaignId: 'c1', type: 'Engagement Support', 
            content: text, 
            goal: 'Strategic Neutrality', tone: 'Professional', platform: session.platform, risk: 'low', status: 'pending', strategistNotes: 'Demo-safe placeholder response.' 
          }));
        } else {
          suggestions = [
            { 
              id: `sug-demo-korean`, clientId: session.clientId, campaignId: 'c1', type: 'Engagement Support', 
              content: '가자미는 고양이와 어떤 관련이 있습니까?', 
              goal: 'Playful Curiosity Response', tone: 'Strategic', platform: session.platform, risk: 'low', status: 'pending', strategistNotes: 'Deterministic protocol injection.' 
            },
            { 
              id: `sug-demo-2`, clientId: session.clientId, campaignId: 'c1', type: 'Engagement Support', 
              content: 'Thank you for following koi__log! We love our community. 🐾', 
              goal: 'Community Appreciation', tone: 'Warm', platform: session.platform, risk: 'low', status: 'pending', strategistNotes: 'Standard appreciation.' 
            }
          ];
        }
        updatedSession.responsePlan.suggestions = suggestions;
        updatedSession.approvals = suggestions.map(s => ({
          id: `app-${s.id}`, clientId: s.clientId, type: 'suggested_reply', title: `Response Suggestion`, summary: s.content, priority: 'medium', status: 'pending', submittedAt: new Date().toISOString(), submittedBy: 'System Engine', associatedId: s.id, author: 'AI Engine', date: new Date().toISOString().split('T')[0]
        }));
        updatedSession.events = [{ id: `le-${Date.now()}`, timestamp: new Date().toISOString(), type: 'analysis', message: `Deterministic suggestions generated for ${isJaksic ? 'Public Figure' : 'Pet-Sector'} protocol.`, severity: 'medium' }, ...updatedSession.events];
      }
    }

    const updatedParallelTasks = updatedSession.parallelTasks.map(task => {
      const stageIndex = stages.indexOf(nextStage);
      const taskIndex = updatedSession.parallelTasks.findIndex(t => t.id === task.id);
      if (taskIndex < stageIndex) return { ...task, status: 'completed' as any, progress: 100 };
      else if (taskIndex === stageIndex) return { ...task, status: 'running' as any, progress: Math.min(95, task.progress + (session.isDemo ? 30 : 15)), startedAt: task.startedAt || new Date().toISOString() };
      return task;
    });
    updatedSession.parallelTasks = updatedParallelTasks;

    const updatedSessions = state.sessions.map(s => s.id === sessionId ? updatedSession : s);
    if (state.activeSession?.id === sessionId) {
      setTimeout(() => get().hydrateSessionData(sessionId), 0);
    }

    return {
      sessions: updatedSessions,
      activeSession: state.activeSession?.id === sessionId ? updatedSession : state.activeSession,
      liveEvents: updatedSession.events[0] !== session.events[0] ? [updatedSession.events[0], ...state.liveEvents].slice(0, 50) : state.liveEvents,
      unlockedOpsTabs: newUnlocked as any,
      activeOpsTab: newActiveTab
    };
  }),

  addLiveEvent: (event) => set((state) => ({
    liveEvents: [{ ...event, id: `le-${Date.now()}` }, ...state.liveEvents].slice(0, 50)
  })),

  addAlert: (alert) => set((state) => ({
    alerts: [{ ...alert, id: `al-${Date.now()}` }, ...state.alerts]
  })),

  resolveAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a)
  })),

  addActivityEvent: (event) => set((state) => ({
    activityEvents: [{ ...event, id: `ev-${Date.now()}` }, ...state.activityEvents]
  })),

  updateApprovalStatus: (itemId, status) => set((state) => {
    const item = state.approvalItems.find(i => i.id === itemId);
    if (!item) return state;
    const newEvent: ActivityEvent = {
      id: `ev-${Date.now()}`,
      clientId: item.clientId,
      type: 'approval_resolved',
      user: 'Admin',
      timestamp: new Date().toISOString(),
      description: `${status.toUpperCase()}: ${item.title}`
    };
    return {
      approvalItems: state.approvalItems.map(i => i.id === itemId ? { ...i, status } : i),
      activityEvents: [newEvent, ...state.activityEvents]
    };
  }),

  updateSuggestionStatus: (suggestionId, status) => set((state) => ({
    contentSuggestions: state.contentSuggestions.map(s => s.id === suggestionId ? { ...s, status } : s)
  })),

  updateJobStatus: (jobId, status) => set((state) => ({
    ingestionJobs: state.ingestionJobs.map(j => j.id === jobId ? { ...j, status } : j)
  })),

  updateExecutionStatus: (executionId, status) => set((state) => ({
    executionRuns: state.executionRuns.map(r => r.id === executionId ? { ...r, status } : r)
  })),

  addContentSuggestion: (suggestion) => set((state) => ({
    contentSuggestions: [{ ...suggestion, id: `s-${Date.now()}` }, ...state.contentSuggestions]
  })),

  mockDownload: (fileName, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}));
