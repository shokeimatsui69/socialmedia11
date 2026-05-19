import { 
  Client, Campaign, IngestionJob, AudienceCluster, Narrative, 
  Report, ContentSuggestion, ApprovalItem, ExecutionRun, 
  ConversationThread, Alert, ActivityEvent, Integration,
  ExtractedNarrative, WebEvidenceHit, AnalysisStageType,
  NetworkNode, NetworkEdge, AccountHealthScore, NarrativePressure,
  ReviewFlag, AnalysisSession, ResponderGroup, LiveActionEvent,
  ScrapedPost, ScrapedComment, SupervisedAction
} from '../types';

export const mockScrapedPosts: ScrapedPost[] = [
  { 
    id: 'sp-1', platform: 'instagram', url: 'https://instagr.am/p/E1', publishedAt: '2024-04-20T10:00:00Z', timestamp: '2024-04-20T10:00:00Z',
    caption: 'Sustainability is in our DNA. Every thread counts. #EcoFriendly #Longevity', 
    summary: 'Promotional post focusing on material sustainability and product life-cycle.',
    likeCount: 12400, commentCount: 342, uniqueCommenters: 280, dominantSentiment: 'positive', engagementQuality: 94,
    sentimentSplit: { positive: 80, neutral: 15, negative: 5 },
    suspiciousAccountCount: 0,
    dominantNarratives: ['Sustainability Claim', 'Durability Praise'], narratives: ['Sustainability Claim', 'Durability Praise']
  },
  { 
    id: 'sp-2', platform: 'instagram', url: 'https://instagr.am/p/E2', publishedAt: '2024-04-21T14:30:00Z', timestamp: '2024-04-21T14:30:00Z',
    caption: 'New Spring Launch is here! Check the link in bio for the full collection.', 
    summary: 'Product launch announcement with mixed engagement on shipping concerns.',
    likeCount: 8900, commentCount: 156, uniqueCommenters: 120, dominantSentiment: 'neutral', engagementQuality: 82,
    sentimentSplit: { positive: 40, neutral: 50, negative: 10 },
    suspiciousAccountCount: 1,
    dominantNarratives: ['Launch Hype', 'Shipping Delay Friction'], narratives: ['Launch Hype', 'Shipping Delay Friction']
  },
  { 
    id: 'sp-3', platform: 'x', url: 'https://x.com/status/123', publishedAt: '2024-04-22T09:15:00Z', timestamp: '2024-04-22T09:15:00Z',
    caption: 'Why is the return process so complex? @EcoGear fix this.', 
    summary: 'Direct customer complaint regarding logistical friction.',
    likeCount: 45, commentCount: 22, uniqueCommenters: 18, dominantSentiment: 'negative', engagementQuality: 65,
    sentimentSplit: { positive: 10, neutral: 20, negative: 70 },
    suspiciousAccountCount: 5,
    dominantNarratives: ['Pricing Friction', 'Product Quality Complaint'], narratives: ['Pricing Friction', 'Product Quality Complaint']
  }
];

export const mockExtractedNarratives: ExtractedNarrative[] = [
  { id: 'en-1', label: 'Sustainability Claim', description: 'Discourse around the authenticity of eco-friendly materials.', keywords: ['green', 'eco', 'materials', 'organic'], sentiment: 'positive', confidence: 0.92, commentCount: 1200, reachEstimate: 450000, pressureType: 'Positive Reinforcement' },
  { id: 'en-2', label: 'Durability Praise', description: 'User reports of products lasting significantly longer than competitors.', keywords: ['long', 'sturdy', 'years', 'built'], sentiment: 'positive', confidence: 0.88, commentCount: 850, reachEstimate: 320000, pressureType: 'Positive Reinforcement' },
  { id: 'en-3', label: 'Shipping Delay Friction', description: 'Logistical complaints regarding international transit times.', keywords: ['wait', 'shipping', 'late', 'tracking'], sentiment: 'negative', confidence: 0.85, commentCount: 450, reachEstimate: 150000, pressureType: 'Constructive Criticism' },
  { id: 'en-4', label: 'Greenwashing Skepticism', description: 'Analytical criticism questioning corporate eco-claims in retail.', keywords: ['fake', 'greenwashing', 'marketing', 'bs'], sentiment: 'negative', confidence: 0.72, commentCount: 210, reachEstimate: 95000, pressureType: 'Attack/Defamation' },
  { id: 'en-5', label: 'Launch Hype', description: 'Anticipation and positive chatter regarding new product cycles.', keywords: ['excited', 'buy', 'when', 'new'], sentiment: 'positive', confidence: 0.95, commentCount: 2400, reachEstimate: 1200000, pressureType: 'Positive Reinforcement' },
  { id: 'en-6', label: 'Pricing Friction', description: 'User debates on premium pricing vs perceived value.', keywords: ['expensive', 'worth', 'price', 'steep'], sentiment: 'neutral', confidence: 0.78, commentCount: 680, reachEstimate: 280000, pressureType: 'Skeptical' },
];

