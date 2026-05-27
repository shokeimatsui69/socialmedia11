import type {
  AccountHealthScore,
  BrandPositionDecisionSynthesis,
  AudienceCluster,
  CommentNarrative,
  CommentIntentDistribution,
  CompetitorBattlecardSynthesis,
  CompetitorAudienceGap,
  CompetitorContentPattern,
  CompetitorMarketScope,
  CompetitorProfileInsight,
  CompetitorStealPlay,
  ContentSuggestion,
  ExtractedNarrative,
  ImportedCommentRow,
  ImportedProfileRow,
  IntelligencePipelineRequest,
  IntelligencePipelineResult,
  LiveActionEvent,
  Narrative,
  NetworkEdge,
  NetworkNode,
  NarrativePressureType,
  Platform,
  ProviderDiagnostic,
  ReportMetrics,
  ReviewFlag,
  ScrapedComment,
  ScrapedPost,
  Sentiment,
  SourceRun,
  StrategicIntelligenceLayer,
  UserIntent,
  WebEvidenceHit,
} from '../src/types';

const APIFY_BASE_URL = 'https://api.apify.com/v2';
const XAI_BASE_URL = 'https://api.x.ai/v1';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

const DEFAULT_POST_ACTOR = 'apify/instagram-post-scraper';
const DEFAULT_COMMENT_ACTOR = 'SbK00X0JYCPblD2wp';
const FALLBACK_COMMENT_ACTOR = 'apify/instagram-comment-scraper';
const DEFAULT_LIKE_ACTOR = 'WxPRaG9gfg5KZ4gY1';
const DEFAULT_XAI_TIMEOUT_MS = 90_000;
const DEFAULT_OPENAI_TIMEOUT_MS = 120_000;
const DEFAULT_COMPETITOR_TIMEOUT_MS = 240_000;
const DEFAULT_OPENAI_MODEL = 'gpt-5.2';
const DEFAULT_COMPETITOR_POST_LIMIT = 10;
const DEFAULT_COMPETITOR_COMMENT_LIMIT = 75;

export const INTELLIGENCE_PROGRESS_STAGES = [
  { id: 'target_validation', label: 'Validate target URL' },
  { id: 'source_scrape', label: 'Scrape source identity' },
  { id: 'post_scrape', label: 'Scrape Instagram posts' },
  { id: 'comment_scrape', label: 'Scrape Instagram comments' },
  { id: 'comment_narratives', label: 'Build comment narratives' },
  { id: 'grouped_narratives', label: 'Group narrative themes' },
  { id: 'x_signals', label: 'Search X / Grok signals' },
  { id: 'web_evidence', label: 'Search web evidence' },
  { id: 'discover_competitors', label: 'Discover competitors' },
  { id: 'analyze_competitors', label: 'Analyze top competitors' },
  { id: 'audience_status', label: 'Build audience status' },
  { id: 'brand_position', label: 'Build brand position' },
] as const;

export type IntelligenceProgressStageId = (typeof INTELLIGENCE_PROGRESS_STAGES)[number]['id'];
export type IntelligenceProgressStatus = 'running' | 'completed' | 'warning' | 'failed';

export interface IntelligenceProgressUpdate {
  stageId: IntelligenceProgressStageId;
  stageLabel: string;
  status: IntelligenceProgressStatus;
  progress: number;
  message: string;
  timestamp: string;
  records?: number;
}

export type IntelligenceProgressReporter = (update: IntelligenceProgressUpdate) => void;

type JsonMap = Record<string, any>;

interface SubjectDataset {
  handle: string;
  profileUrl: string;
  originalPostUrl: string;
  rawPosts: JsonMap[];
  rawComments: JsonMap[];
  rawLikes: JsonMap[];
  scrapedPosts: ScrapedPost[];
  scrapedComments: ScrapedComment[];
  rawProfileRows: ImportedProfileRow[];
  rawCommentRows: ImportedCommentRow[];
  diagnostics: ProviderDiagnostic[];
}

interface NarrativeProfile {
  coreNarrative: string;
  thematicPatterns: string[];
  audiencePositioning: string;
  communicationStyle: string;
  contentSignals: string[];
  keywords: string[];
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  commentNarratives: Array<{
    commentId: string;
    label: string;
    summary: string;
    authorHandle?: string;
    sentiment?: Sentiment;
    confidence?: number;
    source?: CommentNarrative['source'];
  }>;
}

interface XIntelligence {
  summary?: string;
  publicSentiment?: { positive: number; neutral: number; negative: number };
  viralNarratives?: Array<{
    label: string;
    description: string;
    sentiment?: Sentiment;
    momentum?: string;
    keywords?: string[];
  }>;
  relatedDiscussions?: Array<{
    title: string;
    summary: string;
    source?: string;
    url?: string;
  }>;
  crossPlatformAlignment?: string;
  trendMomentum?: string;
  competitors?: Array<{ handle: string; reason?: string; positioning?: string }>;
}

interface WebIntelligence {
  summary?: string;
  webSentiment?: { positive: number; neutral: number; negative: number };
  marketNarratives?: string[];
  industryDiscussions?: string[];
  webEvidence?: Array<{
    title: string;
    url?: string;
    source_name?: string;
    source_domain?: string;
    source_type?: 'portal' | 'news' | 'blog' | 'forum' | 'aggregator';
    excerpt?: string;
    sentiment?: Sentiment;
    relevance?: number;
  }>;
  brandPerception?: string;
  marketOpportunities?: string[];
  audienceMigrationPatterns?: string[];
  recommendations?: string[];
  competitors?: Array<{ handle: string; reason?: string; positioning?: string }>;
}

interface OpenAiCompetitorCandidate {
  name: string;
  handle: string;
  profileUrl: string;
  websiteUrl?: string;
  evidenceUrls: string[];
  reason: string;
  positioning: string;
  confidence: number;
  marketScope?: CompetitorMarketScope;
  country?: string;
  category?: string;
  searchQuery?: string;
}

interface AdvancedStrategicSynthesis {
  brandPosition: BrandPositionDecisionSynthesis;
  competitors: CompetitorBattlecardSynthesis[];
}

