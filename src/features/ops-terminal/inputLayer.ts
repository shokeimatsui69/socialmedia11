import {
  detectInstagramUrl,
  type DetectedInstagramUrl,
} from '../../services/turboScan';

export type OpsInputEntityType =
  | 'brand'
  | 'social_profile'
  | 'instagram_account'
  | 'instagram_post'
  | 'instagram_reel'
  | 'x_account'
  | 'x_post'
  | 'tiktok_account'
  | 'tiktok_video'
  | 'hashtag'
  | 'topic'
  | 'keyword'
  | 'product'
  | 'service'
  | 'url'
  | 'discussion_thread'
  | 'forum_topic'
  | 'comment'
  | 'video'
  | 'news_article';

export type OpsInputPlatform =
  | 'instagram'
  | 'x'
  | 'tiktok'
  | 'youtube'
  | 'facebook'
  | 'linkedin'
  | 'threads'
  | 'reddit'
  | 'forum'
  | 'web'
  | 'unknown';

export type OpsScannerReadiness = 'runnable' | 'pending_scanner' | 'invalid';

export interface OpsInputEntity {
  rawValue: string;
  normalizedValue: string;
  type: OpsInputEntityType;
  platform?: OpsInputPlatform;
  label: string;
  confidence: number;
  url?: string;
  handle?: string;
  shortcode?: string;
  instagram?: DetectedInstagramUrl;
}

export interface OpsInputDetectionResult {
  isValid: boolean;
  readiness: OpsScannerReadiness;
  entity?: OpsInputEntity;
  error?: string;
  message?: string;
  warnings?: string[];
}

const SOCIAL_PROFILE_HOSTS: Record<string, OpsInputPlatform> = {
  'facebook.com': 'facebook',
  'www.facebook.com': 'facebook',
  'm.facebook.com': 'facebook',
  'linkedin.com': 'linkedin',
  'www.linkedin.com': 'linkedin',
  'threads.net': 'threads',
  'www.threads.net': 'threads',
};

const X_HOSTS = new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com', 'mobile.twitter.com']);
const TIKTOK_HOSTS = new Set(['tiktok.com', 'www.tiktok.com', 'm.tiktok.com']);
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);
const REDDIT_HOSTS = new Set(['reddit.com', 'www.reddit.com', 'old.reddit.com', 'new.reddit.com']);

const NEWS_HOST_HINTS = [
  'news',
  'daily',
  'times',
  'post',
  'journal',
  'press',
  'media',
  'cnn',
  'bbc',
  'reuters',
  'apnews',
  'bloomberg',
  'forbes',
  'medium',
  'substack',
  'blog',
];

const PRODUCT_HINTS = [
  'product',
  'app',
  'software',
  'platform',
  'tool',
  'device',
  'phone',
  'shoes',
  'skincare',
  'supplement',
  'subscription',
  'pricing',
  'buy',
  'order',
];

const SERVICE_HINTS = [
  'service',
  'agency',
  'consulting',
  'repair',
  'cleaning',
  'delivery',
  'coaching',
  'design',
  'support',
  'implementation',
  'management',
];

