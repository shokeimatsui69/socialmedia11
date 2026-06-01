import {
  formatOpsInputEntityType,
  formatOpsInputPlatform,
  type OpsInputEntity,
  type OpsInputPlatform,
} from './inputLayer';
import {
  formatScannerType,
  type OpsScannerModule,
  type OpsScannerSelectionResult,
} from './scannerSelection';

export type OpsTopicSignalType =
  | 'primary_topic'
  | 'subtopic'
  | 'trending_topic'
  | 'controversial_topic'
  | 'viral_topic'
  | 'competitor_related_topic'
  | 'market_topic'
  | 'risk_topic';

export type OpsTopicSource =
  | 'input_entity'
  | 'url'
  | 'scanner_plan'
  | 'text_seed'
  | 'platform_context';

export type OpsTopicExtractionReadiness = 'ready' | 'partial' | 'invalid';

export interface OpsTopicEntity {
  id: string;
  label: string;
  signalType: OpsTopicSignalType;
  confidence: number;
  keywords: string[];
  source: OpsTopicSource;
  description: string;
  sourceScannerId?: string;
}

export interface OpsTopicCluster {
  id: string;
  label: string;
  topicIds: string[];
  sourceScannerIds: string[];
  confidence: number;
  description: string;
}

export interface OpsTopicExtractionResult {
  readiness: OpsTopicExtractionReadiness;
  isReady: boolean;
  primaryTopic?: OpsTopicEntity;
  topics: OpsTopicEntity[];
  clusters: OpsTopicCluster[];
  message: string;
}

const STOP_WORDS = new Set([
  'a',
  'about',
  'after',
  'all',
  'and',
  'are',
  'article',
  'at',
  'be',
  'blog',
  'by',
  'com',
  'for',
  'from',
  'has',
  'have',
  'how',
  'html',
  'http',
  'https',
  'in',
  'is',
  'it',
  'm',
  'net',
  'news',
  'of',
  'on',
  'or',
  'org',
  'post',
  's',
  'status',
  'story',
  't',
  'the',
  'this',
  'to',
  'watch',
  'what',
  'when',
  'where',
  'why',
  'with',
  'www',
]);