const nowIso = () => new Date().toISOString();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function openAiModel(...envNames: string[]): string {
  const seen = new Set<string>();
  for (const name of [...envNames, 'OPENAI_MODEL']) {
    if (seen.has(name)) continue;
    seen.add(name);
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return DEFAULT_OPENAI_MODEL;
}

function advancedOpenAiModel(): string {
  return openAiModel('OPENAI_ADVANCED_ANALYSIS_MODEL', 'OPENAI_NARRATIVE_MODEL', 'OPENAI_COMPETITOR_MODEL');
}

const envNumber = (name: string, fallback: number) => {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const cleanHandle = (handle: string | undefined) =>
  (handle || '').replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').split(/[/?#]/)[0].trim();

const unique = <T>(items: T[]) => Array.from(new Set(items.filter(Boolean)));

const toApiActorId = (actorId: string) => actorId.includes('/') ? actorId.replace('/', '~') : actorId;

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number, label: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

const createEvent = (message: string, type: LiveActionEvent['type'] = 'analysis', severity: LiveActionEvent['severity'] = 'low'): LiveActionEvent => ({
  id: `le-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  timestamp: nowIso(),
  type,
  message,
  severity,
});

function reportProgress(
  reporter: IntelligenceProgressReporter | undefined,
  stageId: IntelligenceProgressStageId,
  status: IntelligenceProgressStatus,
  message: string,
  records?: number,
) {
  if (!reporter) return;
  const index = INTELLIGENCE_PROGRESS_STAGES.findIndex(stage => stage.id === stageId);
  const stage = INTELLIGENCE_PROGRESS_STAGES[Math.max(0, index)] ?? INTELLIGENCE_PROGRESS_STAGES[0];
  const completedCount = status === 'completed' || status === 'warning'
    ? index + 1
    : index;
  const progress = status === 'failed'
    ? Math.max(1, Math.round((Math.max(0, index) / INTELLIGENCE_PROGRESS_STAGES.length) * 100))
    : Math.min(99, Math.max(1, Math.round((completedCount / INTELLIGENCE_PROGRESS_STAGES.length) * 100)));
  reporter({
    stageId,
    stageLabel: stage.label,
    status,
    progress,
    message,
    timestamp: nowIso(),
    records,
  });
}

const diag = (
  provider: ProviderDiagnostic['provider'],
  status: ProviderDiagnostic['status'],
  message: string,
  meta?: Record<string, any>,
): ProviderDiagnostic => ({ provider, status, message, meta });

function asArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray((value as JsonMap).items)) return (value as JsonMap).items;
  return [];
}

function pickString(source: JsonMap | undefined, keys: string[], fallback = ''): string {
  if (!source) return fallback;
  for (const key of keys) {
    const value = key.split('.').reduce<any>((acc, part) => acc?.[part], source);
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return fallback;
}

function pickNumber(source: JsonMap | undefined, keys: string[], fallback = 0): number {
  if (!source) return fallback;
  for (const key of keys) {
    const value = key.split('.').reduce<any>((acc, part) => acc?.[part], source);
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function parseInstagramUrl(input: string) {
  try {
    const url = new URL(input);
    const parts = url.pathname.split('/').filter(Boolean);
    const postMarkerIndex = parts.findIndex(p => ['p', 'reel', 'tv'].includes(p));
    return {
      handle: parts.length && postMarkerIndex !== 0 ? parts[0] : '',
      shortcode: postMarkerIndex >= 0 ? parts[postMarkerIndex + 1] : parts[0] || '',
      isPost: postMarkerIndex >= 0,
    };
  } catch {
    return { handle: cleanHandle(input), shortcode: '', isPost: false };
  }
}

function postUrlFromItem(item: JsonMap, fallback: string): string {
  const url = pickString(item, ['url', 'postUrl', 'inputUrl', 'displayUrl'], fallback);
  if (url.startsWith('http')) return url;
  const shortcode = pickString(item, ['shortCode', 'shortcode', 'code', 'id']);
  return shortcode ? `https://www.instagram.com/p/${shortcode}/` : fallback;
}

function handleFromPost(item: JsonMap | undefined, fallback: string): string {
  const handle = pickString(item, [
    'ownerUsername',
    'owner.username',
    'username',
    'user.username',
    'profileUsername',
    'authorUsername',
  ], fallback);
  return cleanHandle(handle || fallback);
}

function sentimentFromText(text: string): Sentiment {
  const normalized = text.toLowerCase();
  const positive = ['love', 'great', 'best', 'amazing', 'strong', 'support', 'beautiful', 'excellent', 'win', 'excited', 'trust'];
  const negative = ['bad', 'hate', 'fake', 'scam', 'angry', 'wrong', 'fail', 'problem', 'weak', 'expensive', 'late', 'risk'];
  const pos = positive.filter(word => normalized.includes(word)).length;
  const neg = negative.filter(word => normalized.includes(word)).length;
  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return 'neutral';
}

function intentFromText(text: string, sentiment: Sentiment): UserIntent {
  const normalized = text.toLowerCase();
  if (/(bot|fake|scam|spam|paid)/.test(normalized)) return 'Suspicious';
  if (/(why|how|when|where|\?)/.test(normalized)) return 'Curious';
  if (/(buy|sale|promo|follow|dm)/.test(normalized)) return 'Promotional';
  if (sentiment === 'positive') return 'Supportive';
  if (sentiment === 'negative') return 'Critical';
  return 'Neutral';
}

function tokenize(text: string): string[] {
  const stop = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'you', 'your', 'are', 'was', 'were', 'have', 'has',
    'but', 'not', 'all', 'our', 'their', 'there', 'here', 'what', 'when', 'where', 'how', 'about', 'into',
    'https', 'www', 'com', 'instagram', 'just', 'like', 'more', 'will', 'can', 'one', 'new', 'now',
  ]);
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9#@\s]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 2 && !stop.has(t));
}

function topKeywords(text: string, limit = 12): string[] {
  const counts = new Map<string, number>();
  for (const token of tokenize(text)) counts.set(token, (counts.get(token) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function mapPost(item: JsonMap, index: number, fallbackUrl: string, narrative?: NarrativeProfile): ScrapedPost {
  const url = postUrlFromItem(item, fallbackUrl);
  const id = pickString(item, ['shortCode', 'shortcode', 'code', 'id'], parseInstagramUrl(url).shortcode || `post-${index}`);
  const caption = pickString(item, ['caption', 'text', 'title', 'description', 'alt'], '');
  const timestamp = pickString(item, ['timestamp', 'publishedAt', 'takenAt', 'createdAt', 'date'], nowIso());
  const likeCount = pickNumber(item, ['likesCount', 'likeCount', 'likes', 'metrics.likes'], 0);
  const commentCount = pickNumber(item, ['commentsCount', 'commentCount', 'comments', 'metrics.comments'], 0);
  const sentiment = sentimentFromText(caption);
  const postNarratives = narrative?.thematicPatterns?.slice(0, 3) || topKeywords(caption, 3);

  return {
    id,
    platform: 'instagram',
    url,
    publishedAt: timestamp,
    timestamp,
    caption,
    summary: caption.slice(0, 180) || `Instagram post ${id}`,
    likeCount,
    commentCount,
    uniqueCommenters: 0,
    dominantSentiment: sentiment,
    engagementQuality: clamp(Math.round((likeCount / Math.max(commentCount, 1)) * 4), 40, 98),
    sentimentSplit: sentiment === 'positive'
      ? { positive: 70, neutral: 20, negative: 10 }
      : sentiment === 'negative'
        ? { positive: 15, neutral: 30, negative: 55 }
        : { positive: 35, neutral: 45, negative: 20 },
    dominantNarratives: postNarratives.length ? postNarratives : ['General Discussion'],
    narratives: postNarratives.length ? postNarratives : ['General Discussion'],
    suspiciousAccountCount: 0,
  };
}

function mapComment(item: JsonMap, index: number, fallbackPostUrl: string): ScrapedComment {
  const text = pickString(item, ['text', 'comment', 'caption', 'body'], '');
  const sentiment = sentimentFromText(text);
  const author = pickString(item, ['ownerUsername', 'username', 'owner.username', 'user.username', 'authorUsername'], `user_${index}`);
  const postUrl = pickString(item, ['postUrl', 'url', 'inputUrl'], fallbackPostUrl);
  return {
    id: pickString(item, ['id', 'commentId', 'pk'], `comment-${index}`),
    postId: parseInstagramUrl(postUrl).shortcode || pickString(item, ['postId', 'mediaId'], ''),
    authorHandle: author.startsWith('@') ? author : `@${author}`,
    text,
    timestamp: pickString(item, ['timestamp', 'createdAt', 'date'], nowIso()),
    sentiment,
    intent: intentFromText(text, sentiment),
    riskFlag: /(bot|fake|scam|spam|hate|threat)/i.test(text),
    suspiciousSignals: /(bot|fake|scam|spam)/i.test(text) ? ['keyword-risk'] : [],
    replyToCommentId: pickString(item, ['replyToCommentId', 'parentCommentId'], undefined as any),
  };
}

function fallbackCommentNarrative(comment: ScrapedComment): CommentNarrative {
  const text = comment.text.toLowerCase();
  if (comment.riskFlag || /(bot|fake|scam|spam)/i.test(comment.text)) {
    return {
      label: 'Authenticity Concern',
      summary: 'The comment raises or triggers authenticity and spam-risk concerns around the conversation.',
      confidence: 0.68,
      source: 'fallback',
    };
  }
  if (/(proof|evidence|numbers|source|where|claim|true|really)/.test(text)) {
    return {
      label: 'Demanding Proof',
      summary: 'The commenter asks for concrete proof before accepting the claim or positioning.',
      confidence: 0.66,
      source: 'fallback',
    };
  }
  if (/(price|expensive|shipping|delivery|order|late|refund)/.test(text)) {
    return {
      label: 'Operational Friction',
      summary: 'The comment focuses on delivery, pricing, or service friction affecting trust.',
      confidence: 0.66,
      source: 'fallback',
    };
  }
  if (comment.intent === 'Curious') {
    return {
      label: 'Audience Question',
      summary: 'The commenter is seeking clarification and may be open to follow-up information.',
      confidence: 0.64,
      source: 'fallback',
    };
  }
  if (comment.sentiment === 'positive') {
    return {
      label: 'Supportive Endorsement',
      summary: 'The comment reinforces support and positive audience affinity for the target.',
      confidence: 0.64,
      source: 'fallback',
    };
  }
  if (comment.sentiment === 'negative') {
    return {
      label: 'Critical Pushback',
      summary: 'The comment challenges the target and may require a clarifying response.',
      confidence: 0.64,
      source: 'fallback',
    };
  }
  if (comment.intent === 'Promotional') {
    return {
      label: 'Promotional Diversion',
      summary: 'The comment diverts attention toward promotion rather than the post narrative.',
      confidence: 0.62,
      source: 'fallback',
    };
  }
  return {
    label: 'Neutral Reaction',
    summary: 'The comment registers a low-intensity audience reaction without a clear pressure signal.',
    confidence: 0.6,
    source: 'fallback',
  };
}

function sanitizeCommentNarrative(value: unknown, fallback: CommentNarrative): CommentNarrative {
  if (!value || typeof value !== 'object') return fallback;
  const source = value as JsonMap;
  const label = pickString(source, ['label'], fallback.label).slice(0, 72);
  const summary = pickString(source, ['summary'], fallback.summary).slice(0, 240);
  const confidenceValue = pickNumber(source, ['confidence'], fallback.confidence);
  return {
    label: label || fallback.label,
    summary: summary || fallback.summary,
    confidence: clamp(confidenceValue > 1 ? confidenceValue / 100 : confidenceValue, 0.1, 1),
    source: 'ai',
  };
}

function chunkItems<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

async function enrichCommentsWithNarratives(
  comments: ScrapedComment[],
): Promise<{ comments: ScrapedComment[]; diagnostics: ProviderDiagnostic[] }> {
  if (!comments.length) return { comments, diagnostics: [] };

  const fallbackById = new Map(comments.map(comment => [comment.id, fallbackCommentNarrative(comment)]));
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      comments: comments.map(comment => ({ ...comment, narrative: fallbackById.get(comment.id) })),
      diagnostics: [diag('openai', 'warning', 'OPENAI_API_KEY is missing. Comment narratives generated locally.')],
    };
  }

  const batchSize = clamp(Number(process.env.COMMENT_NARRATIVE_BATCH_SIZE || 40), 5, 100);
  const model = openAiModel('OPENAI_NARRATIVE_MODEL', 'OPENAI_COMMENT_NARRATIVE_MODEL');
  const narrativeById = new Map<string, CommentNarrative>();
  const diagnostics: ProviderDiagnostic[] = [];

  for (const batch of chunkItems(comments, batchSize)) {
    const prompt = {
      task: 'Summarize each Instagram comment as a concise audience narrative. Return only valid JSON.',
      schema: {
        narratives: [{
          id: 'string matching comment id',
          label: '2-5 word audience narrative label',
          summary: 'one sentence describing what the comment means strategically',
          confidence: 'number 0-1',
        }],
      },
      comments: batch.map(comment => ({
        id: comment.id,
        author: comment.authorHandle,
        text: comment.text.slice(0, 600),
        sentiment: comment.sentiment,
        intent: comment.intent,
        riskFlag: comment.riskFlag,
      })),
    };

    try {
      const response = await fetchWithTimeout(`${OPENAI_BASE_URL}/responses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          input: [
            { role: 'system', content: 'You are a social intelligence analyst. Return compact valid JSON only.' },
            { role: 'user', content: JSON.stringify(prompt) },
          ],
          max_output_tokens: 2500,
        }),
      }, envNumber('OPENAI_COMMENT_NARRATIVE_TIMEOUT_MS', 90_000), 'OpenAI comment narrative summarization');
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message || response.statusText);
      const parsed = parseJsonObject<{ narratives?: Array<{ id?: string; label?: string; summary?: string; confidence?: number }> }>(extractModelText(json));
      const items = Array.isArray(parsed?.narratives) ? parsed.narratives : [];
      for (const item of items) {
        if (!item?.id) continue;
        const fallback = fallbackById.get(item.id);
        if (!fallback) continue;
        narrativeById.set(item.id, sanitizeCommentNarrative(item, fallback));
      }
    } catch (error) {
      diagnostics.push(diag('openai', 'warning', `Comment narrative batch fell back locally: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  const enriched = comments.map(comment => ({
    ...comment,
    narrative: narrativeById.get(comment.id) || fallbackById.get(comment.id),
  }));
  const aiCount = enriched.filter(comment => comment.narrative?.source === 'ai').length;
  diagnostics.push(
    aiCount > 0
      ? diag('openai', 'ok', `OpenAI generated comment narratives for ${aiCount} of ${comments.length} comment(s).`)
      : diag('openai', 'warning', 'All comment narratives were generated locally after OpenAI returned no usable items.'),
  );
  return { comments: enriched, diagnostics };
}

async function runApifyActor(
  actorId: string,
  input: JsonMap,
  options: { maxItems?: number; timeoutSecs?: number } = {},
): Promise<{ items: JsonMap[]; diagnostic: ProviderDiagnostic }> {
  const token = process.env.APIFY_API_KEY;
  if (!token) {
    throw new Error('APIFY_API_KEY is missing');
  }

  const url = new URL(`${APIFY_BASE_URL}/acts/${encodeURIComponent(toApiActorId(actorId))}/run-sync-get-dataset-items`);
  const envActorTimeoutSecs = Math.max(
    envNumber('APIFY_ACTOR_TIMEOUT_SECS', 0),
    envNumber('APIFY_SYNC_TIMEOUT_SECONDS', 0),
  );
  const actorTimeoutSecs = options.timeoutSecs || envActorTimeoutSecs || 600;
  url.searchParams.set('clean', 'true');
  url.searchParams.set('format', 'json');
  url.searchParams.set('timeout', String(actorTimeoutSecs));
  if (options.maxItems) url.searchParams.set('maxItems', String(options.maxItems));

  const started = Date.now();
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  }, (actorTimeoutSecs + 20) * 1000, `Apify actor ${actorId}`);

  const text = await response.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : [];
  } catch {
    json = text;
  }

  if (!response.ok) {
    const message = typeof json === 'object' ? json?.error?.message || json?.message : text;
    throw new Error(`Apify actor ${actorId} failed: ${message || response.statusText}`);
  }

  const items = asArray(json);
  return {
    items,
    diagnostic: diag('apify', 'ok', `Actor ${actorId} returned ${items.length} item(s).`, {
      actorId,
      durationMs: Date.now() - started,
    }),
  };
}

async function runActorVariants(
  actorId: string,
  variants: JsonMap[],
  options: { fallbackActorId?: string; maxItems?: number; timeoutSecs?: number } = {},
): Promise<{ items: JsonMap[]; diagnostics: ProviderDiagnostic[] }> {
  const diagnostics: ProviderDiagnostic[] = [];
  const actorIds = unique([actorId, options.fallbackActorId || '']);

  for (const candidateActor of actorIds) {
    for (const input of variants) {
      try {
        const result = await runApifyActor(candidateActor, input, options);
        diagnostics.push(result.diagnostic);
        return { items: result.items, diagnostics };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const meta: Record<string, any> = { actorId: candidateActor };
        if (/TIMED[- ]?OUT|timed out|timeout/i.test(message)) meta.kind = 'timeout';
        diagnostics.push(diag('apify', 'warning', message, meta));
      }
    }
  }

  return { items: [], diagnostics };
}

async function scrapeSubject(request: IntelligencePipelineRequest, options: { competitor?: boolean; reporter?: IntelligenceProgressReporter } = {}): Promise<SubjectDataset> {
  const diagnostics: ProviderDiagnostic[] = [];
  const postActor = process.env.APIFY_INSTAGRAM_POST_ACTOR_ID || DEFAULT_POST_ACTOR;
  const commentActor = process.env.APIFY_INSTAGRAM_COMMENT_ACTOR_ID || DEFAULT_COMMENT_ACTOR;
  const likeActor = process.env.APIFY_INSTAGRAM_LIKE_ACTOR_ID || DEFAULT_LIKE_ACTOR;
  const postLimit = clamp(Number(request.count ?? (options.competitor ? process.env.COMPETITOR_POST_LIMIT || DEFAULT_COMPETITOR_POST_LIMIT : 5)), 1, 25);
  const commentLimit = clamp(Number(request.commentLimit ?? (options.competitor ? process.env.COMPETITOR_COMMENT_LIMIT || DEFAULT_COMPETITOR_COMMENT_LIMIT : 80)), 1, 500);
  const likeLimit = clamp(Number(request.likeLimit ?? (options.competitor ? 25 : 80)), 0, 500);
  const requestedUrls = (request.urls || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const originalPostUrl = request.url;

  reportProgress(options.reporter, 'source_scrape', 'running', 'Resolving source account and original Instagram target.');
  const originalRun = await runActorVariants(postActor, [
    { username: [originalPostUrl], resultsLimit: 1, dataDetailLevel: 'detailedData' },
    { directUrls: [originalPostUrl], resultsLimit: 1, dataDetailLevel: 'detailedData' },
  ], { maxItems: 1 });
  diagnostics.push(...originalRun.diagnostics);
  reportProgress(options.reporter, 'source_scrape', originalRun.items.length ? 'completed' : 'warning', `Source target resolved with ${originalRun.items.length} source item(s).`, originalRun.items.length);

  const originalPost = originalRun.items[0];
  const parsed = parseInstagramUrl(originalPostUrl);
  const requestedHandle = cleanHandle(request.handle || parsed.handle);
  const ownerHandle = cleanHandle(handleFromPost(originalPost, requestedHandle));
  const handle = parsed.isPost ? ownerHandle : (requestedHandle || ownerHandle);
  const profileUrl = handle ? `https://www.instagram.com/${handle}/` : originalPostUrl;
  const profileSeed = handle || profileUrl;
  const postSeed = request.mode === 'manual_urls' && requestedUrls.length ? requestedUrls : [profileSeed || profileUrl];

  reportProgress(options.reporter, 'post_scrape', 'running', 'Collecting Instagram post data.');
  const postsRun = await runActorVariants(postActor, [
    { username: postSeed, resultsLimit: postLimit, dataDetailLevel: 'detailedData', skipPinnedPosts: false },
    { directUrls: postSeed, resultsLimit: postLimit, dataDetailLevel: 'detailedData' },
  ], { maxItems: postLimit });
  diagnostics.push(...postsRun.diagnostics);
  reportProgress(options.reporter, 'post_scrape', postsRun.items.length ? 'completed' : 'warning', `Collected ${postsRun.items.length} Instagram post item(s).`, postsRun.items.length);

  const rawPostsByUrl = new Map<string, JsonMap>();
  [...(originalPost ? [originalPost] : []), ...postsRun.items].forEach((item, index) => {
    rawPostsByUrl.set(postUrlFromItem(item, requestedUrls[index] || originalPostUrl), item);
  });
  const rawPosts = [...rawPostsByUrl.values()];
  const postUrls = unique(rawPosts.map((item, index) => postUrlFromItem(item, requestedUrls[index] || originalPostUrl))).slice(0, postLimit + 1);

  reportProgress(options.reporter, 'comment_scrape', 'running', `Collecting comments for ${postUrls.length} Instagram post(s).`);
  const commentsRun = await runActorVariants(commentActor, [
    { directUrls: postUrls, resultsLimit: commentLimit, includeNestedComments: false },
    { postUrls, resultsLimit: commentLimit, includeNestedComments: false },
    { startUrls: postUrls.map(url => ({ url })), resultsLimit: commentLimit },
  ], { fallbackActorId: FALLBACK_COMMENT_ACTOR, maxItems: commentLimit * Math.max(postUrls.length, 1) });
  diagnostics.push(...commentsRun.diagnostics);
  reportProgress(options.reporter, 'comment_scrape', commentsRun.items.length ? 'completed' : 'warning', `Collected ${commentsRun.items.length} Instagram comment item(s).`, commentsRun.items.length);

  let rawLikes: JsonMap[] = [];
  if (likeLimit > 0) {
    const likesRun = await runActorVariants(likeActor, [
      { directUrls: postUrls, resultsLimit: likeLimit },
      { postUrls, resultsLimit: likeLimit },
      { startUrls: postUrls.map(url => ({ url })), resultsLimit: likeLimit },
    ], { maxItems: likeLimit * Math.max(postUrls.length, 1), timeoutSecs: 120 });
    rawLikes = likesRun.items;
    diagnostics.push(...likesRun.diagnostics);
  }

  let scrapedComments = commentsRun.items.map((item, index) => mapComment(item, index, postUrls[0] || originalPostUrl));
  reportProgress(options.reporter, 'comment_narratives', 'running', `Generating narratives for ${scrapedComments.length} comment(s).`, scrapedComments.length);
  const commentNarrativeRun = await enrichCommentsWithNarratives(scrapedComments);
  scrapedComments = commentNarrativeRun.comments;
  diagnostics.push(...commentNarrativeRun.diagnostics);
  const commentNarrativeOk = commentNarrativeRun.diagnostics.some(item => item.provider === 'openai' && item.status === 'ok');
  reportProgress(
    options.reporter,
    'comment_narratives',
    commentNarrativeOk || scrapedComments.every(comment => comment.narrative) ? 'completed' : 'warning',
    `Comment narratives available for ${scrapedComments.filter(comment => comment.narrative).length} comment(s).`,
    scrapedComments.length,
  );

  const narrative = buildNarrativeProfile(rawPosts, scrapedComments);
  const scrapedPosts = rawPosts.slice(0, postLimit + 1).map((item, index) => mapPost(item, index, postUrls[index] || originalPostUrl, narrative));
  const uniqueCommentersByPost = new Map<string, Set<string>>();
  for (const comment of scrapedComments) {
    if (!uniqueCommentersByPost.has(comment.postId)) uniqueCommentersByPost.set(comment.postId, new Set());
    uniqueCommentersByPost.get(comment.postId)?.add(comment.authorHandle);
  }

  const enrichedPosts = scrapedPosts.map(post => {
    const commentsForPost = scrapedComments.filter(c => c.postId === post.id);
    const split = sentimentSplit(commentsForPost.map(c => c.sentiment));
    return {
      ...post,
      commentCount: post.commentCount || commentsForPost.length,
      uniqueCommenters: uniqueCommentersByPost.get(post.id)?.size || commentsForPost.length,
      dominantSentiment: dominantSentiment(split),
      sentimentSplit: split,
      suspiciousAccountCount: commentsForPost.filter(c => c.riskFlag).length,
    };
  });

  return {
    handle,
    profileUrl,
    originalPostUrl,
    rawPosts,
    rawComments: commentsRun.items,
    rawLikes,
    scrapedPosts: enrichedPosts,
    scrapedComments,
    rawProfileRows: buildProfileRows(handle, rawPosts, commentsRun.items, rawLikes),
    rawCommentRows: commentsRun.items.map((item, index) => ({
      id: pickString(item, ['id', 'commentId'], `raw-comment-${index}`),
      ownerUsername: pickString(item, ['ownerUsername', 'username', 'owner.username', 'user.username'], `user_${index}`),
      ownerProfilePicUrl: pickString(item, ['ownerProfilePicUrl', 'profilePicUrl', 'owner.profilePicUrl', 'user.profilePicUrl'], ''),
      text: pickString(item, ['text', 'comment', 'body'], ''),
      timestamp: pickString(item, ['timestamp', 'createdAt', 'date'], nowIso()),
      postUrl: pickString(item, ['postUrl', 'url', 'inputUrl'], postUrls[0] || originalPostUrl),
    })),
    diagnostics,
  };
}

function buildProfileRows(handle: string, posts: JsonMap[], comments: JsonMap[], likes: JsonMap[]): ImportedProfileRow[] {
  const rows = new Map<string, ImportedProfileRow>();
  const add = (username: string, source: JsonMap = {}, cluster = 'Audience') => {
    const clean = cleanHandle(username);
    if (!clean || rows.has(clean)) return;
    rows.set(clean, {
      username: clean,
      full_name: pickString(source, ['fullName', 'full_name', 'ownerFullName', 'owner.fullName', 'name'], clean),
      profile_pic_url: pickString(source, ['profilePicUrl', 'ownerProfilePicUrl', 'owner.profilePicUrl', 'profile_pic_url'], ''),
      is_private: Boolean(source.isPrivate || source.private),
      is_verified: Boolean(source.verified || source.isVerified || source.ownerIsVerified),
      follower_count: pickNumber(source, ['followersCount', 'followerCount', 'ownerFollowersCount'], 0),
      is_new: false,
      latest_reel_media_utc: null,
      duplicate_flag: false,
      cluster_assignment: cluster,
    });
  };

  add(handle, posts[0], 'Primary Entity');
  posts.forEach(post => add(handleFromPost(post, handle), post, 'Primary Entity'));
  comments.forEach(comment => add(pickString(comment, ['ownerUsername', 'username', 'owner.username', 'user.username']), comment, 'Commenter'));
  likes.forEach(like => add(pickString(like, ['username', 'ownerUsername', 'user.username', 'fullName']), like, 'Engaged Liker'));
  return [...rows.values()].slice(0, 250);
}

function buildNarrativeProfile(posts: JsonMap[], comments: Array<JsonMap | ScrapedComment>): NarrativeProfile {
  const captionText = posts.map(p => pickString(p, ['caption', 'text', 'title', 'description'], '')).join('\n');
  const commentNarratives = comments
    .map(comment => {
      const mapped = comment as ScrapedComment;
      if (!mapped.narrative) return null;
      return {
        commentId: mapped.id,
        label: mapped.narrative.label,
        summary: mapped.narrative.summary,
        authorHandle: mapped.authorHandle,
        sentiment: mapped.sentiment,
        confidence: mapped.narrative.confidence,
        source: mapped.narrative.source,
      };
    })
    .filter(Boolean) as NarrativeProfile['commentNarratives'];
  const commentText = comments.map(c => pickString(c as JsonMap, ['text', 'comment', 'body'], '')).join('\n');
  const narrativeText = commentNarratives.map(item => `${item.label}: ${item.summary}`).join('\n');
  const combined = `${captionText}\n${narrativeText || commentText}`.trim();
  const keywords = topKeywords(combined, 14);
  const hashtags = unique((combined.match(/#[a-z0-9_]+/gi) || []).map(tag => tag.toLowerCase())).slice(0, 8);
  const narrativeLabels = unique(commentNarratives.map(item => item.label.toLowerCase()));
  const themes = unique([...narrativeLabels, ...hashtags.map(tag => tag.replace('#', '')), ...keywords]).slice(0, 6);
  const communicationStyle = inferCommunicationStyle(captionText);
  const sentiments = comments.map(c => {
    const mapped = c as Partial<ScrapedComment>;
    return mapped.sentiment || sentimentFromText(pickString(c as JsonMap, ['text', 'comment', 'body'], ''));
  });
  const topNarrative = commentNarratives[0]?.summary;

  return {
    coreNarrative: topNarrative
      ? `Audience narrative centers on ${topNarrative.charAt(0).toLowerCase()}${topNarrative.slice(1)}`
      : themes.length
        ? `Conversation concentrates on ${themes.slice(0, 3).join(', ')} with ${communicationStyle.toLowerCase()} messaging.`
      : 'Conversation concentrates on the submitted Instagram post and its adjacent audience response.',
    thematicPatterns: themes.length ? themes : ['community response', 'brand perception', 'content resonance'],
    audiencePositioning: inferAudiencePositioning(comments),
    communicationStyle,
    contentSignals: [
      `${posts.length} Instagram post(s) analyzed`,
      `${comments.length} audience comment(s) collected`,
      hashtags.length ? `Recurring hashtags: ${hashtags.join(', ')}` : 'No dominant hashtag cluster detected',
    ],
    keywords,
    sentimentDistribution: sentimentSplit(sentiments),
    commentNarratives,
  };
}

function inferCommunicationStyle(text: string): string {
  if (/[!?]{2,}|🔥|✨/.test(text)) return 'Expressive and high-energy';
  if (/(we|our|community|together)/i.test(text)) return 'Community-led and inclusive';
  if (/(report|announce|update|official|statement)/i.test(text)) return 'Formal and informational';
  return 'Visual-first and conversational';
}

function inferAudiencePositioning(comments: JsonMap[]): string {
  const texts = comments.map(c => pickString(c, ['text', 'comment', 'body'], '')).join('\n').toLowerCase();
  if (/(price|buy|shop|order|shipping|delivery)/.test(texts)) return 'Purchase-aware audience comparing value, trust, and operational signals.';
  if (/(policy|leader|country|public|support|against)/.test(texts)) return 'Civic and reputation-sensitive audience reacting to public-positioning signals.';
  if (/(love|cute|beautiful|amazing|friend|community)/.test(texts)) return 'Affinity-led audience with high emotional attachment and repeat engagement.';
  return 'Mixed discovery audience responding to topic clarity, creator trust, and content novelty.';
}

function sentimentSplit(sentiments: Sentiment[]): { positive: number; neutral: number; negative: number } {
  const total = Math.max(sentiments.length, 1);
  const positive = Math.round((sentiments.filter(s => s === 'positive').length / total) * 100);
  const negative = Math.round((sentiments.filter(s => s === 'negative').length / total) * 100);
  const neutral = clamp(100 - positive - negative, 0, 100);
  return { positive, neutral, negative };
}

function dominantSentiment(split: { positive: number; neutral: number; negative: number }): Sentiment {
  if (split.positive >= split.neutral && split.positive >= split.negative) return 'positive';
  if (split.negative >= split.neutral && split.negative >= split.positive) return 'negative';
  return 'neutral';
}

async function callXaiIntelligence(dataset: SubjectDataset, narrative: NarrativeProfile): Promise<{ data: XIntelligence; diagnostics: ProviderDiagnostic[] }> {
  const key = process.env.XAI_API_KEY;
  if (!key) return { data: {}, diagnostics: [diag('xai', 'warning', 'XAI_API_KEY is missing. X intelligence skipped.')] };

  const prompt = {
    task: 'Analyze this Instagram narrative across X/Twitter. Use X Search for current discussions and trend correlation. Return only valid JSON.',
    schema: {
      summary: 'string',
      publicSentiment: { positive: 'number 0-100', neutral: 'number 0-100', negative: 'number 0-100' },
      viralNarratives: [{ label: 'string', description: 'string', sentiment: 'positive|neutral|negative', momentum: 'string', keywords: ['string'] }],
      relatedDiscussions: [{ title: 'string', summary: 'string', source: 'string', url: 'string optional' }],
      crossPlatformAlignment: 'string',
      trendMomentum: 'string',
      competitors: [{ handle: 'instagram or brand handle if known', reason: 'string', positioning: 'string' }],
    },
    instagram: {
      handle: dataset.handle,
      profileUrl: dataset.profileUrl,
      postUrls: dataset.scrapedPosts.map(post => post.url),
      captions: dataset.scrapedPosts.map(post => post.caption).slice(0, 8),
      sampleComments: dataset.scrapedComments.map(comment => comment.text).slice(0, 80),
      narrative,
    },
  };

  const model = process.env.XAI_MODEL || 'grok-4.3';
  const responsesPayload = {
    model,
    input: [
      { role: 'system', content: 'You are a social intelligence analyst. Return compact valid JSON only.' },
      { role: 'user', content: JSON.stringify(prompt) },
    ],
    tools: [{ type: 'x_search' }],
    temperature: 0.2,
    max_output_tokens: 2500,
  };

  try {
    const response = await fetchWithTimeout(`${XAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(responsesPayload),
    }, envNumber('XAI_TIMEOUT_MS', DEFAULT_XAI_TIMEOUT_MS), 'Grok X responses intelligence');
    const json = await response.json();
    if (!response.ok) throw new Error(json?.error?.message || response.statusText);
    const text = extractModelText(json);
    return { data: parseJsonObject<XIntelligence>(text) || { summary: text }, diagnostics: [diag('xai', 'ok', 'Grok X Search intelligence completed.')] };
  } catch (responsesError) {
    try {
      const response = await fetchWithTimeout(`${XAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a social intelligence analyst. Return compact valid JSON only.' },
            { role: 'user', content: JSON.stringify(prompt) },
          ],
          search_parameters: {
            mode: 'on',
            sources: [{ type: 'x' }],
            max_search_results: 12,
          },
          temperature: 0.2,
          max_tokens: 2500,
        }),
      }, envNumber('XAI_TIMEOUT_MS', DEFAULT_XAI_TIMEOUT_MS), 'Grok X chat intelligence');
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message || response.statusText);
      const text = json?.choices?.[0]?.message?.content || '';
      return {
        data: parseJsonObject<XIntelligence>(text) || { summary: text },
        diagnostics: [
          diag('xai', 'warning', `Responses endpoint fallback used: ${responsesError instanceof Error ? responsesError.message : String(responsesError)}`),
          diag('xai', 'ok', 'Grok chat completions live X intelligence completed.'),
        ],
      };
    } catch (chatError) {
      return {
        data: {},
        diagnostics: [
          diag('xai', 'error', responsesError instanceof Error ? responsesError.message : String(responsesError)),
          diag('xai', 'error', chatError instanceof Error ? chatError.message : String(chatError)),
        ],
      };
    }
  }
}

async function callOpenAiWebIntelligence(dataset: SubjectDataset, narrative: NarrativeProfile, xIntel: XIntelligence): Promise<{ data: WebIntelligence; diagnostics: ProviderDiagnostic[] }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { data: {}, diagnostics: [diag('openai', 'warning', 'OPENAI_API_KEY is missing. Web intelligence skipped.')] };

  const prompt = {
    task: 'Perform broad web intelligence on this Instagram narrative. Use web search for news coverage, market narratives, industry discussions, contextual web signals, competitors, and strategy. Return only valid JSON.',
    schema: {
      summary: 'string',
      webSentiment: { positive: 'number 0-100', neutral: 'number 0-100', negative: 'number 0-100' },
      marketNarratives: ['string'],
      industryDiscussions: ['string'],
      webEvidence: [{ title: 'string', url: 'string', source_name: 'string', source_domain: 'string', source_type: 'portal|news|blog|forum|aggregator', excerpt: 'string', sentiment: 'positive|neutral|negative', relevance: 'number 0-100' }],
      brandPerception: 'string',
      marketOpportunities: ['string'],
      audienceMigrationPatterns: ['string'],
      recommendations: ['string'],
      competitors: [{ handle: 'Instagram handle or brand slug', reason: 'string', positioning: 'string' }],
    },
    instagram: {
      handle: dataset.handle,
      profileUrl: dataset.profileUrl,
      postUrls: dataset.scrapedPosts.map(post => post.url),
      captions: dataset.scrapedPosts.map(post => post.caption).slice(0, 8),
      sampleComments: dataset.scrapedComments.map(comment => comment.text).slice(0, 80),
      narrative,
      xIntel,
    },
  };

  try {
    const response = await fetchWithTimeout(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: advancedOpenAiModel(),
        input: [
          { role: 'system', content: 'You are a brand, market, and audience intelligence analyst. Return compact valid JSON only.' },
          { role: 'user', content: JSON.stringify(prompt) },
        ],
        tools: [{ type: 'web_search', search_context_size: 'medium' }],
        tool_choice: 'auto',
        include: ['web_search_call.action.sources'],
        max_output_tokens: 3000,
      }),
    }, envNumber('OPENAI_TIMEOUT_MS', DEFAULT_OPENAI_TIMEOUT_MS), 'OpenAI web intelligence');
    const json = await response.json();
    if (!response.ok) throw new Error(json?.error?.message || response.statusText);
    const text = extractModelText(json);
    return { data: parseJsonObject<WebIntelligence>(text) || { summary: text }, diagnostics: [diag('openai', 'ok', 'OpenAI web intelligence completed.')] };
  } catch (error) {
    return {
      data: {},
      diagnostics: [diag('openai', 'error', error instanceof Error ? error.message : String(error))],
    };
  }
}