function asUrl(value: string): URL | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`;
  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

function pathSegments(url: URL): string[] {
  return url.pathname.split('/').filter(Boolean);
}

function cleanHandle(value: string | undefined): string {
  return String(value || '').replace(/^@/, '').trim();
}

function createPendingEntity(entity: OpsInputEntity, scannerLabel?: string): OpsInputDetectionResult {
  const label = scannerLabel || formatOpsInputPlatform(entity.platform) || 'This';
  return {
    isValid: true,
    readiness: 'pending_scanner',
    entity,
    message: `${label} scanner is not implemented yet. Input entity has been accepted for Layer 1 classification.`,
  };
}

function createInvalid(error: string): OpsInputDetectionResult {
  return { isValid: false, readiness: 'invalid', error };
}

function urlEntity(
  rawValue: string,
  url: URL,
  type: OpsInputEntityType,
  platform: OpsInputPlatform,
  label: string,
  confidence = 0.86,
  extra: Partial<OpsInputEntity> = {},
): OpsInputEntity {
  return {
    rawValue,
    normalizedValue: url.toString(),
    type,
    platform,
    label,
    confidence,
    url: url.toString(),
    ...extra,
  };
}

function detectInstagramEntity(rawValue: string): OpsInputDetectionResult | null {
  const detection = detectInstagramUrl(rawValue);
  if (!detection.isValid || !detection.detected) {
    const url = asUrl(rawValue);
    if (url && /(^|\.)instagram\.com$/i.test(url.hostname)) {
      return createInvalid(detection.error || 'Enter a valid Instagram profile, post, or reel URL.');
    }
    return null;
  }

  const detected = detection.detected;
  const type: OpsInputEntityType =
    detected.type === 'profile'
      ? 'instagram_account'
      : detected.type === 'reel'
        ? 'instagram_reel'
        : 'instagram_post';
  const label =
    detected.type === 'profile'
      ? `Instagram profile @${detected.handle || 'target'}`
      : detected.type === 'reel'
        ? `Instagram reel ${detected.shortcode || ''}`.trim()
        : `Instagram post ${detected.shortcode || ''}`.trim();

  return {
    isValid: true,
    readiness: 'runnable',
    entity: {
      rawValue,
      normalizedValue: detected.normalizedUrl,
      type,
      platform: 'instagram',
      label,
      confidence: 0.98,
      url: detected.normalizedUrl,
      handle: detected.handle,
      shortcode: detected.shortcode,
      instagram: detected,
    },
    message: 'Instagram scanner is available. This input can launch the current Ops Terminal pipeline.',
  };
}

function detectXEntity(rawValue: string, url: URL): OpsInputDetectionResult | null {
  if (!X_HOSTS.has(url.hostname.toLowerCase())) return null;
  const segments = pathSegments(url);
  const statusIndex = segments.findIndex((segment) => ['status', 'statuses'].includes(segment.toLowerCase()));
  const handle = cleanHandle(segments[0]);
  const type: OpsInputEntityType = statusIndex >= 0 ? 'x_post' : 'x_account';
  const label = type === 'x_post' ? 'X/Twitter post' : `X/Twitter profile @${handle || 'target'}`;
  return createPendingEntity(
    urlEntity(rawValue, url, type, 'x', label, 0.93, { handle }),
    'X/Twitter',
  );
}

function detectTikTokEntity(rawValue: string, url: URL): OpsInputDetectionResult | null {
  if (!TIKTOK_HOSTS.has(url.hostname.toLowerCase())) return null;
  const segments = pathSegments(url);
  const videoIndex = segments.findIndex((segment) => segment.toLowerCase() === 'video');
  const handle = cleanHandle(segments.find((segment) => segment.startsWith('@')));
  const type: OpsInputEntityType = videoIndex >= 0 ? 'tiktok_video' : 'tiktok_account';
  const label = type === 'tiktok_video' ? 'TikTok video' : `TikTok profile @${handle || 'target'}`;
  return createPendingEntity(
    urlEntity(rawValue, url, type, 'tiktok', label, 0.92, { handle }),
    'TikTok',
  );
}

function detectYouTubeEntity(rawValue: string, url: URL): OpsInputDetectionResult | null {
  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return null;
  const segments = pathSegments(url);
  const isVideo =
    url.hostname.toLowerCase() === 'youtu.be' ||
    url.searchParams.has('v') ||
    ['shorts', 'watch', 'embed', 'live'].includes(segments[0]?.toLowerCase() || '');
  const label = isVideo ? 'YouTube video' : 'YouTube profile/channel';
  return createPendingEntity(
    urlEntity(rawValue, url, isVideo ? 'video' : 'social_profile', 'youtube', label, 0.9),
    'YouTube',
  );
}

function detectSocialUrlEntity(rawValue: string, url: URL): OpsInputDetectionResult | null {
  const platform = SOCIAL_PROFILE_HOSTS[url.hostname.toLowerCase()];
  if (!platform) return null;
  const path = url.pathname.toLowerCase();
  const isThread = /\/(posts|post|permalink|activity|share|status)\b/.test(path);
  const type: OpsInputEntityType = isThread ? 'discussion_thread' : 'social_profile';
  const label = `${formatOpsInputPlatform(platform)} ${isThread ? 'discussion thread' : 'profile'}`;
  return createPendingEntity(
    urlEntity(rawValue, url, type, platform, label, 0.86),
    formatOpsInputPlatform(platform),
  );
}

function detectForumUrlEntity(rawValue: string, url: URL): OpsInputDetectionResult | null {
  const host = url.hostname.toLowerCase();
  const segments = pathSegments(url);
  const isReddit = REDDIT_HOSTS.has(host);
  const isForum = isReddit || /forum|community|discourse|quora/i.test(host);
  if (!isForum) return null;
  const isThread = isReddit
    ? segments.includes('comments')
    : /thread|topic|discussion|question|answer/i.test(url.pathname);
  const platform: OpsInputPlatform = isReddit ? 'reddit' : 'forum';
  const type: OpsInputEntityType = isThread ? 'discussion_thread' : 'forum_topic';
  const label = isThread ? `${formatOpsInputPlatform(platform)} discussion thread` : `${formatOpsInputPlatform(platform)} forum topic`;
  return createPendingEntity(
    urlEntity(rawValue, url, type, platform, label, 0.88),
    formatOpsInputPlatform(platform),
  );
}

function detectWebUrlEntity(rawValue: string, url: URL): OpsInputDetectionResult {
  const hostAndPath = `${url.hostname} ${url.pathname}`.toLowerCase();
  const articleLikePath = pathSegments(url).length >= 2 && /[0-9]{4}|article|story|news|blog|post|press|report/i.test(url.pathname);
  const isNewsArticle = NEWS_HOST_HINTS.some((hint) => hostAndPath.includes(hint)) || articleLikePath;
  const type: OpsInputEntityType = isNewsArticle ? 'news_article' : 'url';
  const label = isNewsArticle ? 'News/blog article URL' : 'Generic URL';
  return createPendingEntity(
    urlEntity(rawValue, url, type, 'web', label, isNewsArticle ? 0.78 : 0.7),
    'Web',
  );
}

function detectTextEntity(rawValue: string): OpsInputDetectionResult {
  const value = rawValue.trim();
  if (/^#[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(value)) {
    return createPendingEntity({
      rawValue,
      normalizedValue: value.toLowerCase(),
      type: 'hashtag',
      platform: 'unknown',
      label: `Hashtag ${value}`,
      confidence: 0.94,
    }, 'Hashtag');
  }

  if (/^@[A-Za-z0-9_.-]{1,64}$/.test(value)) {
    return createPendingEntity({
      rawValue,
      normalizedValue: value,
      type: 'social_profile',
      platform: 'unknown',
      label: `Social profile ${value}`,
      confidence: 0.76,
      handle: cleanHandle(value),
    }, 'Social profile');
  }

  const lower = value.toLowerCase();
  const words = value.split(/\s+/).filter(Boolean);
  const prefixed = lower.match(/^(brand|product|service|topic|keyword|comment):\s*(.+)$/);
  if (prefixed) {
    const prefix = prefixed[1] as 'brand' | 'product' | 'service' | 'topic' | 'keyword' | 'comment';
    const normalizedValue = prefixed[2].trim();
    const type: OpsInputEntityType = prefix === 'comment' ? 'comment' : prefix;
    return createPendingEntity({
      rawValue,
      normalizedValue,
      type,
      platform: 'unknown',
      label: `${formatOpsInputEntityType(type)}: ${normalizedValue}`,
      confidence: 0.88,
    }, formatOpsInputEntityType(type));
  }

  const looksLikeComment = value.length > 180 || value.includes('\n') || (words.length >= 8 && /[.!?]$/.test(value));
  if (looksLikeComment) {
    return createPendingEntity({
      rawValue,
      normalizedValue: value,
      type: 'comment',
      platform: 'unknown',
      label: 'Comment or discussion text',
      confidence: 0.74,
    }, 'Comment');
  }

  if (SERVICE_HINTS.some((hint) => lower.includes(hint))) {
    return createPendingEntity({
      rawValue,
      normalizedValue: value,
      type: 'service',
      platform: 'unknown',
      label: `Service: ${value}`,
      confidence: 0.72,
    }, 'Service');
  }

  if (PRODUCT_HINTS.some((hint) => lower.includes(hint))) {
    return createPendingEntity({
      rawValue,
      normalizedValue: value,
      type: 'product',
      platform: 'unknown',
      label: `Product: ${value}`,
      confidence: 0.72,
    }, 'Product');
  }

  const type: OpsInputEntityType = words.length <= 2 ? 'keyword' : words.length <= 6 ? 'topic' : 'brand';
  return createPendingEntity({
    rawValue,
    normalizedValue: value,
    type,
    platform: 'unknown',
    label: `${formatOpsInputEntityType(type)}: ${value}`,
    confidence: type === 'brand' ? 0.58 : 0.66,
  }, formatOpsInputEntityType(type));
}

export function detectOpsInputEntity(rawValue: string): OpsInputDetectionResult {
  const value = rawValue.trim();
  if (!value) {
    return createInvalid('Enter an input entity such as an Instagram URL, social profile, hashtag, topic, keyword, product, service, URL, thread, comment, video, or news article.');
  }

  const instagram = detectInstagramEntity(value);
  if (instagram) return instagram;

  const url = asUrl(value);
  if (url && value.includes('.')) {
    return (
      detectXEntity(value, url) ||
      detectTikTokEntity(value, url) ||
      detectYouTubeEntity(value, url) ||
      detectSocialUrlEntity(value, url) ||
      detectForumUrlEntity(value, url) ||
      detectWebUrlEntity(value, url)
    );
  }

  return detectTextEntity(value);
}

export function assertRunnableOpsInput(entity: OpsInputEntity | undefined): { ok: boolean; reason?: string } {
  if (!entity) return { ok: false, reason: 'No input entity was detected.' };
  if (entity.platform === 'instagram' && entity.instagram) return { ok: true };
  return {
    ok: false,
    reason: `${formatOpsInputEntityType(entity.type)} was accepted, but its scanner is not implemented yet.`,
  };
}

export function formatOpsInputEntityType(type: OpsInputEntityType): string {
  const labels: Record<OpsInputEntityType, string> = {
    brand: 'Brand',
    social_profile: 'Social profile',
    instagram_account: 'Instagram account',
    instagram_post: 'Instagram post',
    instagram_reel: 'Instagram reel',
    x_account: 'X/Twitter account',
    x_post: 'X/Twitter post',
    tiktok_account: 'TikTok account',
    tiktok_video: 'TikTok video',
    hashtag: 'Hashtag',
    topic: 'Topic',
    keyword: 'Keyword',
    product: 'Product',
    service: 'Service',
    url: 'URL',
    discussion_thread: 'Discussion thread',
    forum_topic: 'Forum topic',
    comment: 'Comment',
    video: 'Video',
    news_article: 'News article',
  };
  return labels[type];
}

export function formatOpsInputPlatform(platform?: OpsInputPlatform): string {
  if (!platform || platform === 'unknown') return 'Unknown platform';
  const labels: Record<Exclude<OpsInputPlatform, 'unknown'>, string> = {
    instagram: 'Instagram',
    x: 'X/Twitter',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    threads: 'Threads',
    reddit: 'Reddit',
    forum: 'Forum',
    web: 'Web',
  };
  return labels[platform];
}