export const mockWebEvidenceHits: WebEvidenceHit[] = [
  { 
    id: 'weh-1', narrativeId: 'en-1', originPostId: 'sp-1', sourceType: 'news', sourceName: 'Politika Online', sourceDomain: 'politika.rs', 
    title: 'Novi trendovi u održivoj modi: Prvenstvo materijala', excerpt: 'EcoGear postavlja nove standarde na Balkanu korišćenjem reciklirane vune...', 
    url: 'https://politika.rs/s/fashion-eco', publishedAt: '2024-04-20', sentiment: 'positive', relevanceScore: 0.89, pressureType: 'Positive Reinforcement'
  },
  { 
    id: 'weh-2', narrativeId: 'en-4', originPostId: 'sp-1', sourceType: 'news', sourceName: 'Danas Tech', sourceDomain: 'danas.rs', 
    title: 'Analiza: Da li je korporativna moda zaista zelena?', excerpt: 'Pitanja se postavljaju oko prave cene održivosti kod brendova kao što je EcoGear...', 
    url: 'https://danas.rs/tech/green-mode', publishedAt: '2024-04-21', sentiment: 'negative', relevanceScore: 0.75, pressureType: 'Skeptical'
  },
  { 
    id: 'weh-3', narrativeId: 'en-3', originPostId: 'sp-2', sourceType: 'forum', sourceName: 'Ana.rs Forum', sourceDomain: 'ana.rs', 
    title: 'EcoGear iskustva sa isporukom - SRB', excerpt: 'Čekam već 3 nedelje na paket, niko mi ne odgovara na mejlove...', 
    url: 'https://ana.rs/forum/shipping', publishedAt: '2024-04-22', sentiment: 'negative', relevanceScore: 0.92, pressureType: 'Constructive Criticism', riskMarker: 'Potential Escalation'
  },
  { 
    id: 'weh-4', narrativeId: 'en-2', originPostId: 'sp-1', sourceType: 'blog', sourceName: 'Gear Junkie', sourceDomain: 'gearjunkie.com', 
    title: '5 Years Later: The EcoGear Shell Still Holds Up', excerpt: 'In a world of fast fashion, these items are actually built for the long haul.', 
    url: 'https://gearjunkie.com/ecogear-review', publishedAt: '2024-04-18', sentiment: 'positive', relevanceScore: 0.95, pressureType: 'Positive Reinforcement'
  },
  { 
    id: 'weh-5', narrativeId: 'en-6', originPostId: 'sp-2', sourceType: 'forum', sourceName: 'Reddit r/BuyItForLife', sourceDomain: 'reddit.com', 
    title: 'EcoGear: Worth the premium price tag?', excerpt: 'Comparing the stitching density to LLBean and Patagonia. Its close.', 
    url: 'https://reddit.com/r/BIFL/ecogear', publishedAt: '2024-04-19', sentiment: 'neutral', relevanceScore: 0.82, pressureType: 'Skeptical'
  }
];

export const mockScrapedComments: ScrapedComment[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `sc-${i}`,
  postId: i % 3 === 0 ? 'sp-1' : i % 3 === 1 ? 'sp-2' : 'sp-3',
  authorHandle: `@user_${i + 1}`,
  text: [
    "Amazing sustainability message!", 
    "How long is the shipping to Serbia?", 
    "Too expensive for what it is.", 
    "Quality has really improved lately.", 
    "Is this actually organic cotton?",
    "Čekam isporuku već predugo...",
    "Odličan dizajn, svaka čast!"
  ][i % 7],
  timestamp: new Date().toISOString(),
  sentiment: (i % 3 === 0 ? 'positive' : i % 3 === 1 ? 'neutral' : 'negative') as any,
  intent: (i % 5 === 0 ? 'Supportive' : i % 5 === 1 ? 'Curious' : 'Neutral') as any,
  riskFlag: i % 10 === 0,
  suspiciousSignals: i % 10 === 0 ? ['Burst activity', 'New account'] : []
}));

export const mockClients: Client[] = [
  { id: '1', name: 'EcoGear', industry: 'Sustainability/Retail', logo: 'EG', accountManager: 'Alex Rivera' },
  { id: '2', name: 'LuxeLiving', industry: 'Hospitality', logo: 'LL', accountManager: 'Sarah Chen' },
  { id: '3', name: 'AeroTech', industry: 'Aviation', logo: 'AT', accountManager: 'Marcus Thorne' },
  { id: '4', name: 'GlobalFin', industry: 'Fintech', logo: 'GF', accountManager: 'Elena Vance' },
  { id: '5', name: 'BioPurity', industry: 'Pharma', logo: 'BP', accountManager: 'Jordan Smith' },
  { id: '6', name: 'NexusMobility', industry: 'Automotive', logo: 'NM', accountManager: 'Sarah Chen' },
];