function extractModelText(response: any): string {
  if (typeof response?.output_text === 'string') return response.output_text;
  const output = asArray(response?.output);
  const chunks: string[] = [];
  for (const item of output) {
    if (typeof item?.content === 'string') chunks.push(item.content);
    for (const content of asArray(item?.content)) {
      if (typeof content?.text === 'string') chunks.push(content.text);
      if (typeof content?.content === 'string') chunks.push(content.content);
    }
  }
  return chunks.join('\n').trim();
}

function parseJsonObject<T>(text: string): T | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates = [
    fenced?.[1],
    text,
    text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // Keep trying more relaxed candidates.
    }
  }
  return null;
}

function normalizeNarrativeLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}

function narrativeEvidenceFor(items: NarrativeProfile['commentNarratives']) {
  return items.slice(0, 5).map(item => ({
    commentId: item.commentId,
    label: item.label,
    summary: item.summary,
    authorHandle: item.authorHandle,
    sentiment: item.sentiment,
  }));
}

function groupedCommentNarratives(narrative: NarrativeProfile): ExtractedNarrative[] {
  const groups = new Map<string, NarrativeProfile['commentNarratives']>();
  for (const item of narrative.commentNarratives) {
    const key = normalizeNarrativeLabel(item.label || 'Audience Reaction');
    groups.set(key, [...(groups.get(key) || []), item]);
  }

  return [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 4)
    .map(([label, items], index): ExtractedNarrative => {
      const sentiments = items.map(item => item.sentiment || 'neutral');
      const sentiment = dominantSentiment(sentimentSplit(sentiments));
      const summaries = unique(items.map(item => item.summary)).slice(0, 2);
      const description = items.length > 1
        ? `${items.length} comments share this narrative: ${summaries.join(' ')}`
        : summaries[0] || `Audience comments show ${label}.`;
      const confidence = items.reduce((sum, item) => sum + (item.confidence || 0.65), 0) / Math.max(items.length, 1);
      return {
        id: `comment-narr-${index + 1}`,
        label: titleCase(label),
        description,
        keywords: unique([label, ...topKeywords(summaries.join(' '), 5)]).slice(0, 6),
        sentiment,
        confidence: clamp(confidence, 0.55, 0.96),
        commentCount: items.length,
        reachEstimate: 80000 + items.length * 15000 + index * 30000,
        pressureType: pressureTypeFromSentiment(sentiment),
        supportingComments: items.slice(0, 5).map(item => item.commentId),
        narrativeSource: items.some(item => item.source === 'ai') ? 'openai' : 'fallback',
        narrativeEvidence: narrativeEvidenceFor(items),
      };
    });
}

