import type {
  AccountHealthScore,
  AudienceCluster,
  CommentIntentDistribution,
  CompetitorProfileInsight,
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

const nowIso = () => new Date().toISOString();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
  const keywords = narrative?.keywords?.slice(0, 3) || topKeywords(caption, 3);

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
    dominantNarratives: keywords.length ? keywords : ['General Discussion'],
    narratives: keywords.length ? keywords : ['General Discussion'],
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
  const actorTimeoutSecs = options.timeoutSecs || envNumber('APIFY_SYNC_TIMEOUT_SECONDS', 180);
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
        diagnostics.push(diag('apify', 'warning', error instanceof Error ? error.message : String(error), { actorId: candidateActor }));
      }
    }
  }

  return { items: [], diagnostics };
}

async function scrapeSubject(request: IntelligencePipelineRequest, options: { competitor?: boolean } = {}): Promise<SubjectDataset> {
  const diagnostics: ProviderDiagnostic[] = [];
  const postActor = process.env.APIFY_INSTAGRAM_POST_ACTOR_ID || DEFAULT_POST_ACTOR;
  const commentActor = process.env.APIFY_INSTAGRAM_COMMENT_ACTOR_ID || DEFAULT_COMMENT_ACTOR;
  const likeActor = process.env.APIFY_INSTAGRAM_LIKE_ACTOR_ID || DEFAULT_LIKE_ACTOR;
  const postLimit = clamp(Number(request.count ?? (options.competitor ? process.env.COMPETITOR_POST_LIMIT || 3 : 5)), 1, 25);
  const commentLimit = clamp(Number(request.commentLimit ?? (options.competitor ? process.env.COMPETITOR_COMMENT_LIMIT || 20 : 80)), 1, 500);
  const likeLimit = clamp(Number(request.likeLimit ?? (options.competitor ? 25 : 80)), 0, 500);
  const requestedUrls = (request.urls || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const originalPostUrl = request.url;

  const originalRun = await runActorVariants(postActor, [
    { username: [originalPostUrl], resultsLimit: 1, dataDetailLevel: 'detailedData' },
    { directUrls: [originalPostUrl], resultsLimit: 1, dataDetailLevel: 'detailedData' },
  ], { maxItems: 1 });
  diagnostics.push(...originalRun.diagnostics);

  const originalPost = originalRun.items[0];
  const parsed = parseInstagramUrl(originalPostUrl);
  const requestedHandle = cleanHandle(request.handle || parsed.handle);
  const ownerHandle = cleanHandle(handleFromPost(originalPost, requestedHandle));
  const handle = parsed.isPost ? ownerHandle : (requestedHandle || ownerHandle);
  const profileUrl = handle ? `https://www.instagram.com/${handle}/` : originalPostUrl;
  const profileSeed = handle || profileUrl;
  const postSeed = request.mode === 'manual_urls' && requestedUrls.length ? requestedUrls : [profileSeed || profileUrl];

  const postsRun = await runActorVariants(postActor, [
    { username: postSeed, resultsLimit: postLimit, dataDetailLevel: 'detailedData', skipPinnedPosts: false },
    { directUrls: postSeed, resultsLimit: postLimit, dataDetailLevel: 'detailedData' },
  ], { maxItems: postLimit });
  diagnostics.push(...postsRun.diagnostics);

  const rawPostsByUrl = new Map<string, JsonMap>();
  [...(originalPost ? [originalPost] : []), ...postsRun.items].forEach((item, index) => {
    rawPostsByUrl.set(postUrlFromItem(item, requestedUrls[index] || originalPostUrl), item);
  });
  const rawPosts = [...rawPostsByUrl.values()];
  const postUrls = unique(rawPosts.map((item, index) => postUrlFromItem(item, requestedUrls[index] || originalPostUrl))).slice(0, postLimit + 1);

  const commentsRun = await runActorVariants(commentActor, [
    { directUrls: postUrls, resultsLimit: commentLimit, includeNestedComments: false },
    { postUrls, resultsLimit: commentLimit, includeNestedComments: false },
    { startUrls: postUrls.map(url => ({ url })), resultsLimit: commentLimit },
  ], { fallbackActorId: FALLBACK_COMMENT_ACTOR, maxItems: commentLimit * Math.max(postUrls.length, 1) });
  diagnostics.push(...commentsRun.diagnostics);

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

  const narrative = buildNarrativeProfile(rawPosts, commentsRun.items);
  const scrapedPosts = rawPosts.slice(0, postLimit + 1).map((item, index) => mapPost(item, index, postUrls[index] || originalPostUrl, narrative));
  const scrapedComments = commentsRun.items.map((item, index) => mapComment(item, index, postUrls[0] || originalPostUrl));
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

function buildNarrativeProfile(posts: JsonMap[], comments: JsonMap[]): NarrativeProfile {
  const captionText = posts.map(p => pickString(p, ['caption', 'text', 'title', 'description'], '')).join('\n');
  const commentText = comments.map(c => pickString(c, ['text', 'comment', 'body'], '')).join('\n');
  const combined = `${captionText}\n${commentText}`.trim();
  const keywords = topKeywords(combined, 14);
  const hashtags = unique((combined.match(/#[a-z0-9_]+/gi) || []).map(tag => tag.toLowerCase())).slice(0, 8);
  const themes = unique([...hashtags.map(tag => tag.replace('#', '')), ...keywords]).slice(0, 6);
  const communicationStyle = inferCommunicationStyle(captionText);
  const sentiments = comments.map(c => sentimentFromText(pickString(c, ['text', 'comment', 'body'], '')));

  return {
    coreNarrative: themes.length
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
        model: process.env.OPENAI_MODEL || 'gpt-5.5',
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

function buildExtractedNarratives(
  clientId: string,
  narrative: NarrativeProfile,
  xIntel: XIntelligence,
  webIntel: WebIntelligence,
): ExtractedNarrative[] {
  const base: ExtractedNarrative[] = narrative.thematicPatterns.slice(0, 4).map((theme, index) => ({
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
    evidenceSnippets: item.supportingComments?.length ? item.supportingComments : item.keywords,
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
    topTopics: narrative.keywords.slice(0, 5),
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

function discoverCompetitors(xIntel: XIntelligence, webIntel: WebIntelligence, count: number): Array<{ handle: string; reason: string; positioning: string }> {
  const candidates = [...(webIntel.competitors || []), ...(xIntel.competitors || [])]
    .map(item => ({
      handle: cleanHandle(item.handle),
      reason: item.reason || 'Detected as adjacent or competing profile.',
      positioning: item.positioning || 'Adjacent audience and topic position.',
    }))
    .filter(item => item.handle && !/instagram\.com|http/.test(item.handle));

  const seen = new Set<string>();
  return candidates.filter(item => {
    const key = item.handle.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, count);
}

async function analyzeCompetitor(
  competitor: { handle: string; reason: string; positioning: string },
  clientId: string,
): Promise<CompetitorProfileInsight> {
  const dataset = await scrapeSubject({
    url: `https://www.instagram.com/${competitor.handle}/`,
    handle: competitor.handle,
    mode: 'latest_n',
    count: Number(process.env.COMPETITOR_POST_LIMIT || 3),
    commentLimit: Number(process.env.COMPETITOR_COMMENT_LIMIT || 20),
    includeCompetitors: false,
  }, { competitor: true });
  const narrative = buildNarrativeProfile(dataset.rawPosts, dataset.rawComments);
  const xIntel = await callXaiIntelligence(dataset, narrative);
  const webIntel = await callOpenAiWebIntelligence(dataset, narrative, xIntel.data);
  const extracted = buildExtractedNarratives(clientId, narrative, xIntel.data, webIntel.data).slice(0, 5);
  const network = buildNetwork(dataset.handle, dataset.scrapedComments, dataset.rawProfileRows);
  const health = buildAccountHealth(dataset.scrapedComments, network.reviewQueue, sentimentSplit(dataset.scrapedComments.map(c => c.sentiment)));

  return {
    handle: dataset.handle || competitor.handle,
    profileUrl: dataset.profileUrl,
    reason: competitor.reason,
    scrapedPosts: dataset.scrapedPosts,
    scrapedComments: dataset.scrapedComments,
    extractedNarratives: extracted,
    webEvidence: buildWebEvidence(extracted, dataset, xIntel.data, webIntel.data).slice(0, 6),
    accountHealth: health,
    positioningSummary: competitor.positioning || webIntel.data.brandPerception || xIntel.data.crossPlatformAlignment || narrative.coreNarrative,
    overlapScore: calculateOverlapScore(extracted.map(n => n.label), narrative.thematicPatterns),
    opportunitySignals: webIntel.data.marketOpportunities || [],
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
    : 'No competitor profiles completed in this run.';

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

export async function runIntelligencePipeline(request: IntelligencePipelineRequest): Promise<IntelligencePipelineResult> {
  const clientId = request.clientId || '1';
  const sessionId = `server-${Date.now()}`;
  const diagnostics: ProviderDiagnostic[] = [];

  const dataset = await scrapeSubject({
    ...request,
    mode: request.mode || 'latest_n',
    count: request.count || 5,
    source: 'instagram',
  });
  diagnostics.push(...dataset.diagnostics);

  const narrativeProfile = buildNarrativeProfile(dataset.rawPosts, dataset.rawComments);
  const xIntel = request.includeXSearch === false
    ? { data: {} as XIntelligence, diagnostics: [diag('xai', 'warning', 'X/Twitter narrative search skipped by scan settings.')] }
    : await callXaiIntelligence(dataset, narrativeProfile);
  diagnostics.push(...xIntel.diagnostics);

  const webIntel = request.includeWebSearch === false
    ? { data: {} as WebIntelligence, diagnostics: [diag('openai', 'warning', 'Web intelligence search skipped by scan settings.')] }
    : await callOpenAiWebIntelligence(dataset, narrativeProfile, xIntel.data);
  diagnostics.push(...webIntel.diagnostics);

  const competitorCount = clamp(Number(request.competitorCount ?? 3), 0, 3);
  const discovered = request.includeCompetitors === false ? [] : discoverCompetitors(xIntel.data, webIntel.data, competitorCount);
  const competitorProfiles: CompetitorProfileInsight[] = [];
  for (const competitor of discovered) {
    try {
      competitorProfiles.push(await withTimeout(
        analyzeCompetitor(competitor, clientId),
        envNumber('COMPETITOR_ANALYSIS_TIMEOUT_MS', DEFAULT_COMPETITOR_TIMEOUT_MS),
        `Competitor @${competitor.handle} analysis`,
      ));
      diagnostics.push(diag('system', 'ok', `Competitor @${competitor.handle} analyzed.`));
    } catch (error) {
      diagnostics.push(diag('system', 'warning', `Competitor @${competitor.handle} could not be fully analyzed: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  const extractedNarratives = buildExtractedNarratives(clientId, narrativeProfile, xIntel.data, webIntel.data);
  const narratives = buildNarratives(clientId, extractedNarratives);
  const webEvidence = buildWebEvidence(extractedNarratives, dataset, xIntel.data, webIntel.data);
  const network = buildNetwork(dataset.handle, dataset.scrapedComments, dataset.rawProfileRows);
  const split = sentimentSplit(dataset.scrapedComments.map(comment => comment.sentiment));
  const accountHealth = buildAccountHealth(dataset.scrapedComments, network.reviewQueue, split);
  const reportMetrics = buildReportMetrics(dataset.scrapedPosts, dataset.scrapedComments, extractedNarratives, accountHealth, network.reviewQueue);
  const strategicIntelligence = buildStrategicLayer(dataset, narrativeProfile, xIntel.data, webIntel.data, competitorProfiles, reportMetrics);
  const audienceClusters = buildAudienceClusters(clientId, extractedNarratives, dataset.scrapedComments);
  const xOk = xIntel.diagnostics.some(d => d.provider === 'xai' && d.status === 'ok');
  const openAiOk = webIntel.diagnostics.some(d => d.provider === 'openai' && d.status === 'ok');
  const sourceRuns = buildSourceRuns(sessionId, dataset, xOk, openAiOk);
  const contentSuggestions = buildContentSuggestions(clientId, strategicIntelligence.contentStrategyRecommendations);
  const events = [
    createEvent(`Instagram profile @${dataset.handle || 'unknown'} scraped and normalized.`, 'collection', 'low'),
    createEvent(`Narrative model extracted ${extractedNarratives.length} dominant pattern(s).`, 'analysis', 'medium'),
    createEvent(`Grok X intelligence ${xOk ? 'completed' : 'returned warnings'}.`, 'analysis', xOk ? 'low' : 'medium'),
    createEvent(`OpenAI web intelligence ${openAiOk ? 'completed' : 'returned warnings'}.`, 'analysis', openAiOk ? 'low' : 'medium'),
    createEvent(`Competitor layer analyzed ${competitorProfiles.length} profile(s).`, 'analysis', competitorProfiles.length ? 'medium' : 'low'),
  ];

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