export const mockCampaigns: Campaign[] = [
  { 
    id: 'c1', clientId: '1', name: 'Spring Sustainability Drive', status: 'active', startDate: '2024-03-01', 
    kpis: { reach: 1200000, engagement: 45000, sentimentScore: 78, mentions: 1200, deltaReach: 15, deltaEngagement: 5, deltaSentiment: 2 } 
  },
  { 
    id: 'c2', clientId: '1', name: 'Circular Economy Narrative', status: 'active', startDate: '2024-04-10', 
    kpis: { reach: 450000, engagement: 12000, sentimentScore: 65, mentions: 850, deltaReach: 22, deltaEngagement: -2, deltaSentiment: 4 } 
  },
  { 
    id: 'c3', clientId: '2', name: 'Ultra-Luxe Summer Getaway', status: 'active', startDate: '2024-04-20', 
    kpis: { reach: 890000, engagement: 62000, sentimentScore: 92, mentions: 2100, deltaReach: 8, deltaEngagement: 12, deltaSentiment: 1 } 
  },
  { 
    id: 'c4', clientId: '3', name: 'Next-Gen Propulsion Launch', status: 'paused', startDate: '2024-03-15', 
    kpis: { reach: 2100000, engagement: 8000, sentimentScore: 45, mentions: 5400, deltaReach: -5, deltaEngagement: -15, deltaSentiment: -8 } 
  },
  { 
    id: 'c5', clientId: '4', name: 'Secure Banking 2024', status: 'active', startDate: '2024-01-10', 
    kpis: { reach: 5000000, engagement: 250000, sentimentScore: 82, mentions: 12000, deltaReach: 5, deltaEngagement: 10, deltaSentiment: 1 } 
  },
  { 
    id: 'c6', clientId: '5', name: 'Rare Disease Awareness', status: 'completed', startDate: '2023-11-01', 
    kpis: { reach: 300000, engagement: 15000, sentimentScore: 88, mentions: 450, deltaReach: 1, deltaEngagement: 1, deltaSentiment: 0 } 
  },
];

export const mockIngestionJobs: IngestionJob[] = [
  { id: 'j1', clientId: '1', source: 'instagram', status: 'running', progress: 65, records: 12400, lastSync: '2024-04-22 10:30', interval: '15m', health: 98, narrativeExtractionStatus: 'active' },
  { id: 'j2', clientId: '1', source: 'x', status: 'completed', progress: 100, records: 45000, lastSync: '2024-04-22 11:45', interval: '5m', health: 99, narrativeExtractionStatus: 'completed' },
  { id: 'j8', clientId: '1', source: 'forum', status: 'running', progress: 30, records: 1200, lastSync: '2024-04-22 12:00', interval: '30m', health: 88, narrativeExtractionStatus: 'active' },
  { id: 'j10', clientId: '1', source: 'news', status: 'completed', progress: 100, records: 540, lastSync: '2024-04-22 08:30', interval: '4h', health: 99, narrativeExtractionStatus: 'completed' },
  { id: 'j11', clientId: '1', source: 'facebook', status: 'queued', progress: 0, records: 0, lastSync: '-', interval: '1h', health: 100, narrativeExtractionStatus: 'pending' },
  { id: 'j12', clientId: '1', source: 'tiktok', status: 'failed', progress: 12, records: 80, lastSync: '2024-04-21 22:00', interval: '15m', health: 40, error: 'Rate Limit Exceeded', narrativeExtractionStatus: 'pending' },
  { id: 'j3', clientId: '2', source: 'tiktok', status: 'failed', progress: 12, records: 450, lastSync: '2024-04-21 22:00', interval: '30m', health: 45, error: 'API Auth Timeout', narrativeExtractionStatus: 'pending' },
  { id: 'j4', clientId: '2', source: 'instagram', status: 'running', progress: 88, records: 3200, lastSync: '2024-04-22 12:15', interval: '10m', health: 95, narrativeExtractionStatus: 'active' },
  { id: 'j5', clientId: '3', source: 'news', status: 'running', progress: 41, records: 890, lastSync: '2024-04-22 12:20', interval: '60m', health: 92, narrativeExtractionStatus: 'active' },
  { id: 'j6', clientId: '4', source: 'x', status: 'queued', progress: 0, records: 0, lastSync: '-', interval: '1m', health: 100, narrativeExtractionStatus: 'pending' },
  { id: 'j7', clientId: '5', source: 'facebook', status: 'completed', progress: 100, records: 15000, lastSync: '2024-04-22 09:00', interval: '1h', health: 97, narrativeExtractionStatus: 'completed' },
  { id: 'j9', clientId: '6', source: 'tiktok', status: 'completed', progress: 100, records: 67000, lastSync: '2024-04-22 11:00', interval: '15m', health: 96, narrativeExtractionStatus: 'completed' },
];