function buildExtractedNarratives(
  clientId: string,
  narrative: NarrativeProfile,
  xIntel: XIntelligence,
  webIntel: WebIntelligence,
): ExtractedNarrative[] {
  const grouped = groupedCommentNarratives(narrative);
  const base: ExtractedNarrative[] = grouped.length
    ? grouped
    : narrative.thematicPatterns.slice(0, 4).map((theme, index) => ({
      id: `narr-${index + 1}`,
      label: titleCase(theme),
      description: index === 0 ? narrative.coreNarrative : `Recurring audience and content pattern around ${theme}.`,
      keywords: unique([theme, ...narrative.keywords]).slice(0, 6),
      sentiment: dominantSentiment(narrative.sentimentDistribution),
      confidence: clamp(0.72 + index * 0.04, 0.65, 0.94),
      commentCount: 0,
      reachEstimate: 100000 + index * 65000,
      pressureType: pressureTypeFromSentiment(dominantSentiment(narrative.sentimentDistribution)),
      supportingComments: [],
      narrativeSource: 'fallback',
    }));

  const viral = (xIntel.viralNarratives || []).slice(0, 4).map((item, index): ExtractedNarrative => ({
    id: `x-narr-${index + 1}`,
    label: item.label || `X Narrative ${index + 1}`,
    description: item.description || item.momentum || 'Detected through Grok X Search.',
    keywords: item.keywords?.length ? item.keywords : narrative.keywords.slice(0, 5),
    sentiment: item.sentiment || dominantSentiment(xIntel.publicSentiment || narrative.sentimentDistribution),
    confidence: 0.86,
    commentCount: 0,
    reachEstimate: 250000 + index * 100000,
    pressureType: pressureTypeFromSentiment(item.sentiment || 'neutral'),
    supportingComments: [],
    narrativeSource: 'xai',
  }));

  const market = (webIntel.marketNarratives || []).slice(0, 3).map((item, index): ExtractedNarrative => ({
    id: `web-narr-${index + 1}`,
    label: titleCase(item).slice(0, 64),
    description: item,
    keywords: topKeywords(item, 6),
    sentiment: dominantSentiment(webIntel.webSentiment || narrative.sentimentDistribution),
    confidence: 0.82,
    commentCount: 0,
    reachEstimate: 180000 + index * 70000,
    pressureType: pressureTypeFromSentiment(dominantSentiment(webIntel.webSentiment || narrative.sentimentDistribution)),
    supportingComments: [],
    narrativeSource: 'web',
  }));

  return uniqueByLabel([...base, ...viral, ...market]).slice(0, 10).map((n, index) => ({ ...n, id: n.id || `narr-${clientId}-${index}` }));
}