function compact(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function cleanHashOrHandle(value: string | undefined): string {
  return String(value || '').replace(/^[@#]/, '').trim();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function tokenize(value: string, max = 8): string[] {
  const words = compact(value)
    .toLowerCase()
    .replace(/'/g, '')
    .split(/[^a-z0-9]+/i)
    .map((word) => word.trim())
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
  return unique(words).slice(0, max);
}

function titleCase(value: string): string {
  return compact(value)
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function titleFromWords(words: string[], fallback: string): string {
  if (!words.length) return fallback;
  return words.map((word) => titleCase(word)).join(' ');
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug || 'topic';
}

function clampConfidence(value: number): number {
  return Math.max(0.1, Math.min(0.99, value));
}

function createTopic(
  label: string,
  signalType: OpsTopicSignalType,
  confidence: number,
  keywords: string[],
  source: OpsTopicSource,
  description: string,
  sourceScannerId?: string,
): OpsTopicEntity {
  return {
    id: `topic-${slugify(label)}`,
    label: compact(label),
    signalType,
    confidence: clampConfidence(confidence),
    keywords: unique(keywords.map((keyword) => keyword.toLowerCase())).slice(0, 8),
    source,
    description,
    sourceScannerId,
  };
}

function averageConfidence(topics: OpsTopicEntity[]): number {
  if (!topics.length) return 0;
  const total = topics.reduce((sum, topic) => sum + topic.confidence, 0);
  return Math.round((total / topics.length) * 100) / 100;
}

function dedupeTopics(topics: OpsTopicEntity[]): OpsTopicEntity[] {
  const byLabel = new Map<string, OpsTopicEntity>();
  topics.forEach((topic) => {
    const key = topic.label.toLowerCase();
    const existing = byLabel.get(key);
    if (!existing || topic.confidence > existing.confidence) {
      byLabel.set(key, topic);
    }
  });
  return Array.from(byLabel.values());
}

function platformKeywords(platform?: OpsInputPlatform): string[] {
  if (!platform || platform === 'unknown') return [];
  return [platform, formatOpsInputPlatform(platform).toLowerCase()];
}

function urlTopicWords(entity: OpsInputEntity): string[] {
  try {
    const url = new URL(entity.url || entity.normalizedValue);
    return tokenize(`${url.hostname} ${url.pathname.replace(/\//g, ' ')}`, 8);
  } catch {
    return tokenize(entity.normalizedValue, 8);
  }
}

function primaryTopicForEntity(entity: OpsInputEntity): OpsTopicEntity {
  const handle = cleanHashOrHandle(entity.handle);
  const shortcode = entity.shortcode || tokenize(entity.normalizedValue, 1)[0] || '';
  const textWords = tokenize(entity.normalizedValue || entity.label, 8);
  const platform = formatOpsInputPlatform(entity.platform);
  const entityType = formatOpsInputEntityType(entity.type).toLowerCase();

  switch (entity.type) {
    case 'instagram_account':
      return createTopic(
        `@${handle || 'target'} Instagram audience conversation`,
        'primary_topic',
        0.94,
        unique([handle, 'instagram', 'audience', 'profile']),
        'input_entity',
        'Profile handle is the primary topic seed for the current runnable Instagram pipeline.',
      );
    case 'instagram_post':
    case 'instagram_reel': {
      const mediaType = entity.type === 'instagram_reel' ? 'reel' : 'post';
      return createTopic(
        `Instagram ${mediaType} ${shortcode} conversation`.trim(),
        entity.type === 'instagram_reel' ? 'viral_topic' : 'primary_topic',
        0.92,
        unique(['instagram', mediaType, shortcode, 'comments', 'engagement']),
        'input_entity',
        `The ${mediaType} URL seeds topic extraction around comments, engagement, and audience response.`,
      );
    }
    case 'x_account':
      return createTopic(
        `X/Twitter @${handle || 'target'} conversation`,
        'primary_topic',
        0.88,
        unique([handle, 'x', 'twitter', 'conversation']),
        'input_entity',
        'The X/Twitter profile is treated as a social conversation seed until the platform scanner is implemented.',
      );
    case 'x_post':
      return createTopic(
        `X/Twitter post conversation`,
        'viral_topic',
        0.88,
        unique([handle, 'x', 'twitter', 'post', 'replies']),
        'input_entity',
        'The post URL is treated as a viral social signal seed.',
      );
    case 'tiktok_account':
      return createTopic(
        `TikTok @${handle || 'target'} content trend`,
        'primary_topic',
        0.86,
        unique([handle, 'tiktok', 'creator', 'audience']),
        'input_entity',
        'The TikTok profile is treated as a content and audience trend seed.',
      );
    case 'tiktok_video':
      return createTopic(
        'TikTok video trend',
        'viral_topic',
        0.88,
        unique(['tiktok', 'video', 'comments', 'trend']),
        'input_entity',
        'The TikTok video URL is treated as a viral content seed.',
      );
    case 'social_profile':
      return createTopic(
        `${platform} profile conversation`,
        'primary_topic',
        0.78,
        unique([...platformKeywords(entity.platform), handle, 'profile', 'audience']),
        'platform_context',
        'The social profile is accepted as a platform conversation seed.',
      );
    case 'video':
      return createTopic(
        `${platform} video narrative`,
        'viral_topic',
        0.8,
        unique([...platformKeywords(entity.platform), 'video', 'comments', 'transcript']),
        'platform_context',
        'The video input is prepared for future metadata, transcript, and comment extraction.',
      );
    case 'hashtag': {
      const hashtag = cleanHashOrHandle(entity.normalizedValue);
      return createTopic(
        `${titleCase(hashtag)} hashtag trend`,
        'trending_topic',
        0.9,
        unique([hashtag, 'hashtag', 'trend']),
        'text_seed',
        'The hashtag is treated as a trend and narrative discovery seed.',
      );
    }
    case 'topic':
    case 'keyword':
      return createTopic(
        titleCase(entity.normalizedValue),
        entity.type === 'topic' ? 'primary_topic' : 'trending_topic',
        entity.type === 'topic' ? 0.76 : 0.72,
        textWords,
        'text_seed',
        `The ${entityType} is expanded into topic seeds for future scanner execution.`,
      );
    case 'brand':
      return createTopic(
        `${titleCase(entity.normalizedValue)} brand positioning`,
        'market_topic',
        0.72,
        unique([...textWords, 'brand', 'positioning']),
        'text_seed',
        'The brand input is prepared for positioning, reputation, and competitor expansion.',
      );
    case 'product':
      return createTopic(
        `${titleCase(entity.normalizedValue)} product perception`,
        'market_topic',
        0.74,
        unique([...textWords, 'product', 'buyers', 'reviews']),
        'text_seed',
        'The product input is prepared for category, buyer objection, and review signal extraction.',
      );
    case 'service':
      return createTopic(
        `${titleCase(entity.normalizedValue)} service reputation`,
        'market_topic',
        0.74,
        unique([...textWords, 'service', 'customers', 'support']),
        'text_seed',
        'The service input is prepared for reputation, customer intent, and market context extraction.',
      );
    case 'url':
    case 'news_article': {
      const words = urlTopicWords(entity);
      const label = entity.type === 'news_article'
        ? `${titleFromWords(words.slice(0, 4), 'Article')} media narrative`
        : `${titleFromWords(words.slice(0, 4), 'Web URL')} web context`;
      return createTopic(
        label,
        entity.type === 'news_article' ? 'primary_topic' : 'subtopic',
        entity.type === 'news_article' ? 0.76 : 0.68,
        unique([...words, 'web', entity.type === 'news_article' ? 'article' : 'url']),
        'url',
        'The URL is converted into a source and narrative seed for future web extraction.',
      );
    }
    case 'discussion_thread':
    case 'forum_topic':
      return createTopic(
        `${platform} community discussion`,
        'controversial_topic',
        0.78,
        unique([...platformKeywords(entity.platform), ...urlTopicWords(entity), 'community', 'thread']),
        'platform_context',
        'The discussion URL is prepared for community sentiment and claim extraction.',
      );
    case 'comment': {
      const words = textWords.slice(0, 5);
      return createTopic(
        `${titleFromWords(words, 'Audience comment')} intent`,
        'risk_topic',
        0.7,
        unique([...words, 'comment', 'sentiment', 'intent']),
        'text_seed',
        'The comment text is prepared for sentiment, intent, and friction extraction.',
      );
    }
    default:
      return createTopic(
        entity.label,
        'primary_topic',
        0.6,
        textWords,
        'input_entity',
        'The input entity is prepared as a generic topic seed.',
      );
  }
}

function entitySubtopics(entity: OpsInputEntity, primaryTopic: OpsTopicEntity): OpsTopicEntity[] {
  const sharedKeywords = primaryTopic.keywords;
  const platform = formatOpsInputPlatform(entity.platform);

  switch (entity.type) {
    case 'instagram_account':
    case 'instagram_post':
    case 'instagram_reel':
      return [
        createTopic('Audience sentiment and objections', 'risk_topic', 0.82, [...sharedKeywords, 'sentiment', 'objections'], 'platform_context', 'Tracks emotional tone and resistance in social responses.'),
        createTopic('Engagement drivers', 'subtopic', 0.78, [...sharedKeywords, 'likes', 'comments', 'shares'], 'platform_context', 'Captures what appears to drive measurable engagement.'),
        createTopic('Creator and audience fit', 'market_topic', 0.72, [...sharedKeywords, 'creator', 'audience', 'fit'], 'platform_context', 'Frames how well the content or profile matches the expected audience.'),
      ];
    case 'x_account':
    case 'x_post':
      return [
        createTopic('Reply chain sentiment', 'risk_topic', 0.76, [...sharedKeywords, 'replies', 'sentiment'], 'platform_context', 'Prepares the input for reply and quote-post sentiment once the X scanner exists.'),
        createTopic('Real-time narrative momentum', 'trending_topic', 0.8, [...sharedKeywords, 'trend', 'momentum'], 'platform_context', 'Tracks whether the topic is likely to move quickly across social channels.'),
      ];
    case 'tiktok_account':
    case 'tiktok_video':
    case 'video':
      return [
        createTopic('Video hook and retention cues', 'viral_topic', 0.76, [...sharedKeywords, 'hook', 'retention'], 'platform_context', 'Prepares the video input for future hook, transcript, and comment analysis.'),
        createTopic('Comment reaction patterns', 'risk_topic', 0.72, [...sharedKeywords, 'comments', 'reaction'], 'platform_context', 'Captures expected audience reaction signals around the video.'),
      ];
    case 'social_profile':
      return [
        createTopic(`${platform} audience profile`, 'subtopic', 0.72, [...sharedKeywords, 'audience', 'profile'], 'platform_context', 'Prepares the profile for platform-specific audience and post extraction.'),
        createTopic('Cross-platform reputation context', 'market_topic', 0.68, [...sharedKeywords, 'reputation', 'context'], 'platform_context', 'Connects the profile to broader reputation and market context.'),
      ];
    case 'hashtag':
    case 'topic':
    case 'keyword':
      return [
        createTopic('Trend momentum', 'trending_topic', 0.78, [...sharedKeywords, 'trend', 'momentum'], 'text_seed', 'Tracks possible acceleration around the topic seed.'),
        createTopic('Audience language variants', 'subtopic', 0.68, [...sharedKeywords, 'language', 'variants'], 'text_seed', 'Captures nearby terms and phrasing for later query expansion.'),
        createTopic('Related narratives', 'subtopic', 0.66, [...sharedKeywords, 'narratives', 'themes'], 'text_seed', 'Prepares related theme discovery around the seed phrase.'),
      ];
    case 'brand':
    case 'product':
    case 'service':
      return [
        createTopic('Category demand signals', 'market_topic', 0.72, [...sharedKeywords, 'category', 'demand'], 'text_seed', 'Frames the entity inside market and category demand.'),
        createTopic('Buyer objections and friction', 'risk_topic', 0.7, [...sharedKeywords, 'objections', 'friction'], 'text_seed', 'Prepares the entity for objection and complaint extraction.'),
        createTopic('Competitor comparison cues', 'competitor_related_topic', 0.76, [...sharedKeywords, 'competitors', 'comparison'], 'text_seed', 'Seeds competitor discovery and positioning comparisons.'),
      ];
    case 'url':
    case 'news_article':
      return [
        createTopic('Source credibility and evidence', 'subtopic', 0.7, [...sharedKeywords, 'source', 'evidence'], 'url', 'Prepares the URL for credibility and evidence extraction.'),
        createTopic('Media narrative framing', 'subtopic', 0.74, [...sharedKeywords, 'media', 'framing'], 'url', 'Captures the likely narrative frame of the page or article.'),
      ];
    case 'discussion_thread':
    case 'forum_topic':
      return [
        createTopic('Community sentiment', 'risk_topic', 0.78, [...sharedKeywords, 'community', 'sentiment'], 'platform_context', 'Prepares the thread for organic sentiment extraction.'),
        createTopic('Pain points and claims', 'controversial_topic', 0.72, [...sharedKeywords, 'claims', 'pain'], 'platform_context', 'Captures possible dispute, complaint, or claim clusters.'),
      ];
    case 'comment':
      return [
        createTopic('Audience intent', 'subtopic', 0.72, [...sharedKeywords, 'intent'], 'text_seed', 'Extracts likely intent from the submitted text.'),
        createTopic('Sentiment and risk', 'risk_topic', 0.76, [...sharedKeywords, 'sentiment', 'risk'], 'text_seed', 'Flags the text for future sentiment and risk classification.'),
      ];
    default:
      return [
        createTopic('Input context expansion', 'subtopic', 0.6, sharedKeywords, 'input_entity', 'Prepares the input for broader semantic expansion.'),
      ];
  }
}

function scannerTopic(scanner: OpsScannerModule, entity: OpsInputEntity): OpsTopicEntity {
  const keywords = unique([
    ...tokenize(entity.normalizedValue || entity.label, 5),
    ...scanner.platforms,
    scanner.type,
  ]);

  switch (scanner.type) {
    case 'social':
      return createTopic(
        `${formatOpsInputPlatform(scanner.platforms[0])} social engagement`,
        'subtopic',
        scanner.implementationStatus === 'available' ? 0.8 : 0.68,
        [...keywords, 'social', 'engagement'],
        'scanner_plan',
        `${scanner.label} will contribute platform posts, comments, and engagement context when executable.`,
        scanner.id,
      );
    case 'web':
      return createTopic(
        'Web and media context',
        'subtopic',
        scanner.implementationStatus === 'available' ? 0.78 : 0.66,
        [...keywords, 'web', 'media', 'evidence'],
        'scanner_plan',
        `${scanner.label} contributes public web context and source evidence.`,
        scanner.id,
      );
    case 'forum':
      return createTopic(
        'Community sentiment signals',
        'risk_topic',
        0.7,
        [...keywords, 'forum', 'community', 'sentiment'],
        'scanner_plan',
        `${scanner.label} will contribute community discussion and comment-thread signals.`,
        scanner.id,
      );
    case 'trend':
      return createTopic(
        'Emerging trend scan',
        'trending_topic',
        scanner.implementationStatus === 'available' ? 0.82 : 0.7,
        [...keywords, 'trend', 'momentum'],
        'scanner_plan',
        `${scanner.label} contributes real-time and cross-platform trend signals.`,
        scanner.id,
      );
    case 'competitor':
      return createTopic(
        'Competitor positioning',
        'competitor_related_topic',
        scanner.implementationStatus === 'available' ? 0.78 : 0.68,
        [...keywords, 'competitors', 'positioning'],
        'scanner_plan',
        `${scanner.label} contributes competitor candidates and positioning evidence.`,
        scanner.id,
      );
    case 'text_ai':
      return createTopic(
        'Text intent and sentiment',
        'risk_topic',
        0.7,
        [...keywords, 'intent', 'sentiment'],
        'scanner_plan',
        `${scanner.label} will contribute direct semantic and sentiment classification.`,
        scanner.id,
      );
    default:
      return createTopic(
        formatScannerType(scanner.type),
        'subtopic',
        0.6,
        keywords,
        'scanner_plan',
        `${scanner.label} contributes additional topic context.`,
        scanner.id,
      );
  }
}

function buildClusters(topics: OpsTopicEntity[], scanners: OpsScannerModule[]): OpsTopicCluster[] {
  const clusters: OpsTopicCluster[] = [];
  const scannerIds = scanners.map((scanner) => scanner.id);
  const primary = topics[0];
  if (primary) {
    const topicIds = topics.slice(0, 4).map((topic) => topic.id);
    clusters.push({
      id: 'cluster-primary-narrative',
      label: 'Primary narrative seed',
      topicIds,
      sourceScannerIds: scannerIds.slice(0, 2),
      confidence: averageConfidence(topics.slice(0, 4)),
      description: 'Core topic bundle created from the input entity and immediate semantic context.',
    });
  }

  const trendTopics = topics.filter((topic) => ['trending_topic', 'viral_topic'].includes(topic.signalType));
  if (trendTopics.length) {
    clusters.push({
      id: 'cluster-trend-signals',
      label: 'Trend signals',
      topicIds: trendTopics.map((topic) => topic.id).slice(0, 5),
      sourceScannerIds: sourceScannerIdsForTopics(trendTopics),
      confidence: averageConfidence(trendTopics),
      description: 'Topics that are likely to depend on momentum, virality, or real-time social movement.',
    });
  }

  const riskTopics = topics.filter((topic) => ['risk_topic', 'controversial_topic'].includes(topic.signalType));
  if (riskTopics.length) {
    clusters.push({
      id: 'cluster-audience-risk',
      label: 'Audience risk and friction',
      topicIds: riskTopics.map((topic) => topic.id).slice(0, 5),
      sourceScannerIds: sourceScannerIdsForTopics(riskTopics),
      confidence: averageConfidence(riskTopics),
      description: 'Topics connected to objections, controversy, sentiment risk, or community friction.',
    });
  }

  const competitorTopics = topics.filter((topic) => topic.signalType === 'competitor_related_topic');
  if (competitorTopics.length) {
    clusters.push({
      id: 'cluster-competitor-context',
      label: 'Competitor context',
      topicIds: competitorTopics.map((topic) => topic.id).slice(0, 5),
      sourceScannerIds: sourceScannerIdsForTopics(competitorTopics),
      confidence: averageConfidence(competitorTopics),
      description: 'Topics that should feed competitor discovery and positioning comparison.',
    });
  }

  return clusters;
}

function sourceScannerIdsForTopics(topics: OpsTopicEntity[]): string[] {
  return unique(topics.map((topic) => topic.sourceScannerId || ''));
}

export function extractOpsTopics(
  entity: OpsInputEntity | undefined,
  scannerSelection: OpsScannerSelectionResult,
): OpsTopicExtractionResult {
  if (!entity) {
    return {
      readiness: 'invalid',
      isReady: false,
      topics: [],
      clusters: [],
      message: 'No input entity has been detected, so topic extraction cannot run.',
    };
  }

  const primaryTopic = primaryTopicForEntity(entity);
  const topics = dedupeTopics([
    primaryTopic,
    ...entitySubtopics(entity, primaryTopic),
    ...scannerSelection.scanners.map((scanner) => scannerTopic(scanner, entity)),
  ]);
  const clusters = buildClusters(topics, scannerSelection.scanners);

  return {
    readiness: topics.length > 0 ? 'ready' : 'partial',
    isReady: topics.length > 0,
    primaryTopic: topics[0],
    topics,
    clusters,
    message: scannerSelection.canRun
      ? `${topics.length} topic seeds are ready for the runnable scanner plan.`
      : `${topics.length} topic seeds are ready. Scanner execution is still pending for this entity.`,
  };
}

export function formatOpsTopicSignalType(signalType: OpsTopicSignalType): string {
  const labels: Record<OpsTopicSignalType, string> = {
    primary_topic: 'Primary',
    subtopic: 'Subtopic',
    trending_topic: 'Trend',
    controversial_topic: 'Controversial',
    viral_topic: 'Viral',
    competitor_related_topic: 'Competitor',
    market_topic: 'Market',
    risk_topic: 'Risk',
  };
  return labels[signalType];
}