export const mockNarratives: Narrative[] = [
  { 
    id: 'n1', clientId: '1', title: 'Sustainable Durability', description: 'Audience shift towards product longevity as a core sustainability metric.', 
    sentiment: 'positive', reach: 850000, mentions: 3400, sources: ['x', 'instagram', 'forum'], trend: 'up', 
    signals: [{ id: 's1', timestamp: '2024-04-22T08:00Z', platform: 'x', strength: 80, volatility: 5 }], 
    evidenceSnippets: ['"I just want gear that lasts 10 years."', '"EcoGear boots are indestructible."'] 
  },
  { 
    id: 'n2', clientId: '1', title: 'Circular Friction', description: 'Resistance to recycling programs due to logistical complexity.', 
    sentiment: 'negative', reach: 120000, mentions: 450, sources: ['forum', 'news'], trend: 'down', 
    signals: [], 
    evidenceSnippets: ['"The return process is too annoying."', '"Why do I have to pay for shipping parts back?"'] 
  },
  { 
    id: 'n3', clientId: '3', title: 'Propulsion Skepticism', description: 'Technical communities questioning the range specs of next-gen propulsion.', 
    sentiment: 'negative', reach: 450000, mentions: 1200, sources: ['forum', 'x'], trend: 'up', 
    signals: [{ id: 's2', timestamp: '2024-04-22T10:00Z', platform: 'forum', strength: 92, volatility: 12 }], 
    evidenceSnippets: ['"Physics doesn\'t support these power density claims."', '"Show us the raw test data."'] 
  },
  { 
    id: 'n4', clientId: '2', title: 'Privacy Haven', description: 'High-net-worth individuals praising the resort\'s encryption-first policy.', 
    sentiment: 'positive', reach: 300000, mentions: 200, sources: ['news', 'instagram'], trend: 'stable', 
    signals: [], 
    evidenceSnippets: ['"The only place where privacy isn\'t an extra charge."', '"Total data blackout was refreshing."'] 
  },
  { 
    id: 'n5', clientId: '1', title: 'Transparency Trust', description: 'Recognition of open-source supply chain data.', 
    sentiment: 'positive', reach: 1200000, mentions: 5600, sources: ['news', 'x', 'instagram', 'facebook'], trend: 'up', 
    signals: [], 
    evidenceSnippets: ['"Finally a brand that isn\'t afraid of its own factory conditions."'] 
  },
];

export const mockNetworkNodes: NetworkNode[] = [
  { id: 'node-primary', handle: '@EcoGear_Official', platform: 'instagram', nodeType: 'primary_account', sentiment: 'positive', intent: 'Supportive', influenceScore: 98, engagementScore: 92, botLikelihood: 1, maliciousRisk: 1, coordinationRisk: 2, healthContribution: 95, profileMaturity: 98, recentCommentSnippets: ["Sustainability is our core."], connectedToPrimary: true, ring: 0 },
  { id: 'node-1-1', handle: '@green_warrior', platform: 'instagram', nodeType: 'active_supporter', sentiment: 'positive', intent: 'Supportive', influenceScore: 75, engagementScore: 88, botLikelihood: 5, maliciousRisk: 2, coordinationRisk: 10, healthContribution: 85, profileMaturity: 82, recentCommentSnippets: ["Love the new line!"], connectedToPrimary: true, ring: 1 },
  { id: 'node-1-2', handle: '@skeptic_eye88', platform: 'instagram', nodeType: 'critical_user', sentiment: 'negative', intent: 'Critical', influenceScore: 45, engagementScore: 65, botLikelihood: 15, maliciousRisk: 25, coordinationRisk: 40, healthContribution: -20, profileMaturity: 45, recentCommentSnippets: ["Is it really 100%?"], connectedToPrimary: true, ring: 1 },
  { id: 'node-1-3', handle: '@nature_lover_pro', platform: 'instagram', nodeType: 'high_influence_account', sentiment: 'positive', intent: 'Supportive', influenceScore: 92, engagementScore: 78, botLikelihood: 2, maliciousRisk: 1, coordinationRisk: 5, healthContribution: 90, profileMaturity: 95, recentCommentSnippets: ["Top tier practices."], connectedToPrimary: true, ring: 1 },
  { id: 'node-1-4', handle: '@bot_tester_001', platform: 'instagram', nodeType: 'possible_bot', sentiment: 'neutral', intent: 'Disruptive', influenceScore: 12, engagementScore: 95, botLikelihood: 88, maliciousRisk: 15, coordinationRisk: 75, healthContribution: -50, profileMaturity: 5, recentCommentSnippets: ["Check my link!"], connectedToPrimary: true, ring: 1 },
  ...Array.from({ length: 80 }).map((_, i) => ({
    id: `node-auto-${i}`,
    handle: `@node_${i + 1}`,
    platform: (['instagram', 'x', 'tiktok', 'facebook'][i % 4] as any),
    nodeType: (['active_supporter', 'neutral_observer', 'critical_user', 'follower_extension', 'possible_bot'][i % 5] as any),
    sentiment: (['positive', 'neutral', 'negative'][i % 3] as any),
    intent: (['Supportive', 'Curious', 'Neutral', 'Critical', 'Disruptive'][i % 5] as any),
    influenceScore: Math.floor(Math.random() * 100),
    engagementScore: Math.floor(Math.random() * 100),
    botLikelihood: Math.floor(Math.random() * 100),
    maliciousRisk: Math.floor(Math.random() * 50),
    coordinationRisk: Math.floor(Math.random() * 50),
    healthContribution: Math.floor(Math.random() * 100) - 50,
    profileMaturity: Math.floor(Math.random() * 100),
    recentCommentSnippets: [],
    connectedToPrimary: i < 15,
    ring: (i < 10 ? 1 : i < 25 ? 2 : 3) as any
  })),
];