function uniqueByLabel(items: ExtractedNarrative[]): ExtractedNarrative[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pressureTypeFromSentiment(sentiment: Sentiment): NarrativePressureType {
  if (sentiment === 'positive') return 'Positive Reinforcement';
  if (sentiment === 'negative') return 'Constructive Criticism';
  return 'Neutral/Informational';
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildNarratives(clientId: string, extracted: ExtractedNarrative[], platform: Platform = 'instagram'): Narrative[] {
  return extracted.map((item, index) => ({
    id: item.id || `n-${index}`,
    clientId,
    title: item.label,
    description: item.description,
    sentiment: item.sentiment,
    reach: item.reachEstimate,
    mentions: item.commentCount,
    sources: [platform, 'x', 'news'],
    trend: index < 3 ? 'up' : 'stable',
    signals: [],
    evidenceSnippets: item.narrativeEvidence?.length
      ? item.narrativeEvidence.map(evidence => evidence.summary)
      : item.supportingComments?.length ? item.supportingComments : item.keywords,
  }));
}

function buildWebEvidence(
  extracted: ExtractedNarrative[],
  dataset: SubjectDataset,
  xIntel: XIntelligence,
  webIntel: WebIntelligence,
): WebEvidenceHit[] {
  const primaryNarrativeId = extracted[0]?.id || 'narr-1';
  const originPostId = dataset.scrapedPosts[0]?.id || parseInstagramUrl(dataset.originalPostUrl).shortcode || 'origin';

  const webHits = (webIntel.webEvidence || []).slice(0, 12).map((hit, index): WebEvidenceHit => ({
    id: `web-${index + 1}`,
    narrativeId: extracted[index % Math.max(extracted.length, 1)]?.id || primaryNarrativeId,
    originPostId,
    sourceType: hit.source_type || inferSourceType(hit.url || hit.source_domain || ''),
    sourceName: hit.source_name || hit.source_domain || 'Web source',
    sourceDomain: hit.source_domain || domainFromUrl(hit.url || ''),
    title: hit.title || `Web signal ${index + 1}`,
    excerpt: hit.excerpt || '',
    url: hit.url || '',
    publishedAt: nowIso(),
    sentiment: hit.sentiment || 'neutral',
    relevanceScore: clamp(Number(hit.relevance || 75), 1, 100),
    pressureType: pressureTypeFromSentiment(hit.sentiment || 'neutral'),
  }));

  const xHits = (xIntel.relatedDiscussions || []).slice(0, 8).map((hit, index): WebEvidenceHit => ({
    id: `x-disc-${index + 1}`,
    narrativeId: extracted[index % Math.max(extracted.length, 1)]?.id || primaryNarrativeId,
    originPostId,
    sourceType: 'forum',
    sourceName: hit.source || 'X discussion',
    sourceDomain: hit.url ? domainFromUrl(hit.url) : 'x.com',
    title: hit.title || `X discussion ${index + 1}`,
    excerpt: hit.summary || '',
    url: hit.url || '',
    publishedAt: nowIso(),
    sentiment: 'neutral',
    relevanceScore: 80,
    pressureType: 'Neutral/Informational',
  }));

  return [...webHits, ...xHits].slice(0, 20);
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function inferSourceType(value: string): WebEvidenceHit['sourceType'] {
  if (/forum|reddit|community|x\.com|twitter/.test(value)) return 'forum';
  if (/news|press|daily|times|post|journal/.test(value)) return 'news';
  if (/blog|medium|substack/.test(value)) return 'blog';
  return 'portal';
}

function buildNetwork(
  handle: string,
  comments: ScrapedComment[],
  profiles: ImportedProfileRow[],
): { nodes: NetworkNode[]; edges: NetworkEdge[]; reviewQueue: ReviewFlag[]; intentDistribution: CommentIntentDistribution[] } {
  const primaryId = `node-${handle || 'primary'}`;
  const primaryNode: NetworkNode = {
    id: primaryId,
    handle: handle || 'primary',
    platform: 'instagram',
    nodeType: 'primary_account',
    sentiment: 'neutral',
    intent: 'Neutral',
    influenceScore: 98,
    engagementScore: 90,
    botLikelihood: 1,
    maliciousRisk: 0,
    coordinationRisk: 0,
    healthContribution: 100,
    profileMaturity: 100,
    recentCommentSnippets: [],
    connectedToPrimary: true,
    ring: 0,
  };

  const byAuthor = new Map<string, ScrapedComment[]>();
  for (const comment of comments) {
    const author = comment.authorHandle || '@unknown';
    byAuthor.set(author, [...(byAuthor.get(author) || []), comment]);
  }

  const nodes: NetworkNode[] = [primaryNode];
  const edges: NetworkEdge[] = [];
  const reviewQueue: ReviewFlag[] = [];
  let index = 0;

  for (const [author, authorComments] of byAuthor.entries()) {
    index += 1;
    const split = sentimentSplit(authorComments.map(c => c.sentiment));
    const sentiment = dominantSentiment(split);
    const profile = profiles.find(row => `@${row.username}` === author || row.username === cleanHandle(author));
    const botLikelihood = inferBotLikelihood(author, profile, authorComments);
    const coordinationRisk = inferCoordinationRisk(authorComments, comments);
    const maliciousRisk = authorComments.some(c => c.riskFlag) ? 65 : sentiment === 'negative' ? 25 : 2;
    const node: NetworkNode = {
      id: `node-commenter-${index}`,
      handle: author,
      platform: 'instagram',
      nodeType: botLikelihood > 55 ? 'possible_bot' : coordinationRisk > 60 ? 'possible_coordinated_account' : sentiment === 'negative' ? 'critical_user' : sentiment === 'positive' ? 'active_supporter' : 'neutral_observer',
      sentiment,
      intent: authorComments[0]?.intent || 'Neutral',
      influenceScore: clamp(Math.round((profile?.follower_count || 100) / 100), 5, 90),
      engagementScore: clamp(authorComments.length * 18, 20, 95),
      botLikelihood,
      maliciousRisk,
      coordinationRisk,
      healthContribution: sentiment === 'positive' ? 82 : sentiment === 'negative' ? 24 : 58,
      profileMaturity: profile?.is_new ? 20 : 75,
      recentCommentSnippets: authorComments.map(c => c.text).slice(0, 3),
      connectedToPrimary: true,
      ring: 1,
    };
    nodes.push(node);
    edges.push({ source: node.id, target: primaryId, interactionDensity: clamp(authorComments.length * 20, 10, 100), isInferred: false });
    if (botLikelihood > 55 || coordinationRisk > 60 || maliciousRisk > 60) {
      reviewQueue.push({
        id: `rf-${index}`,
        handle: author,
        riskReason: botLikelihood > 55 ? 'Automated or low-maturity account pattern' : coordinationRisk > 60 ? 'Repeated or coordinated comment behavior' : 'Potentially harmful language detected',
        botLikelihood,
        coordinationRisk,
        lastActivity: authorComments[0]?.timestamp || nowIso(),
        nodeId: node.id,
      });
    }
  }

  const intentDistribution = buildIntentDistribution(comments);
  return { nodes: nodes.slice(0, 200), edges, reviewQueue: reviewQueue.slice(0, 25), intentDistribution };
}

function inferBotLikelihood(author: string, profile: ImportedProfileRow | undefined, comments: ScrapedComment[]): number {
  let score = 3;
  if (/\d{4,}/.test(author)) score += 20;
  if ((author.match(/_/g) || []).length > 2) score += 15;
  if (profile?.is_new) score += 25;
  if (comments.length > 5) score += 10;
  if (comments.every(c => c.text.length < 12)) score += 15;
  return clamp(score, 0, 95);
}

function inferCoordinationRisk(authorComments: ScrapedComment[], allComments: ScrapedComment[]): number {
  const duplicates = authorComments.filter(comment =>
    allComments.filter(other => other.text && other.text === comment.text).length > 1,
  ).length;
  return clamp(duplicates * 35 + (authorComments.length > 6 ? 20 : 0), 0, 95);
}

function buildIntentDistribution(comments: ScrapedComment[]): CommentIntentDistribution[] {
  const total = Math.max(comments.length, 1);
  const counts = new Map<UserIntent, number>();
  comments.forEach(comment => counts.set(comment.intent, (counts.get(comment.intent) || 0) + 1));
  return [...counts.entries()].map(([intent, count]) => ({
    intent,
    count,
    percentage: Math.round((count / total) * 100),
  }));
}

function buildAudienceClusters(clientId: string, narratives: ExtractedNarrative[], comments: ScrapedComment[]): AudienceCluster[] {
  const intents = buildIntentDistribution(comments);
  const fallback = narratives.length ? narratives : [{
    id: 'cluster-narrative',
    label: 'General Audience',
    sentiment: dominantSentiment(sentimentSplit(comments.map(c => c.sentiment))),
    keywords: ['audience'],
  } as ExtractedNarrative];

  return fallback.slice(0, 5).map((narrative, index) => ({
    id: `cluster-${index + 1}`,
    clientId,
    name: `${narrative.label} Cluster`,
    size: Math.max(25, Math.round((comments.length || 1) / Math.max(fallback.length, 1)) * (index + 1)),
    activity: clamp(45 + index * 9, 0, 100),
    sentiment: narrative.sentiment,
    topTopics: narrative.narrativeEvidence?.length
      ? narrative.narrativeEvidence.map(item => item.summary).slice(0, 5)
      : narrative.keywords.slice(0, 5),
    keyVoices: comments.slice(index * 3, index * 3 + 4).map(c => c.authorHandle),
    narrativeShare: [{ narrativeId: narrative.id, share: clamp(55 - index * 8, 10, 90) }],
    lastActivity: comments[index]?.timestamp || nowIso(),
    coordinates: { x: 20 + index * 16, y: 40 + (index % 2) * 18 },
  })).concat(
    intents.slice(0, 2).map((intent, index) => ({
      id: `cluster-intent-${index + 1}`,
      clientId,
      name: `${intent.intent} Intent`,
      size: intent.count,
      activity: intent.percentage,
      sentiment: 'neutral' as Sentiment,
      topTopics: [intent.intent],
      keyVoices: [],
      narrativeShare: [],
      lastActivity: nowIso(),
      coordinates: { x: 70 + index * 12, y: 25 + index * 20 },
    })),
  );
}

function buildAccountHealth(comments: ScrapedComment[], reviewQueue: ReviewFlag[], split: { positive: number; neutral: number; negative: number }): AccountHealthScore {
  const suspicious = comments.length ? Math.round((reviewQueue.length / comments.length) * 100) : 0;
  const score = clamp(70 + split.positive * 0.25 - split.negative * 0.35 - suspicious * 0.5, 1, 100);
  return {
    score: Math.round(score),
    status: score > 84 ? 'Stable' : score > 65 ? 'Watch' : score > 45 ? 'At Risk' : 'Under Pressure',
    ratios: {
      positiveSupporter: split.positive,
      neutralAudience: split.neutral,
      criticalPressure: split.negative,
      suspiciousActivity: suspicious,
      coordinatedRisk: reviewQueue.filter(item => item.coordinationRisk > 60).length,
    },
    metrics: {
      engagementAuthenticity: clamp(100 - suspicious, 1, 100),
      narrativeStability: clamp(100 - split.negative, 1, 100),
      communityResilience: clamp(55 + split.positive - split.negative, 1, 100),
    },
  };
}

function buildReportMetrics(posts: ScrapedPost[], comments: ScrapedComment[], narratives: ExtractedNarrative[], accountHealth: AccountHealthScore, reviewQueue: ReviewFlag[]): ReportMetrics {
  const split = sentimentSplit(comments.map(c => c.sentiment));
  return {
    totalPostsAnalyzed: posts.length,
    totalCommentsCollected: comments.length,
    totalUniqueCommentersMapped: new Set(comments.map(c => c.authorHandle)).size,
    sentimentDistribution: split,
    dominantNarratives: narratives.map(n => n.label).slice(0, 6),
    accountHealthScore: accountHealth.score,
    suspiciousReviewCount: reviewQueue.length,
    narrativeStability: accountHealth.metrics.narrativeStability,
    engagementAuthenticity: accountHealth.metrics.engagementAuthenticity,
    reportReadiness: 100,
  };
}

function buildContentSuggestions(clientId: string, recommendations: string[]): ContentSuggestion[] {
  return recommendations.slice(0, 5).map((rec, index) => ({
    id: `strategy-${index + 1}`,
    clientId,
    campaignId: 'c1',
    type: 'Discussion Starter',
    content: rec,
    goal: 'Content strategy recommendation',
    tone: 'Strategic',
    platform: 'instagram',
    risk: 'low',
    status: 'pending',
    strategistNotes: 'Generated from cross-platform intelligence pipeline.',
  }));
}

function normalizeOpenAiCompetitor(value: unknown, targetHandle: string): OpenAiCompetitorCandidate | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as JsonMap;
  const name = pickString(item, ['name', 'brandName', 'brand_name'], '');
  const profileUrl = pickString(item, ['profileUrl', 'profile_url', 'instagramProfileUrl', 'instagram_profile_url'], '');
  const websiteUrl = pickString(item, ['websiteUrl', 'website_url', 'officialWebsite', 'official_website', 'url'], '');
  const instagramHandle = cleanHandle(pickString(item, ['handle', 'instagramHandle', 'instagram_handle'], '') || profileUrl);
  const fallbackHandle = cleanHandle(name) || domainFromUrl(websiteUrl).replace(/\.[a-z]+$/i, '').replace(/[^a-z0-9._]/gi, '_');
  const handle = instagramHandle || fallbackHandle;
  if (!handle || handle.toLowerCase() === targetHandle.toLowerCase()) return null;
  const hasInstagram = profileUrl && /instagram\.com/i.test(profileUrl);
  const normalizedProfileUrl = hasInstagram
    ? profileUrl
    : '';
  const normalizedWebsiteUrl = /^https?:\/\//i.test(websiteUrl) ? websiteUrl : '';

  const rawEvidence = [
    ...asArray(item.evidenceUrls),
    ...asArray(item.evidence_urls),
    pickString(item, ['evidenceUrl', 'evidence_url'], ''),
    normalizedWebsiteUrl,
  ];
  const evidenceUrls = unique(
    rawEvidence
      .map(url => String(url || '').trim())
      .filter(url => /^https?:\/\//i.test(url)),
  ).slice(0, 5);
  if (!evidenceUrls.length) return null;
  if (!normalizedProfileUrl && !normalizedWebsiteUrl) return null;

  const rawScope = pickString(item, ['marketScope', 'market_scope', 'scope'], 'global').toLowerCase();
  const marketScope: CompetitorMarketScope =
    rawScope.includes('origin') || rawScope.includes('local') ? 'origin'
      : rawScope.includes('eu') || rawScope.includes('europe') ? 'eu'
        : rawScope.includes('us') || rawScope.includes('usa') || rawScope.includes('america') ? 'us'
          : 'global';

  const confidenceValue = pickNumber(item, ['confidence'], 0.68);
  return {
    name: name || handle,
    handle,
    profileUrl: normalizedProfileUrl || normalizedWebsiteUrl,
    websiteUrl: normalizedWebsiteUrl,
    evidenceUrls,
    reason: pickString(item, ['overlapReason', 'overlap_reason', 'reason'], 'OpenAI verified audience and market overlap.'),
    positioning: pickString(item, ['positioningSummary', 'positioning_summary', 'positioning'], 'OpenAI verified adjacent market position.'),
    confidence: clamp(confidenceValue > 1 ? confidenceValue / 100 : confidenceValue, 0.1, 1),
    marketScope,
    country: pickString(item, ['country', 'marketCountry', 'market_country'], ''),
    category: pickString(item, ['category', 'productCategory', 'product_category'], ''),
    searchQuery: pickString(item, ['searchQuery', 'search_query', 'queryUsed', 'query_used'], ''),
  };
}

function webEvidenceForCandidate(
  competitor: OpenAiCompetitorCandidate,
  clientId: string,
): { narratives: ExtractedNarrative[]; evidence: WebEvidenceHit[] } {
  const narrativeId = `competitor-web-${competitor.handle}`;
  const narrative: ExtractedNarrative = {
    id: narrativeId,
    label: competitor.name,
    description: competitor.positioning,
    keywords: topKeywords(`${competitor.name} ${competitor.category || ''} ${competitor.positioning}`, 6),
    sentiment: 'neutral',
    confidence: competitor.confidence,
    commentCount: 0,
    reachEstimate: 100000,
    pressureType: 'Neutral/Informational',
    supportingComments: [],
    narrativeSource: 'openai',
  };
  const evidence = competitor.evidenceUrls.map((url, index): WebEvidenceHit => ({
    id: `competitor-${competitor.handle}-evidence-${index + 1}`,
    narrativeId,
    originPostId: competitor.handle,
    sourceType: inferSourceType(url),
    sourceName: domainFromUrl(url) || competitor.name,
    sourceDomain: domainFromUrl(url),
    title: `${competitor.name} competitor evidence`,
    excerpt: competitor.reason,
    url,
    publishedAt: nowIso(),
    sentiment: 'neutral',
    relevanceScore: Math.round(competitor.confidence * 100),
    pressureType: 'Neutral/Informational',
  }));
  return {
    narratives: [{ ...narrative, id: `${narrativeId}-${clientId}` }],
    evidence,
  };
}

function webOnlyCompetitorProfile(
  competitor: OpenAiCompetitorCandidate,
  clientId: string,
): CompetitorProfileInsight {
  const web = webEvidenceForCandidate(competitor, clientId);
  return {
    handle: competitor.handle,
    profileUrl: competitor.profileUrl,
    websiteUrl: competitor.websiteUrl,
    reason: competitor.reason,
    scrapedPosts: [],
    scrapedComments: [],
    extractedNarratives: web.narratives,
    webEvidence: web.evidence,
    accountHealth: {
      score: 70,
      status: 'Watch',
      ratios: { positiveSupporter: 0, neutralAudience: 100, criticalPressure: 0, suspiciousActivity: 0, coordinatedRisk: 0 },
      metrics: { engagementAuthenticity: 70, narrativeStability: 70, communityResilience: 70 },
    },
    positioningSummary: competitor.positioning,
    overlapScore: Math.round(competitor.confidence * 100),
    opportunitySignals: [],
    evidenceUrls: competitor.evidenceUrls,
    confidence: competitor.confidence,
    discoverySource: 'openai',
    verificationState: 'web-verified',
    topNarrative: competitor.positioning,
    narrativePressure: competitor.reason,
    counterPosition: `Study ${competitor.name}'s offer, proof, and positioning, then adapt the strongest idea with your own evidence and brand voice.`,
    battlefieldSummary: `${competitor.name} is a ${competitor.marketScope || 'global'} competitor in ${competitor.category || 'the same category'}: ${competitor.reason}`,
    marketScope: competitor.marketScope,
    country: competitor.country,
    category: competitor.category,
    searchQuery: competitor.searchQuery,
  };
}

async function discoverCompetitorsWithOpenAi(
  dataset: SubjectDataset,
  narrative: NarrativeProfile,
  xIntel: XIntelligence,
  webIntel: WebIntelligence,
  count: number,
): Promise<{ competitors: OpenAiCompetitorCandidate[]; diagnostics: ProviderDiagnostic[] }> {
  if (count <= 0) return { competitors: [], diagnostics: [] };
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      competitors: [],
      diagnostics: [diag('openai', 'warning', 'OPENAI_API_KEY is missing. Competitor discovery skipped; no competitors invented.')],
    };
  }

  const model = advancedOpenAiModel();
  const prompt = {
    task: 'Find real, web-verified business competitors for this target. First infer the target category, origin country/market, and local language from the brand, domain hints, captions, comments, and web evidence. Then search origin-market competitors plus EU and US benchmark competitors. Return only valid JSON.',
    schema: {
      marketContext: {
        category: 'product/service category',
        originCountry: 'country where the brand appears to originate or primarily sell',
        originLanguage: 'local search language',
        localizedSearchQueries: ['translated local-category queries with country words, local TLDs, and buying intent'],
        euSearchQueries: ['EU benchmark competitor queries'],
        usSearchQueries: ['US benchmark competitor queries'],
      },
      competitors: [{
        name: 'brand/business name',
        handle: 'Instagram handle without @',
        profileUrl: 'Instagram profile URL if found, otherwise empty string',
        websiteUrl: 'official website/product page if found',
        marketScope: 'origin|eu|us|global',
        country: 'competitor country or market',
        category: 'shared product/service category',
        searchQuery: 'query or strategy that found this competitor',
        evidenceUrls: ['web source URL proving product/category/audience overlap'],
        overlapReason: 'why this is a real competitor for the same market or audience',
        positioningSummary: 'short competitor positioning summary',
        confidence: 'number 0-1',
      }],
    },
    target: {
      handle: dataset.handle,
      profileUrl: dataset.profileUrl,
      captions: dataset.scrapedPosts.map(post => post.caption).slice(0, 8),
      commentNarratives: narrative.commentNarratives.slice(0, 80),
      topNarratives: narrative.thematicPatterns,
      categorySignals: unique([
        ...narrative.thematicPatterns,
        ...narrative.keywords,
        ...dataset.scrapedPosts.flatMap(post => post.dominantNarratives || []),
      ]).slice(0, 20),
      webEvidence: webIntel.webEvidence?.slice(0, 8),
      webCompetitorHints: webIntel.competitors?.slice(0, 8),
      xCompetitorHints: xIntel.competitors?.slice(0, 8),
    },
    rules: [
      'A competitor can be verified by official website/product page or Instagram profile; Instagram is preferred but not required.',
      'Each competitor must include at least one evidence URL and either websiteUrl or profileUrl.',
      'For origin-market search, translate the product/service category into the local language and include local country words or local TLD signals.',
      'For a Serbian brand, for example, search Serbian phrases such as the translated product category plus "Srbija" and also local .rs results.',
      'Also include EU and US competitors as benchmark markets when the category has meaningful international alternatives.',
      'Only return direct competitors or close substitutes with product/category/audience overlap.',
      'If competitors cannot be verified, return an empty competitors array.',
    ],
    maxCompetitors: count,
  };

  try {
    const response = await fetchWithTimeout(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: 'You are a competitive intelligence researcher. Return compact valid JSON only.' },
          { role: 'user', content: JSON.stringify(prompt) },
        ],
        tools: [{ type: 'web_search', search_context_size: 'medium' }],
        tool_choice: 'auto',
        include: ['web_search_call.action.sources'],
        max_output_tokens: 3500,
      }),
    }, envNumber('OPENAI_COMPETITOR_DISCOVERY_TIMEOUT_MS', DEFAULT_OPENAI_TIMEOUT_MS), 'OpenAI competitor discovery');
    const json = await response.json();
    if (!response.ok) throw new Error(json?.error?.message || response.statusText);
    const parsed = parseJsonObject<{ competitors?: unknown[] }>(extractModelText(json));
    const candidates = asArray(parsed?.competitors)
      .map(item => normalizeOpenAiCompetitor(item, dataset.handle))
      .filter(Boolean) as OpenAiCompetitorCandidate[];
    const seen = new Set<string>();
    const competitors = candidates.filter(item => {
      const key = item.handle.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, count);

    return {
      competitors,
      diagnostics: [
        competitors.length
          ? diag('openai', 'ok', `OpenAI competitor discovery completed with ${competitors.length} verified competitor(s).`, { model })
          : diag('openai', 'warning', 'OpenAI competitor discovery completed but returned no verified Instagram competitors.', { model }),
      ],
    };
  } catch (error) {
    return {
      competitors: [],
      diagnostics: [diag('openai', 'error', `OpenAI competitor discovery failed: ${error instanceof Error ? error.message : String(error)}`, { model })],
    };
  }
}

async function analyzeCompetitor(
  competitor: OpenAiCompetitorCandidate,
  clientId: string,
  primaryNarrative: NarrativeProfile,
): Promise<CompetitorProfileInsight> {
  if (!/instagram\.com/i.test(competitor.profileUrl)) {
    return webOnlyCompetitorProfile(competitor, clientId);
  }

  const dataset = await scrapeSubject({
    url: competitor.profileUrl,
    handle: competitor.handle,
    mode: 'latest_n',
    count: Number(process.env.COMPETITOR_POST_LIMIT || DEFAULT_COMPETITOR_POST_LIMIT),
    commentLimit: Number(process.env.COMPETITOR_COMMENT_LIMIT || DEFAULT_COMPETITOR_COMMENT_LIMIT),
    includeCompetitors: false,
  }, { competitor: true });
  const narrative = buildNarrativeProfile(dataset.rawPosts, dataset.scrapedComments);
  const xIntel = await callXaiIntelligence(dataset, narrative);
  const webIntel = await callOpenAiWebIntelligence(dataset, narrative, xIntel.data);
  const extracted = buildExtractedNarratives(clientId, narrative, xIntel.data, webIntel.data).slice(0, 5);
  const competitorEvidence = buildWebEvidence(extracted, dataset, xIntel.data, webIntel.data).slice(0, 6);
  const network = buildNetwork(dataset.handle, dataset.scrapedComments, dataset.rawProfileRows);
  const health = buildAccountHealth(dataset.scrapedComments, network.reviewQueue, sentimentSplit(dataset.scrapedComments.map(c => c.sentiment)));
  const overlapScore = calculateOverlapScore(extracted.map(n => n.label), primaryNarrative.thematicPatterns);
  const topNarrative = extracted[0]?.description || narrative.coreNarrative;
  const pressure = extracted.find(item => item.sentiment === 'negative') || extracted[0];

  return {
    handle: dataset.handle || competitor.handle,
    profileUrl: dataset.profileUrl || competitor.profileUrl,
    websiteUrl: competitor.websiteUrl,
    reason: competitor.reason,
    scrapedPosts: dataset.scrapedPosts,
    scrapedComments: dataset.scrapedComments,
    extractedNarratives: extracted,
    webEvidence: competitorEvidence,
    accountHealth: health,
    positioningSummary: competitor.positioning || webIntel.data.brandPerception || xIntel.data.crossPlatformAlignment || narrative.coreNarrative,
    overlapScore,
    opportunitySignals: webIntel.data.marketOpportunities || [],
    evidenceUrls: unique([...competitor.evidenceUrls, ...competitorEvidence.map(item => item.url)]).filter(Boolean).slice(0, 8),
    confidence: competitor.confidence,
    discoverySource: 'openai',
    verificationState: 'verified',
    topNarrative,
    narrativePressure: pressure ? `${pressure.label}: ${pressure.description}` : narrative.coreNarrative,
    counterPosition: `Counter @${competitor.handle} by making the brand's proof points clearer than ${competitor.positioning}.`,
    battlefieldSummary: `${competitor.positioning} ${competitor.reason}`,
    marketScope: competitor.marketScope,
    country: competitor.country,
    category: competitor.category,
    searchQuery: competitor.searchQuery,
  };
}

function calculateOverlapScore(a: string[], b: string[]): number {
  const aSet = new Set(a.flatMap(item => tokenize(item)));
  const bSet = new Set(b.flatMap(item => tokenize(item)));
  const intersection = [...aSet].filter(item => bSet.has(item)).length;
  const union = new Set([...aSet, ...bSet]).size || 1;
  return Math.round((intersection / union) * 100);
}

function buildStrategicLayer(
  dataset: SubjectDataset,
  narrative: NarrativeProfile,
  xIntel: XIntelligence,
  webIntel: WebIntelligence,
  competitors: CompetitorProfileInsight[],
  metrics: ReportMetrics,
): StrategicIntelligenceLayer {
  const competitorSummary = competitors.length
    ? competitors.map(c => `@${c.handle}: ${c.positioningSummary}`).join(' | ')
    : 'No OpenAI-verified competitors found in this run.';

  return {
    audienceStatusOverview: `${metrics.totalUniqueCommentersMapped} mapped commenters across ${metrics.totalPostsAnalyzed} Instagram post(s), with ${metrics.sentimentDistribution.positive}% positive and ${metrics.sentimentDistribution.negative}% negative sentiment.`,
    brandPositioningAnalysis: webIntel.brandPerception || narrative.audiencePositioning,
    competitorPositioningComparison: competitorSummary,
    narrativeOverlapAndDifferentiation: competitors.length
      ? `Primary themes: ${narrative.thematicPatterns.join(', ')}. Competitor overlap ranges from ${competitors.map(c => `${c.handle} ${c.overlapScore}%`).join(', ')}.`
      : `Primary themes: ${narrative.thematicPatterns.join(', ')}.`,
    marketOpportunitySignals: webIntel.marketOpportunities?.length ? webIntel.marketOpportunities : ['Increase content around the highest-engagement narrative cluster.', 'Clarify proof points where audience skepticism appears.'],
    audienceMigrationPatterns: webIntel.audienceMigrationPatterns?.length ? webIntel.audienceMigrationPatterns : ['Watch adjacent profiles for shared commenters and topic drift.'],
    contentStrategyRecommendations: webIntel.recommendations?.length ? webIntel.recommendations : ['Publish follow-up content that directly answers the most repeated audience question.', 'Convert the strongest narrative into a recurring content series.'],
    crossPlatformNarrativeAlignment: xIntel.crossPlatformAlignment || 'Cross-platform alignment could not be fully established from available X signals.',
    webSentimentAndTopicPositioning: webIntel.summary || 'Web topic positioning is available in the evidence table.',
    trendMomentumAnalysis: xIntel.trendMomentum || 'Trend momentum is stable pending additional X signals.',
    brandPerceptionInsights: webIntel.brandPerception || narrative.coreNarrative,
    xIntelligenceSummary: xIntel.summary,
    webIntelligenceSummary: webIntel.summary,
  };
}

function textList(value: unknown, fallback: string[], limit = 4): string[] {
  const items = asArray(value)
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .slice(0, limit);
  return items.length ? items : fallback.slice(0, limit);
}

function confidenceValue(value: unknown, fallback: number): number {
  const raw = typeof value === 'number' ? value : Number(value);
  const normalized = Number.isFinite(raw) ? raw : fallback;
  return clamp(normalized > 1 ? normalized / 100 : normalized, 0.1, 1);
}

function evidenceList(value: unknown, fallback: string[], limit = 4): string[] {
  const items = asArray(value)
    .map(item => String(item || '').trim())
    .filter(Boolean);
  return unique(items.length ? items : fallback).slice(0, limit);
}

function topCompetitorPosts(competitor: CompetitorProfileInsight): ScrapedPost[] {
  return [...competitor.scrapedPosts]
    .sort((a, b) => ((b.likeCount || 0) + (b.commentCount || 0) * 4) - ((a.likeCount || 0) + (a.commentCount || 0) * 4))
    .slice(0, 5);
}

function competitorEvidenceFallback(competitor: CompetitorProfileInsight): string[] {
  const topPost = topCompetitorPosts(competitor)[0];
  return unique([
    topPost?.caption,
    competitor.topNarrative,
    competitor.extractedNarratives[0]?.description,
    ...(competitor.evidenceUrls || []),
  ]).filter(Boolean).slice(0, 4);
}

function inferHookStyle(caption: string): string {
  if (/\?/.test(caption)) return 'Question-led hook that invites the audience to respond.';
  if (/\b(how to|how we|tips|ways|steps)\b/i.test(caption)) return 'Educational hook framed as useful advice.';
  if (/\b(before|after|result|proof|case study|customer)\b/i.test(caption)) return 'Proof-led hook that makes the outcome visible.';
  if (/\b(new|launch|limited|today|now)\b/i.test(caption)) return 'Timely announcement hook with urgency.';
  return 'Simple brand-story hook that keeps the message easy to understand.';
}

function inferProofMechanism(competitor: CompetitorProfileInsight): string {
  const text = `${competitor.scrapedPosts.map(post => post.caption).join(' ')} ${competitor.scrapedComments.map(comment => comment.text).join(' ')}`;
  if (/\b(before|after|result|results|case study|transformation)\b/i.test(text)) return 'Visible before/after or result proof.';
  if (/\b(review|testimonial|customer|client|people say)\b/i.test(text)) return 'Customer language and social proof.';
  if (/\b(number|percent|data|report|study|tested)\b/i.test(text)) return 'Specific numbers or tested claims.';
  if (competitor.extractedNarratives.some(item => item.sentiment === 'positive')) return 'Positive audience reactions as credibility proof.';
  return 'Repeated clarity and consistency across posts.';
}

function inferCtaPattern(caption: string): string {
  if (/\b(dm|message|inbox)\b/i.test(caption)) return 'DM-first conversion prompt.';
  if (/\b(comment|tell us|share|reply)\b/i.test(caption)) return 'Comment-first engagement prompt.';
  if (/\b(shop|order|buy|book|reserve|link)\b/i.test(caption)) return 'Direct action prompt toward purchase or booking.';
  if (/\b(follow|save|subscribe)\b/i.test(caption)) return 'Retention prompt to save, follow, or return.';
  return 'Soft CTA that keeps the conversation open.';
}

function fallbackStealPlays(competitor: CompetitorProfileInsight): CompetitorStealPlay[] {
  const topPost = topCompetitorPosts(competitor)[0];
  const evidence = competitorEvidenceFallback(competitor);
  const positiveComment = competitor.scrapedComments.find(comment => comment.sentiment === 'positive')?.narrative?.summary;
  const curiousComment = competitor.scrapedComments.find(comment => comment.intent === 'Curious')?.narrative?.summary;
  const confidence = competitor.confidence ?? 0.52;
  return [
    {
      title: 'Adapt their strongest proof angle',
      whyItWorks: positiveComment || competitor.topNarrative || 'Their audience responds when the value is made concrete.',
      howToAdapt: 'Create your own proof-led post using real customer outcomes, delivery details, or visible product/service results.',
      evidence,
      confidence,
      source: 'fallback',
      competitorHandle: competitor.handle,
    },
    {
      title: 'Turn audience questions into content',
      whyItWorks: curiousComment || 'Repeated questions reveal buying friction that can become useful content.',
      howToAdapt: 'Publish a short explainer that answers the most repeated objection before the audience has to ask.',
      evidence: evidenceList([curiousComment, topPost?.caption], evidence, 3),
      confidence: clamp(confidence - 0.08, 0.35, 0.8),
      source: 'fallback',
      competitorHandle: competitor.handle,
    },
  ];
}

function fallbackAudienceGaps(competitor: CompetitorProfileInsight): CompetitorAudienceGap[] {
  const praised = unique(competitor.scrapedComments
    .filter(comment => comment.sentiment === 'positive')
    .map(comment => comment.narrative?.summary || comment.text)
    .filter(Boolean)).slice(0, 3);
  const askedFor = unique(competitor.scrapedComments
    .filter(comment => comment.intent === 'Curious')
    .map(comment => comment.narrative?.summary || comment.text)
    .filter(Boolean)).slice(0, 3);
  const complaints = unique(competitor.scrapedComments
    .filter(comment => comment.sentiment === 'negative')
    .map(comment => comment.narrative?.summary || comment.text)
    .filter(Boolean)).slice(0, 3);
  return [{
    praised: praised.length ? praised : ['Audience reacts positively when the competitor makes the benefit easy to understand.'],
    askedFor: askedFor.length ? askedFor : ['Audience questions are limited in the sampled comments.'],
    complaints: complaints.length ? complaints : ['No repeated complaint pattern was strong enough in the sampled comments.'],
    opportunity: `Use @${competitor.handle}'s visible praise and questions to identify what your content should clarify, prove, or simplify.`,
    evidence: competitorEvidenceFallback(competitor),
    confidence: competitor.confidence ?? 0.5,
    source: 'fallback',
  }];
}

function fallbackContentPatterns(competitor: CompetitorProfileInsight): CompetitorContentPattern[] {
  const topPost = topCompetitorPosts(competitor)[0];
  const caption = topPost?.caption || competitor.positioningSummary;
  return [{
    winningFormat: 'High-engagement Instagram post pattern',
    hookStyle: inferHookStyle(caption),
    proofMechanism: inferProofMechanism(competitor),
    ctaPattern: inferCtaPattern(caption),
    cadenceSignal: `${competitor.scrapedPosts.length} recent competitor post(s) scanned for repeatable content signals.`,
    recommendedAdaptation: 'Build a recurring post template around this pattern, but use your own proof, customer language, and offer.',
    evidence: competitorEvidenceFallback(competitor),
    confidence: competitor.confidence ?? 0.5,
    source: 'fallback',
  }];
}

function normalizeStealPlays(value: unknown, fallback: CompetitorStealPlay[], handle: string, source: CompetitorStealPlay['source']): CompetitorStealPlay[] {
  const items = asArray(value).map((entry): CompetitorStealPlay | null => {
    if (!entry || typeof entry !== 'object') return null;
    const item = entry as JsonMap;
    const title = pickString(item, ['title'], '');
    const whyItWorks = pickString(item, ['whyItWorks', 'why_it_works'], '');
    const howToAdapt = pickString(item, ['howToAdapt', 'how_to_adapt'], '');
    if (!title || !whyItWorks || !howToAdapt) return null;
    return {
      title,
      whyItWorks,
      howToAdapt,
      evidence: evidenceList(item.evidence, fallback[0]?.evidence || [], 4),
      confidence: confidenceValue(item.confidence, fallback[0]?.confidence ?? 0.62),
      source,
      competitorHandle: handle,
    };
  }).filter(Boolean) as CompetitorStealPlay[];
  return items.length ? items.slice(0, 3) : fallback;
}

function normalizeAudienceGaps(value: unknown, fallback: CompetitorAudienceGap[], source: CompetitorAudienceGap['source']): CompetitorAudienceGap[] {
  const items = asArray(value).map((entry): CompetitorAudienceGap | null => {
    if (!entry || typeof entry !== 'object') return null;
    const item = entry as JsonMap;
    const opportunity = pickString(item, ['opportunity'], '');
    if (!opportunity) return null;
    return {
      praised: textList(item.praised, fallback[0]?.praised || [], 3),
      askedFor: textList(item.askedFor ?? item.asked_for, fallback[0]?.askedFor || [], 3),
      complaints: textList(item.complaints, fallback[0]?.complaints || [], 3),
      opportunity,
      evidence: evidenceList(item.evidence, fallback[0]?.evidence || [], 4),
      confidence: confidenceValue(item.confidence, fallback[0]?.confidence ?? 0.6),
      source,
    };
  }).filter(Boolean) as CompetitorAudienceGap[];
  return items.length ? items.slice(0, 2) : fallback;
}

function normalizeContentPatterns(value: unknown, fallback: CompetitorContentPattern[], source: CompetitorContentPattern['source']): CompetitorContentPattern[] {
  const items = asArray(value).map((entry): CompetitorContentPattern | null => {
    if (!entry || typeof entry !== 'object') return null;
    const item = entry as JsonMap;
    const winningFormat = pickString(item, ['winningFormat', 'winning_format'], '');
    const recommendedAdaptation = pickString(item, ['recommendedAdaptation', 'recommended_adaptation'], '');
    if (!winningFormat || !recommendedAdaptation) return null;
    return {
      winningFormat,
      hookStyle: pickString(item, ['hookStyle', 'hook_style'], fallback[0]?.hookStyle || 'Clear audience hook.'),
      proofMechanism: pickString(item, ['proofMechanism', 'proof_mechanism'], fallback[0]?.proofMechanism || 'Audience response proof.'),
      ctaPattern: pickString(item, ['ctaPattern', 'cta_pattern'], fallback[0]?.ctaPattern || 'Soft CTA.'),
      cadenceSignal: pickString(item, ['cadenceSignal', 'cadence_signal'], fallback[0]?.cadenceSignal || 'Cadence signal pending.'),
      recommendedAdaptation,
      evidence: evidenceList(item.evidence, fallback[0]?.evidence || [], 4),
      confidence: confidenceValue(item.confidence, fallback[0]?.confidence ?? 0.6),
      source,
    };
  }).filter(Boolean) as CompetitorContentPattern[];
  return items.length ? items.slice(0, 2) : fallback;
}

function normalizePosture(value: unknown, fallback: BrandPositionDecisionSynthesis['posture']): BrandPositionDecisionSynthesis['posture'] {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('repair')) return 'Repair';
  if (normalized.includes('reposition')) return 'Reposition';
  if (normalized.includes('grow')) return 'Grow';
  if (normalized.includes('defend')) return 'Defend';
  return fallback;
}