export const mockNetworkEdges: NetworkEdge[] = [
  { source: 'node-1-1', target: 'node-primary', interactionDensity: 85, isInferred: false },
  ...Array.from({ length: 60 }).map((_, i) => ({
    source: `node-auto-${i}`,
    target: i < 5 ? 'node-primary' : `node-auto-${Math.floor(i / 2)}`,
    interactionDensity: Math.floor(Math.random() * 100),
    isInferred: i > 10
  })),
];

export const mockAccountHealth: AccountHealthScore = {
  score: 72,
  status: 'Watch',
  ratios: {
    positiveSupporter: 45,
    neutralAudience: 30,
    criticalPressure: 15,
    suspiciousActivity: 7,
    coordinatedRisk: 3
  },
  metrics: {
    engagementAuthenticity: 88,
    narrativeStability: 75,
    communityResilience: 82
  }
};

export const mockAudienceClusters: AudienceCluster[] = [
  { 
    id: 'cl1', clientId: '1', name: 'Eco-Activists', size: 125000, activity: 88, sentiment: 'positive', 
    topTopics: ['Sustainability', 'Transparency', 'Materials'], keyVoices: ['@green_warrior', '@nature_lover_pro'],
    lastActivity: '10m ago', coordinates: { x: 120, y: 340 },
    narrativeShare: [{ narrativeId: 'n1', share: 65 }, { narrativeId: 'n5', share: 20 }]
  },
  { 
    id: 'cl2', clientId: '1', name: 'Value Seekers', size: 450000, activity: 42, sentiment: 'neutral', 
    topTopics: ['Price', 'Warranty', 'Durability'], keyVoices: ['@budget_shopper', '@gear_fan_99'],
    lastActivity: '1h ago', coordinates: { x: 450, y: 120 },
    narrativeShare: [{ narrativeId: 'n1', share: 40 }, { narrativeId: 'n2', share: 30 }]
  }
];

export const mockNarrativePressure: NarrativePressure = {
  dominantPositive: "Supply chain transparency is highly praised among eco-influencers.",
  dominantNegative: "Pockets of criticism regarding international shipping carbon footprint.",
  emergingCriticism: "Potential greenwashing concerns specifically in the 'AeroTech' partnership threads.",
  topDiscussionTrigger: "Announcement of the new sustainable aviation initiative.",
  recommendation: "Increase direct engagement with technical skeptics in Ring 1."
};

export const mockReviewQueue: ReviewFlag[] = [
  { id: 'rev-1', handle: '@agitated_user_99', riskReason: 'Burst activity pattern + negative sentiment', botLikelihood: 45, coordinationRisk: 12, lastActivity: '2m ago', nodeId: 'node-1-2' },
  { id: 'rev-2', handle: '@coordinated_bot_net_0', riskReason: 'Repetitive phrasing + non-standard engagement hours', botLikelihood: 92, coordinationRisk: 95, lastActivity: '15m ago', nodeId: 'node-auto-10' },
  { id: 'rev-3', handle: '@troll_master_12', riskReason: 'Coordinated negative sentiment spikes', botLikelihood: 78, coordinationRisk: 88, lastActivity: '1h ago', nodeId: 'node-auto-15' },
  { id: 'rev-4', handle: '@bot_army_unit_4', riskReason: 'Possible bot farm entry point', botLikelihood: 99, coordinationRisk: 100, lastActivity: '5m ago', nodeId: 'node-auto-22' },
];