function fallbackAdvancedSynthesis(
  dataset: SubjectDataset,
  narrative: NarrativeProfile,
  competitors: CompetitorProfileInsight[],
  accountHealth: AccountHealthScore,
  metrics: ReportMetrics,
): AdvancedStrategicSynthesis {
  const highOverlap = competitors.find(competitor => competitor.overlapScore >= 60);
  const posture: BrandPositionDecisionSynthesis['posture'] =
    accountHealth.status === 'Under Pressure' || metrics.sentimentDistribution.negative >= 35
      ? 'Repair'
      : highOverlap
        ? 'Defend'
        : metrics.sentimentDistribution.positive >= metrics.sentimentDistribution.negative + 15
          ? 'Grow'
          : 'Reposition';

  const primaryPositive = narrative.commentNarratives.find(item => item.sentiment === 'positive')?.summary;
  const primaryPressure = narrative.commentNarratives.find(item => item.sentiment === 'negative')?.summary;
  const competitorPressures = competitors.length
    ? competitors.map(competitor => `@${competitor.handle}: ${competitor.positioningSummary}`)
    : ['No OpenAI-verified competitor pressure was available in this run.'];

  return {
    brandPosition: {
      posture,
      confidence: 0.54,
      positionThesis: `${dataset.handle || 'The target account'} should ${posture.toLowerCase()} around ${narrative.thematicPatterns.slice(0, 2).join(' and ') || 'its strongest audience meaning'} while closing the clearest audience proof gap.`,
      proofPoints: textList([primaryPositive, narrative.audiencePositioning, `${metrics.totalCommentsCollected} comment(s) analyzed`], ['Audience proof points are limited until OpenAI synthesis completes.'], 4),
      priorityActions: [
        primaryPressure ? `Answer the friction narrative: ${primaryPressure}` : 'Publish proof-led follow-up content for the strongest narrative.',
        highOverlap ? `Differentiate against @${highOverlap.handle} with sharper evidence and creator proof.` : 'Keep competitor monitoring evidence-first and avoid guessed threats.',
        'Convert the clearest audience question into a recurring content format.',
      ],
      narrativeLevers: narrative.thematicPatterns.slice(0, 4),
      competitorPressures,
      recommendation: 'Use the fallback briefing as a low-confidence draft until advanced OpenAI synthesis is available.',
      source: 'fallback',
    },
    competitors: competitors.map((competitor): CompetitorBattlecardSynthesis => {
      const stealPlays = fallbackStealPlays(competitor);
      const audienceGaps = fallbackAudienceGaps(competitor);
      const contentPatterns = fallbackContentPatterns(competitor);
      return {
        handle: competitor.handle,
        battlefieldSummary: competitor.battlefieldSummary || `${competitor.positioningSummary} ${competitor.reason}`,
        topNarrative: competitor.topNarrative || competitor.extractedNarratives[0]?.description || competitor.positioningSummary,
        narrativePressure: competitor.narrativePressure || competitor.reason,
        counterPosition: competitor.counterPosition || `Differentiate against @${competitor.handle} with evidence-led proof and clearer audience outcomes.`,
        overlapScore: competitor.overlapScore,
        confidence: competitor.confidence ?? 0.54,
        evidenceUrls: competitor.evidenceUrls ?? competitor.webEvidence.map(item => item.url).filter(Boolean),
        verificationState: competitor.verificationState ?? 'verified',
        source: 'fallback',
        stealPlays,
        audienceGaps,
        contentPatterns,
        marketScope: competitor.marketScope,
        country: competitor.country,
        category: competitor.category,
        searchQuery: competitor.searchQuery,
      };
    }),
  };
}

async function buildAdvancedStrategicSynthesis(
  dataset: SubjectDataset,
  narrative: NarrativeProfile,
  extractedNarratives: ExtractedNarrative[],
  competitors: CompetitorProfileInsight[],
  webEvidence: WebEvidenceHit[],
  accountHealth: AccountHealthScore,
  audienceClusters: AudienceCluster[],
  strategic: StrategicIntelligenceLayer,
  metrics: ReportMetrics,
): Promise<{ data: AdvancedStrategicSynthesis; diagnostics: ProviderDiagnostic[] }> {
  const fallback = fallbackAdvancedSynthesis(dataset, narrative, competitors, accountHealth, metrics);
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      data: fallback,
      diagnostics: [diag('openai', 'warning', 'OPENAI_API_KEY is missing. Advanced brand and competitor synthesis used fallback output.')],
    };
  }

  const model = advancedOpenAiModel();
  const prompt = {
    task: 'Create a decision-maker brand position thesis and competitive battlefield synthesis. Use the provided evidence only. Return compact valid JSON.',
    schema: {
      brandPosition: {
        posture: 'Defend|Grow|Reposition|Repair',
        confidence: 'number 0-1',
        positionThesis: 'one sharp executive thesis',
        proofPoints: ['evidence-backed points supporting the thesis'],
        priorityActions: ['ranked actions for the next 7-14 days'],
        narrativeLevers: ['narrative levers to amplify or correct'],
        competitorPressures: ['pressure summaries from verified competitors only'],
        recommendation: 'one final recommendation',
      },
      competitors: [{
        handle: 'existing verified competitor handle only',
        battlefieldSummary: 'one sentence battlecard summary',
        topNarrative: 'competitor audience narrative',
        narrativePressure: 'how this competitor pressures the target',
        counterPosition: 'recommended counter-position',
        overlapScore: 'number 0-100',
        confidence: 'number 0-1',
        stealPlays: [{
          title: 'short tactic worth adapting',
          whyItWorks: 'why competitor audience responds to it',
          howToAdapt: 'ethical adaptation for the target business',
          evidence: ['caption, comment narrative, post metric, or source URL supporting this play'],
          confidence: 'number 0-1',
        }],
        audienceGaps: [{
          praised: ['what competitor audience praises'],
          askedFor: ['what competitor audience asks for'],
          complaints: ['what competitor audience complains about'],
          opportunity: 'what the target business can capture or clarify',
          evidence: ['comment narrative or post evidence'],
          confidence: 'number 0-1',
        }],
        contentPatterns: [{
          winningFormat: 'repeatable content format or pattern',
          hookStyle: 'how posts open or frame attention',
          proofMechanism: 'what makes the claim believable',
          ctaPattern: 'how the competitor asks for action',
          cadenceSignal: 'posting/repetition signal visible in scraped posts',
          recommendedAdaptation: 'how target should adapt this pattern',
          evidence: ['caption, metric, or comment evidence'],
          confidence: 'number 0-1',
        }],
      }],
    },
    target: {
      handle: dataset.handle,
      profileUrl: dataset.profileUrl,
      accountHealth,
      reportMetrics: metrics,
      captions: dataset.scrapedPosts.map(post => post.caption).slice(0, 8),
      narratives: extractedNarratives.slice(0, 8).map(item => ({
        id: item.id,
        label: item.label,
        description: item.description,
        sentiment: item.sentiment,
        confidence: item.confidence,
        evidence: item.narrativeEvidence?.slice(0, 4),
      })),
      audienceClusters: audienceClusters.slice(0, 6),
      webEvidence: webEvidence.slice(0, 10).map(item => ({
        title: item.title,
        url: item.url,
        excerpt: item.excerpt,
        relevance: item.relevanceScore,
      })),
      strategicLayer: strategic,
    },
    verifiedCompetitors: competitors.map(competitor => ({
      handle: competitor.handle,
      profileUrl: competitor.profileUrl,
      websiteUrl: competitor.websiteUrl,
      reason: competitor.reason,
      positioningSummary: competitor.positioningSummary,
      overlapScore: competitor.overlapScore,
      confidence: competitor.confidence,
      evidenceUrls: competitor.evidenceUrls,
      marketScope: competitor.marketScope,
      country: competitor.country,
      category: competitor.category,
      searchQuery: competitor.searchQuery,
      accountHealth: competitor.accountHealth,
      postSignals: topCompetitorPosts(competitor).map(post => ({
        url: post.url,
        caption: post.caption,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        engagementQuality: post.engagementQuality,
        sentiment: post.dominantSentiment,
        narratives: post.dominantNarratives,
      })),
      commentSignals: competitor.scrapedComments.slice(0, 75).map(comment => ({
        id: comment.id,
        text: comment.text.slice(0, 400),
        sentiment: comment.sentiment,
        intent: comment.intent,
        narrative: comment.narrative,
      })),
      webEvidence: competitor.webEvidence.slice(0, 6).map(item => ({
        title: item.title,
        url: item.url,
        excerpt: item.excerpt,
        relevance: item.relevanceScore,
      })),
      topNarratives: competitor.extractedNarratives.slice(0, 4).map(item => ({
        label: item.label,
        description: item.description,
        sentiment: item.sentiment,
      })),
    })),
    rules: [
      'Do not add competitors not present in verifiedCompetitors.',
      'For stealPlays, recommend ethical adaptation only; do not copy exact wording, assets, identity, or creative.',
      'Every steal play, audience gap, and content pattern must cite evidence from captions, post metrics, comment narratives, or evidence URLs.',
      'Prefer concise, boardroom-ready language.',
      'Tie actions to audience narratives, competitor pressure, or evidence.',
      'If competitor evidence is empty, say no verified competitor pressure is available.',
    ],
  };

  try {
    const response = await fetchWithTimeout(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: 'You are a senior brand strategist and competitive intelligence analyst. Return compact valid JSON only.' },
          { role: 'user', content: JSON.stringify(prompt) },
        ],
        max_output_tokens: 3500,
      }),
    }, envNumber('OPENAI_ADVANCED_ANALYSIS_TIMEOUT_MS', DEFAULT_OPENAI_TIMEOUT_MS), 'OpenAI advanced brand and competitor synthesis');
    const json = await response.json();
    if (!response.ok) throw new Error(json?.error?.message || response.statusText);
    const parsed = parseJsonObject<any>(extractModelText(json));
    if (!parsed || typeof parsed !== 'object') throw new Error('OpenAI returned no parseable synthesis JSON.');

    const brand = parsed.brandPosition || {};
    const fallbackBrand = fallback.brandPosition;
    const confidenceValue = pickNumber(brand, ['confidence'], fallbackBrand.confidence);
    const verifiedHandles = new Set(competitors.map(competitor => competitor.handle.toLowerCase()));
    const fallbackBattlecards = new Map(fallback.competitors.map(competitor => [competitor.handle.toLowerCase(), competitor]));
    const battlecards = asArray(parsed.competitors)
      .map((item): CompetitorBattlecardSynthesis | null => {
        if (!item || typeof item !== 'object') return null;
        const source = item as JsonMap;
        const handle = cleanHandle(pickString(source, ['handle'], ''));
        if (!handle || !verifiedHandles.has(handle.toLowerCase())) return null;
        const fallbackCard = fallbackBattlecards.get(handle.toLowerCase());
        const sourceProfile = competitors.find(competitor => competitor.handle.toLowerCase() === handle.toLowerCase());
        const fallbackSteals = fallbackCard?.stealPlays || (sourceProfile ? fallbackStealPlays(sourceProfile) : []);
        const fallbackGaps = fallbackCard?.audienceGaps || (sourceProfile ? fallbackAudienceGaps(sourceProfile) : []);
        const fallbackPatterns = fallbackCard?.contentPatterns || (sourceProfile ? fallbackContentPatterns(sourceProfile) : []);
        const rawConfidence = pickNumber(source, ['confidence'], fallbackCard?.confidence ?? sourceProfile?.confidence ?? 0.62);
        return {
          handle,
          battlefieldSummary: pickString(source, ['battlefieldSummary', 'battlefield_summary'], fallbackCard?.battlefieldSummary || sourceProfile?.positioningSummary || ''),
          topNarrative: pickString(source, ['topNarrative', 'top_narrative'], fallbackCard?.topNarrative || sourceProfile?.topNarrative || ''),
          narrativePressure: pickString(source, ['narrativePressure', 'narrative_pressure'], fallbackCard?.narrativePressure || sourceProfile?.reason || ''),
          counterPosition: pickString(source, ['counterPosition', 'counter_position'], fallbackCard?.counterPosition || sourceProfile?.counterPosition || ''),
          overlapScore: clamp(pickNumber(source, ['overlapScore', 'overlap_score'], sourceProfile?.overlapScore ?? fallbackCard?.overlapScore ?? 0), 0, 100),
          confidence: clamp(rawConfidence > 1 ? rawConfidence / 100 : rawConfidence, 0.1, 1),
          evidenceUrls: sourceProfile?.evidenceUrls ?? fallbackCard?.evidenceUrls ?? [],
          verificationState: sourceProfile?.verificationState ?? 'verified',
          source: 'openai',
          stealPlays: normalizeStealPlays(source.stealPlays ?? source.steal_plays, fallbackSteals, handle, 'openai'),
          audienceGaps: normalizeAudienceGaps(source.audienceGaps ?? source.audience_gaps, fallbackGaps, 'openai'),
          contentPatterns: normalizeContentPatterns(source.contentPatterns ?? source.content_patterns, fallbackPatterns, 'openai'),
          marketScope: sourceProfile?.marketScope ?? fallbackCard?.marketScope,
          country: sourceProfile?.country ?? fallbackCard?.country,
          category: sourceProfile?.category ?? fallbackCard?.category,
          searchQuery: sourceProfile?.searchQuery ?? fallbackCard?.searchQuery,
        };
      })
      .filter(Boolean) as CompetitorBattlecardSynthesis[];

    return {
      data: {
        brandPosition: {
          posture: normalizePosture(brand.posture, fallbackBrand.posture),
          confidence: clamp(confidenceValue > 1 ? confidenceValue / 100 : confidenceValue, 0.1, 1),
          positionThesis: pickString(brand, ['positionThesis', 'position_thesis'], fallbackBrand.positionThesis),
          proofPoints: textList(brand.proofPoints ?? brand.proof_points, fallbackBrand.proofPoints, 5),
          priorityActions: textList(brand.priorityActions ?? brand.priority_actions, fallbackBrand.priorityActions, 5),
          narrativeLevers: textList(brand.narrativeLevers ?? brand.narrative_levers, fallbackBrand.narrativeLevers, 5),
          competitorPressures: textList(brand.competitorPressures ?? brand.competitor_pressures, fallbackBrand.competitorPressures, 4),
          recommendation: pickString(brand, ['recommendation'], fallbackBrand.recommendation),
          source: 'openai',
          model,
        },
        competitors: battlecards.length ? battlecards : fallback.competitors,
      },
      diagnostics: [diag('openai', 'ok', 'OpenAI advanced brand and competitor synthesis completed.', { model })],
    };
  } catch (error) {
    return {
      data: fallback,
      diagnostics: [diag('openai', 'warning', `Advanced OpenAI synthesis fell back locally: ${error instanceof Error ? error.message : String(error)}`, { model })],
    };
  }
}

function mergeCompetitorBattlecards(
  competitors: CompetitorProfileInsight[],
  battlecards: CompetitorBattlecardSynthesis[],
): CompetitorProfileInsight[] {
  const byHandle = new Map(battlecards.map(item => [item.handle.toLowerCase(), item]));
  return competitors.map(competitor => {
    const battlecard = byHandle.get(competitor.handle.toLowerCase());
    if (!battlecard) return competitor;
    return {
      ...competitor,
      battlefieldSummary: battlecard.battlefieldSummary || competitor.battlefieldSummary,
      topNarrative: battlecard.topNarrative || competitor.topNarrative,
      narrativePressure: battlecard.narrativePressure || competitor.narrativePressure,
      counterPosition: battlecard.counterPosition || competitor.counterPosition,
      overlapScore: typeof battlecard.overlapScore === 'number' ? battlecard.overlapScore : competitor.overlapScore,
      confidence: typeof battlecard.confidence === 'number' ? battlecard.confidence : competitor.confidence,
      evidenceUrls: battlecard.evidenceUrls?.length ? battlecard.evidenceUrls : competitor.evidenceUrls,
      verificationState: battlecard.verificationState ?? competitor.verificationState,
      stealPlays: battlecard.stealPlays?.length ? battlecard.stealPlays : competitor.stealPlays,
      audienceGaps: battlecard.audienceGaps?.length ? battlecard.audienceGaps : competitor.audienceGaps,
      contentPatterns: battlecard.contentPatterns?.length ? battlecard.contentPatterns : competitor.contentPatterns,
      marketScope: battlecard.marketScope ?? competitor.marketScope,
      country: battlecard.country ?? competitor.country,
      category: battlecard.category ?? competitor.category,
      searchQuery: battlecard.searchQuery ?? competitor.searchQuery,
    };
  });
}