export const mockReports: Report[] = [
  { id: 'r1', clientId: '1', name: 'Q1 Sustainability Analysis', status: 'ready', date: '2024-04-01', type: 'Monthly', clientName: 'EcoGear', updatedAt: '2024-04-01T10:00:00Z' },
  { id: 'r2', clientId: '1', name: 'April Ingestion Drift', status: 'draft', date: '2024-04-15', type: 'Ad-hoc', clientName: 'EcoGear', updatedAt: '2024-04-15T14:30:00Z' },
  { id: 'r3', clientId: '3', name: 'AeroTech Propulsion Crisis', status: 'reviewed', date: '2024-03-20', type: 'Crisis', clientName: 'AeroTech', updatedAt: '2024-03-21T09:00:00Z' },
  { id: 'r4', clientId: '2', name: 'Luxury Summer Forecast', status: 'published', date: '2024-04-20', type: 'Campaign', clientName: 'LuxeLiving', updatedAt: '2024-04-21T18:00:00Z' },
  { id: 'r5', clientId: '1', name: 'Deep Dive: Supply Chain Narratives', status: 'ready', date: '2024-04-22', type: 'Ad-hoc', clientName: 'EcoGear', updatedAt: '2024-04-22T10:00:00Z' },
];

export const mockContentSuggestions: ContentSuggestion[] = [
  { id: 's1', clientId: '1', campaignId: 'c1', type: 'Engagement Support', content: "Our products are built for decades, not seasons.", goal: 'Highlight Longevity', tone: 'Professional', platform: 'x', risk: 'low', status: 'pending', strategistNotes: 'Aligns with Sustainable Durability.' },
  { id: 's2', clientId: '1', campaignId: 'c1', type: 'Discussion Starter', content: "What gear have you had the longest?", goal: 'Engagement', tone: 'Casual', platform: 'instagram', risk: 'low', status: 'approved', strategistNotes: 'User stories.' },
  { id: 's3', clientId: '1', campaignId: 'c1', type: 'Reply Suggestion', content: "We appreciate the question. Every material is documented here: [link]", goal: 'Transparency', tone: 'Helpful', platform: 'x', risk: 'low', status: 'draft', strategistNotes: 'Response to skeptic.' },
  { id: 's4', clientId: '3', campaignId: 'c4', type: 'Risk Flag', content: "Propulsion claims are under heavy fire in enthusiast forums. Recommend technical whitepaper release.", goal: 'Mitigation', tone: 'Critical', platform: 'forum', risk: 'high', status: 'pending', strategistNotes: 'Countering n3.' },
  { id: 's5', clientId: '1', campaignId: 'c2', type: 'Engagement Support', content: "Recycling is simple with our new QR-based system.", goal: 'Ease of Use', tone: 'Simple', platform: 'facebook', risk: 'low', status: 'scheduled', strategistNotes: 'Addressing friction.' },
];

export const mockApprovalItems: ApprovalItem[] = [
  { id: 'a1', clientId: '1', type: 'suggested_reply', title: 'Draft Response: Warranty Query', summary: 'Response to @nature_explorer.', priority: 'medium', status: 'pending', submittedAt: '2024-04-22T09:00:00Z', submittedBy: 'Alex Rivera', associatedId: 's1', author: 'AI Agent', date: '2024-04-22' },
  { id: 'a2', clientId: '1', type: 'campaign_plan', title: 'Spring Phase 3 Schedule', summary: 'Logistics and cadence.', priority: 'high', status: 'pending', submittedAt: '2024-04-22T10:30:00Z', submittedBy: 'Sarah Chen', associatedId: 'c1', author: 'Sarah Chen', date: '2024-04-22' },
  { id: 'a3', clientId: '3', type: 'report', title: 'Q1 Propulsion Audit', summary: 'Final technical analysis.', priority: 'critical', status: 'pending', submittedAt: '2024-04-21T16:00:00Z', submittedBy: 'Marcus Thorne', associatedId: 'r3', author: 'Marcus Thorne', date: '2024-04-21' },
  { id: 'a4', clientId: '1', type: 'content', title: 'New Organic Cotton Shoot', summary: 'Image batch for Instagram.', priority: 'low', status: 'approved', submittedAt: '2024-04-20T10:00:00Z', submittedBy: 'Alex Rivera', associatedId: 's2', author: 'Creative Team', date: '2024-04-20' },
  { id: 'a5', clientId: '1', type: 'suggested_reply', title: 'Comment: Shipping Carbon', summary: 'Response addressing eco-concerns.', priority: 'medium', status: 'approved', submittedAt: '2024-04-21T09:00:00Z', submittedBy: 'Sarah Chen', associatedId: 's3', author: 'AI Agent', date: '2024-04-21' },
  { id: 'a6', clientId: '1', type: 'report', title: 'Weekly Sentiment Wrap', summary: 'Performance review.', priority: 'low', status: 'rejected', submittedAt: '2024-04-18T10:00:00Z', submittedBy: 'System', associatedId: 'r1', author: 'System', date: '2024-04-18' },
];

export const mockExecutionRuns: ExecutionRun[] = [
  { id: 'er1', clientId: '1', campaignId: 'c1', name: 'Approved Content Push #4', status: 'active', progress: 45, startTime: '2024-04-22T08:00:00Z', owner: 'System', healthScore: 100 },
  { id: 'er2', clientId: '2', campaignId: 'c3', name: 'Influencer Seeding A', status: 'paused', progress: 12, startTime: '2024-04-22T11:00:00Z', owner: 'Sarah Chen', healthScore: 85 },
  { id: 'er3', clientId: '1', campaignId: 'c2', name: 'Recycling Outreach #1', status: 'scheduled', progress: 0, startTime: '2024-04-25T09:00:00Z', owner: 'Elena Vance', healthScore: 100 },
  { id: 'er4', clientId: '3', campaignId: 'c4', name: 'Briefing Series: AeroTech', status: 'intervention-needed', progress: 88, startTime: '2024-04-20T10:00:00Z', owner: 'System', healthScore: 42 },
];

export const mockConversations: ConversationThread[] = [
  { id: 't1', clientId: '1', platform: 'instagram', author: 'nature_explorer', content: "Does the warranty cover water damage?", timestamp: '2024-04-22T10:15:00Z', sentiment: 'neutral', status: 'unresolved', escalationFlag: false, replies: [] },
  { id: 't2', clientId: '3', platform: 'x', author: 'av_geek', content: "Specs look too good to be true. Any 3rd party testing?", timestamp: '2024-04-22T11:30:00Z', sentiment: 'negative', status: 'assigned', escalationFlag: true, replies: [{ author: 'AeroTech_Team', content: 'We are in final stage validation.', timestamp: '2024-04-22T12:00:00Z' }] },
  { id: 't3', clientId: '1', platform: 'forum', author: 'gear_fan_99', content: "Where can I find the supply chain map?", timestamp: '2024-04-22T09:00:00Z', sentiment: 'positive', status: 'reviewed', escalationFlag: false, replies: [] },
];

export const mockAlerts: Alert[] = [
  { id: 'al1', clientId: '1', type: 'narrative_spike', message: 'Spike in "Shipping Delay" narrative.', severity: 'high', timestamp: '2024-04-22T11:55:00Z', resolved: false, relatedId: 'n2' },
  { id: 'al2', clientId: '3', type: 'security_risk', message: 'Credential leak detected on forum.', severity: 'critical', timestamp: '2024-04-22T12:05:00Z', resolved: false },
  { id: 'al3', clientId: '2', type: 'negative_sentiment', message: 'Negative sentiment cluster forming in Summer campaign.', severity: 'medium', timestamp: '2024-04-22T10:00:00Z', resolved: true },
];

export const mockActivityEvents: ActivityEvent[] = [
  { id: 'ev1', clientId: '1', type: 'ingestion_completed', user: 'System', timestamp: '2024-04-22T11:45:00Z', description: 'Completed sync for EcoGear X source.' },
  { id: 'ev2', clientId: '1', type: 'approval_requested', user: 'Alex Rivera', timestamp: '2024-04-22T09:00:00Z', description: 'Requested approval for s1' },
  { id: 'ev3', clientId: '3', type: 'intervention_triggered', user: 'System', timestamp: '2024-04-22T12:30:00Z', description: 'System triggered intervention on er4.' },
];

export const mockIntegrations: Integration[] = [
  { id: 'i1', name: 'Instagram Graph API', status: 'connected', lastSync: '2024-04-22 11:45', type: 'Social Media' },
  { id: 'i2', name: 'X Enterprise API', status: 'active', lastSync: '2024-04-22 11:45', type: 'Social Media' },
  { id: 'i3', name: 'TikTok Marketing API', status: 'error', lastSync: '2024-04-21 22:00', type: 'Social Media' },
  { id: 'i4', name: 'Facebook Marketing API', status: 'active', lastSync: '2024-04-22 10:00', type: 'Social Media' },
  { id: 'i5', name: 'News Scraper (Enterprise)', status: 'connected', lastSync: '2024-04-22 11:00', type: 'News' },
];

export const mockResponderGroups: ResponderGroup[] = [
  { id: 'group-01', name: 'PR_ALPHA_ALPHA', type: 'PR Rapid Response', operator: 'S. Brisevac', accountCount: 12, status: 'ready', approvalState: 'approved', capacity: 200, activeCount: 45, region: 'Global' },
  { id: 'group-02', name: 'MOD_BALKANS_01', type: 'Regional Moderators', operator: 'D. Jovanovic', accountCount: 8, status: 'active', approvalState: 'approved', capacity: 150, activeCount: 88, region: 'Balkans' },
  { id: 'group-03', name: 'AMBASSADOR_CORPS_NW', type: 'Ambassador Program Pool', operator: 'M. Petrovic', accountCount: 45, status: 'standby', approvalState: 'approved', capacity: 500, activeCount: 12, region: 'DACH' },
  { id: 'group-04', name: 'COMMUNITY_SHIELD', type: 'Community Response Team', operator: 'E. Smith', accountCount: 20, status: 'ready', approvalState: 'pending', capacity: 300, activeCount: 0, region: 'North America' },
  { id: 'group-05', name: 'BRAND_VOICE_CORE', type: 'Authorized Brand Support', operator: 'A. Novak', accountCount: 5, status: 'active', approvalState: 'approved', capacity: 50, activeCount: 42, region: 'Corporate' },
];