function buildSourceRuns(sessionId: string, dataset: SubjectDataset, xOk: boolean, openAiOk: boolean): SourceRun[] {
  return [
    {
      id: `sr-instagram-${sessionId}`,
      sessionId,
      source: 'instagram',
      status: 'completed',
      progress: 100,
      recordsCollected: dataset.scrapedPosts.length + dataset.scrapedComments.length,
      startTime: nowIso(),
      lastSync: nowIso(),
    },
    {
      id: `sr-x-${sessionId}`,
      sessionId,
      source: 'x',
      status: xOk ? 'completed' : 'warning',
      progress: xOk ? 100 : 50,
      recordsCollected: xOk ? 1 : 0,
      startTime: nowIso(),
      lastSync: nowIso(),
      errors: xOk ? undefined : ['Grok/X intelligence returned warnings or errors.'],
    },
    {
      id: `sr-news-${sessionId}`,
      sessionId,
      source: 'news',
      status: openAiOk ? 'completed' : 'warning',
      progress: openAiOk ? 100 : 50,
      recordsCollected: openAiOk ? 1 : 0,
      startTime: nowIso(),
      lastSync: nowIso(),
      errors: openAiOk ? undefined : ['OpenAI web intelligence returned warnings or errors.'],
    },
  ];
}

function buildParallelTasks(dataset: SubjectDataset, xOk: boolean, openAiOk: boolean, competitorCount: number) {
  return [
    { id: 'task-ig-profile', label: 'Instagram Profile Scan', status: 'completed' as const, progress: 100, recordsCount: dataset.rawProfileRows.length, lastEvent: 'PROFILE_RESOLVED' },
    { id: 'task-ig-posts', label: 'Instagram Post Collection', status: 'completed' as const, progress: 100, recordsCount: dataset.scrapedPosts.length, lastEvent: 'POSTS_INDEXED' },
    { id: 'task-ig-comments', label: 'Instagram Comment Collection', status: 'completed' as const, progress: 100, recordsCount: dataset.scrapedComments.length, lastEvent: 'COMMENTS_CAPTURED' },
    { id: 'task-narrative', label: 'Narrative Extraction', status: 'completed' as const, progress: 100, recordsCount: 1, lastEvent: 'NARRATIVE_MODEL_BUILT' },
    { id: 'task-xai', label: 'Grok X Intelligence', status: xOk ? 'completed' as const : 'warning' as const, progress: xOk ? 100 : 60, recordsCount: xOk ? 1 : 0, lastEvent: xOk ? 'X_SEARCH_DONE' : 'X_SEARCH_WARN' },
    { id: 'task-openai', label: 'OpenAI Web Intelligence', status: openAiOk ? 'completed' as const : 'warning' as const, progress: openAiOk ? 100 : 60, recordsCount: openAiOk ? 1 : 0, lastEvent: openAiOk ? 'WEB_SEARCH_DONE' : 'WEB_SEARCH_WARN' },
    { id: 'task-map', label: 'Audience Mapping', status: 'completed' as const, progress: 100, recordsCount: dataset.rawProfileRows.length, lastEvent: 'NETWORK_READY' },
    { id: 'task-competitors', label: 'Competitor Discovery', status: 'completed' as const, progress: 100, recordsCount: competitorCount, lastEvent: 'COMPETITORS_SYNCED' },
    { id: 'task-report', label: 'Report Assembly', status: 'completed' as const, progress: 100, recordsCount: 1, lastEvent: 'BRIEF_READY' },
  ];
}

export async function runIntelligencePipeline(
  request: IntelligencePipelineRequest,
  reporter?: IntelligenceProgressReporter,
): Promise<IntelligencePipelineResult> {
  const clientId = request.clientId || '1';
  const sessionId = `server-${Date.now()}`;
  const diagnostics: ProviderDiagnostic[] = [];

  reportProgress(reporter, 'target_validation', 'running', 'Validating Instagram target and scan settings.');
  reportProgress(reporter, 'target_validation', 'completed', `Target accepted in ${request.mode || 'latest_n'} mode.`);

  const dataset = await scrapeSubject({
    ...request,
    mode: request.mode || 'latest_n',
    count: request.count || 5,
    source: 'instagram',
  }, { reporter });
  diagnostics.push(...dataset.diagnostics);

  reportProgress(reporter, 'grouped_narratives', 'running', 'Grouping comment narratives into dominant audience themes.', dataset.scrapedComments.length);
  const narrativeProfile = buildNarrativeProfile(dataset.rawPosts, dataset.scrapedComments);
  const primaryNarratives = buildExtractedNarratives(clientId, narrativeProfile, {}, {}).filter(item => item.id.startsWith('comment-narr'));
  reportProgress(reporter, 'grouped_narratives', 'completed', `Grouped ${primaryNarratives.length || narrativeProfile.thematicPatterns.length} primary narrative theme(s).`, primaryNarratives.length || narrativeProfile.thematicPatterns.length);

  reportProgress(reporter, 'x_signals', 'running', 'Searching X / Grok signals for cross-platform alignment.');
  const xIntel = request.includeXSearch === false
    ? { data: {} as XIntelligence, diagnostics: [diag('xai', 'warning', 'X/Twitter narrative search skipped by scan settings.')] }
    : await callXaiIntelligence(dataset, narrativeProfile);
  diagnostics.push(...xIntel.diagnostics);
  const xOk = xIntel.diagnostics.some(d => d.provider === 'xai' && d.status === 'ok');
  reportProgress(reporter, 'x_signals', xOk ? 'completed' : 'warning', xOk ? 'Grok X intelligence completed.' : 'Grok X intelligence returned warnings.', xOk ? 1 : 0);

  reportProgress(reporter, 'web_evidence', 'running', 'Searching web evidence and market context.');
  const webIntel = request.includeWebSearch === false
    ? { data: {} as WebIntelligence, diagnostics: [diag('openai', 'warning', 'Web intelligence search skipped by scan settings.')] }
    : await callOpenAiWebIntelligence(dataset, narrativeProfile, xIntel.data);
  diagnostics.push(...webIntel.diagnostics);
  const openAiOk = webIntel.diagnostics.some(d => d.provider === 'openai' && d.status === 'ok');
  reportProgress(reporter, 'web_evidence', openAiOk ? 'completed' : 'warning', openAiOk ? 'OpenAI web intelligence completed.' : 'OpenAI web intelligence returned warnings.', openAiOk ? 1 : 0);

  const competitorCount = clamp(Number(request.competitorCount ?? 3), 0, 3);
  reportProgress(reporter, 'discover_competitors', 'running', `Discovering up to ${competitorCount} competitor profile(s).`);
  const competitorDiscovery = request.includeCompetitors === false
    ? {
      competitors: [] as OpenAiCompetitorCandidate[],
      diagnostics: [diag('openai', 'warning', 'Competitor discovery skipped by scan settings. No competitors invented.')],
    }
    : await discoverCompetitorsWithOpenAi(dataset, narrativeProfile, xIntel.data, webIntel.data, competitorCount);
  diagnostics.push(...competitorDiscovery.diagnostics);
  const discovered = competitorDiscovery.competitors;
  const competitorDiscoveryOk = competitorDiscovery.diagnostics.some(item => item.provider === 'openai' && item.status === 'ok');
  reportProgress(
    reporter,
    'discover_competitors',
    competitorDiscoveryOk ? 'completed' : 'warning',
    discovered.length
      ? `OpenAI verified ${discovered.length} competitor profile(s).`
      : 'No OpenAI-verified competitors found.',
    discovered.length,
  );

  let competitorProfiles: CompetitorProfileInsight[] = [];
  reportProgress(reporter, 'analyze_competitors', 'running', discovered.length ? `Analyzing ${discovered.length} competitor profile(s).` : 'No competitor profiles to analyze.', discovered.length);
  for (const competitor of discovered) {
    try {
      reportProgress(reporter, 'analyze_competitors', 'running', `Analyzing competitor @${competitor.handle}.`, competitorProfiles.length);
      competitorProfiles.push(await withTimeout(
        analyzeCompetitor(competitor, clientId, narrativeProfile),
        envNumber('COMPETITOR_ANALYSIS_TIMEOUT_MS', DEFAULT_COMPETITOR_TIMEOUT_MS),
        `Competitor @${competitor.handle} analysis`,
      ));
      diagnostics.push(diag('system', 'ok', `Competitor @${competitor.handle} analyzed.`));
    } catch (error) {
      diagnostics.push(diag('system', 'warning', `Competitor @${competitor.handle} could not be fully analyzed: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
  reportProgress(reporter, 'analyze_competitors', 'completed', `Competitor layer analyzed ${competitorProfiles.length} profile(s).`, competitorProfiles.length);

  const extractedNarratives = buildExtractedNarratives(clientId, narrativeProfile, xIntel.data, webIntel.data);
  const narratives = buildNarratives(clientId, extractedNarratives);
  const webEvidence = buildWebEvidence(extractedNarratives, dataset, xIntel.data, webIntel.data);
  reportProgress(reporter, 'audience_status', 'running', 'Building audience network, account health, and status metrics.', dataset.scrapedComments.length);
  const network = buildNetwork(dataset.handle, dataset.scrapedComments, dataset.rawProfileRows);
  const split = sentimentSplit(dataset.scrapedComments.map(comment => comment.sentiment));
  const accountHealth = buildAccountHealth(dataset.scrapedComments, network.reviewQueue, split);
  const reportMetrics = buildReportMetrics(dataset.scrapedPosts, dataset.scrapedComments, extractedNarratives, accountHealth, network.reviewQueue);
  let strategicIntelligence = buildStrategicLayer(dataset, narrativeProfile, xIntel.data, webIntel.data, competitorProfiles, reportMetrics);
  const audienceClusters = buildAudienceClusters(clientId, extractedNarratives, dataset.scrapedComments);
  reportProgress(reporter, 'audience_status', 'completed', `Audience status built with ${network.nodes.length} node(s).`, network.nodes.length);

  reportProgress(reporter, 'brand_position', 'running', 'Running advanced OpenAI brand position and competitive battlefield synthesis.');
  const advancedSynthesis = await buildAdvancedStrategicSynthesis(
    dataset,
    narrativeProfile,
    extractedNarratives,
    competitorProfiles,
    webEvidence,
    accountHealth,
    audienceClusters,
    strategicIntelligence,
    reportMetrics,
  );
  diagnostics.push(...advancedSynthesis.diagnostics);
  competitorProfiles = mergeCompetitorBattlecards(competitorProfiles, advancedSynthesis.data.competitors);
  const advancedWarning = advancedSynthesis.diagnostics.find(item => item.status !== 'ok');
  strategicIntelligence = {
    ...strategicIntelligence,
    competitorPositioningComparison: competitorProfiles.length
      ? competitorProfiles.map(competitor => `@${competitor.handle}: ${competitor.battlefieldSummary || competitor.positioningSummary}`).join(' | ')
      : 'No OpenAI-verified competitors found.',
    brandPositionDecision: advancedSynthesis.data.brandPosition,
    competitorBattlecards: advancedSynthesis.data.competitors,
    advancedAnalysisSource: advancedSynthesis.data.brandPosition.source,
    advancedAnalysisModel: advancedSynthesis.data.brandPosition.model,
    advancedAnalysisWarning: advancedWarning?.message,
  };

  reportProgress(reporter, 'brand_position', 'running', 'Assembling brand position, recommendations, and report package.');
  const sourceRuns = buildSourceRuns(sessionId, dataset, xOk, openAiOk);
  const contentSuggestions = buildContentSuggestions(clientId, strategicIntelligence.contentStrategyRecommendations);
  const events = [
    createEvent(`Instagram profile @${dataset.handle || 'unknown'} scraped and normalized.`, 'collection', 'low'),
    createEvent(`Narrative model extracted ${extractedNarratives.length} dominant pattern(s).`, 'analysis', 'medium'),
    createEvent(`Grok X intelligence ${xOk ? 'completed' : 'returned warnings'}.`, 'analysis', xOk ? 'low' : 'medium'),
    createEvent(`OpenAI web intelligence ${openAiOk ? 'completed' : 'returned warnings'}.`, 'analysis', openAiOk ? 'low' : 'medium'),
    createEvent(`OpenAI competitor discovery ${competitorDiscoveryOk ? 'completed' : 'returned no verified competitors or warnings'}.`, 'analysis', competitorDiscoveryOk ? 'low' : 'medium'),
    createEvent(`Advanced OpenAI synthesis ${advancedSynthesis.data.brandPosition.source === 'openai' ? 'completed' : 'used fallback'}.`, 'analysis', advancedSynthesis.data.brandPosition.source === 'openai' ? 'low' : 'medium'),
    createEvent(`Competitor layer analyzed ${competitorProfiles.length} verified profile(s).`, 'analysis', competitorProfiles.length ? 'medium' : 'low'),
  ];
  reportProgress(reporter, 'brand_position', 'completed', 'Report package assembled. Brand position package ready for briefing.', 1);

  return {
    session: {
      clientId,
      primaryProfileUrl: dataset.profileUrl,
      accountHandle: dataset.handle,
      platform: 'instagram',
      scrapeMode: request.mode || 'latest_n',
      postCount: dataset.scrapedPosts.length,
      postUrls: dataset.scrapedPosts.map(post => post.url),
      sources: { posts: true, comments: true, mentions: true, portals: true, forums: true },
      status: 'completed',
      currentStage: 'completed',
      progress: 100,
      updatedAt: nowIso(),
      parallelTasks: buildParallelTasks(dataset, xOk, openAiOk, competitorProfiles.length),
      scrapedPosts: dataset.scrapedPosts,
      scrapedComments: dataset.scrapedComments,
      extractedNarratives,
      webEvidence,
      narratives,
      networkNodes: network.nodes,
      networkEdges: network.edges,
      accountHealth,
      reviewQueue: network.reviewQueue,
      reportMetrics,
      responsePlan: { suggestions: contentSuggestions },
      approvals: [],
      supervision: { actionQueue: [], completedActions: [], failedActions: [], alerts: [], responderGroupHealth: {} },
      events,
      rawProfileRows: dataset.rawProfileRows,
      rawCommentRows: dataset.rawCommentRows,
      audienceClusters,
      intentDistribution: network.intentDistribution,
      strategicIntelligence,
      competitorProfiles,
      providerDiagnostics: diagnostics,
    },
    sourceRuns,
    audienceClusters,
    intentDistribution: network.intentDistribution,
  };
}