export const generateDenseComments = (count: number, sessionId: string): ScrapedComment[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `comment-dense-${i}-${sessionId}`,
    postId: `sp-${Math.floor(i/10) + 1}`,
    authorHandle: `@user_alpha_${i % 50}`,
    text: i % 3 === 0 ? "This seems like a significant narrative shift regarding sustainability." : "Monitoring this interaction cluster for risk vectors in the regional sector.",
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    sentiment: (i % 5 === 0 ? 'negative' : i % 3 === 0 ? 'positive' : 'neutral') as any,
    intent: (i % 7 === 0 ? 'Coordinated Risk' : 'Neutral') as any,
    riskFlag: i % 10 === 0,
    suspiciousSignals: i % 10 === 0 ? ['High Velocity', 'Narrative Copy-Paste'] : []
  }));
};

export const mockSupervisedActions: SupervisedAction[] = Array.from({ length: 40 }).map((_, i) => ({
  id: `action-${i}`,
  type: i % 3 === 0 ? 'response' : 'moderation',
  label: `Supervised Execution ${i + 1}`,
  status: (i < 5 ? 'dispatched' : i < 15 ? 'ready' : 'queued') as any,
  priority: i % 10 === 0 ? 'critical' : 'medium',
  timestamp: new Date().toISOString(),
  prerequisites: [],
  logs: [{ timestamp: new Date().toISOString(), event: 'Action initialized in supervisor queue.' }]
}));

export const mockLiveEvents: LiveActionEvent[] = [
  { id: 'le1', timestamp: new Date().toISOString(), type: 'collection', message: 'Instagram stream initialized: @EcoGear_Official', severity: 'low' },
  { id: 'le2', timestamp: new Date().toISOString(), type: 'analysis', message: 'Narrative drift detected in Sustainability thread.', severity: 'medium' },
  { id: 'le3', timestamp: new Date().toISOString(), type: 'approval', message: 'Pending response batch #44 requires editor review.', severity: 'high' },
];

export const mockAnalysisSessions: AnalysisSession[] = [
  { 
    id: 's1', 
    clientId: '1', 
    primaryProfileUrl: 'https://instagram.com/ecogear', 
    accountHandle: '@EcoGear', 
    platform: 'instagram',
    scrapeMode: 'latest_n', 
    postCount: 10, 
    sources: { posts: true, comments: true, mentions: false, portals: false, forums: false },
    status: 'completed', 
    currentStage: 'completed', 
    progress: 100, 
    createdAt: '2024-04-22T08:00:00Z', 
    updatedAt: '2024-04-22T10:00:00Z',
    parallelTasks: [
      { id: 'task-1', label: 'Instagram_Stream', status: 'completed', progress: 100, recordsCount: 1240 },
      { id: 'task-2', label: 'Comment_Analysis', status: 'completed', progress: 100, recordsCount: 8400 },
      { id: 'task-3', label: 'Narrative_Sync', status: 'completed', progress: 100, recordsCount: 12 },
      { id: 'task-4', label: 'Evidence_Search', status: 'completed', progress: 100, recordsCount: 55 }
    ],
    actionQueue: mockSupervisedActions.slice(0, 10),
    scrapedPosts: mockScrapedPosts,
    scrapedComments: mockScrapedComments,
    extractedNarratives: mockExtractedNarratives.slice(0, 3),
    webEvidence: mockWebEvidenceHits.slice(0, 4),
    narratives: mockNarratives.slice(0, 2),
    networkNodes: mockNetworkNodes.slice(0, 30),
    networkEdges: mockNetworkEdges.slice(0, 10),
    accountHealth: mockAccountHealth,
    reviewQueue: mockReviewQueue,
    reportMetrics: {
      totalPostsAnalyzed: 10,
      totalCommentsCollected: 450,
      totalUniqueCommentersMapped: 380,
      sentimentDistribution: { positive: 65, neutral: 25, negative: 10 },
      dominantNarratives: ['Eco-Durability', 'Transparency'],
      accountHealthScore: 82,
      suspiciousReviewCount: 5,
      narrativeStability: 88,
      engagementAuthenticity: 91,
      reportReadiness: 100
    },
    responsePlan: { suggestions: mockContentSuggestions.slice(0, 2) },
    approvals: [],
    supervision: {
      actionQueue: [],
      completedActions: [],
      failedActions: [],
      alerts: [],
      responderGroupHealth: { 'rg1': 100, 'rg2': 95, 'rg3': 88 }
    },
    events: mockLiveEvents
  },
];
