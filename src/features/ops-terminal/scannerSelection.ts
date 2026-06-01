import {
  formatOpsInputPlatform,
  type OpsInputEntity,
  type OpsInputEntityType,
  type OpsInputPlatform,
} from './inputLayer';

export type OpsScannerType =
  | 'social'
  | 'web'
  | 'forum'
  | 'trend'
  | 'competitor'
  | 'text_ai';

export type OpsScannerImplementationStatus = 'available' | 'planned';
export type OpsScannerPlanReadiness = 'runnable' | 'pending_scanner' | 'invalid';

export interface OpsScannerModule {
  id: string;
  type: OpsScannerType;
  label: string;
  platforms: OpsInputPlatform[];
  targets: string[];
  extractionMethods: string[];
  outputEntities: string[];
  implementationStatus: OpsScannerImplementationStatus;
  isPrimary: boolean;
}

export interface OpsScannerSelectionResult {
  readiness: OpsScannerPlanReadiness;
  canRun: boolean;
  primaryScanner?: OpsScannerModule;
  scanners: OpsScannerModule[];
  message: string;
}

const DATA_TYPES = {
  scannerConfiguration: 'Scanner Configuration Entity',
  socialData: 'Social Data Entity',
  mediaNarrative: 'Media Narrative Entity',
  communitySignal: 'Community Signal',
  realTimeSignal: 'Real-Time Signal Entity',
  aiEnriched: 'AI Enriched Entity',
  competitorIntelligence: 'Competitor Intelligence Entity',
  textSignal: 'Text Signal Entity',
};

const scanner = (module: OpsScannerModule): OpsScannerModule => module;

const INSTAGRAM_SOCIAL_SCANNER = scanner({
  id: 'social-instagram',
  type: 'social',
  label: 'Instagram Social Scanner',
  platforms: ['instagram'],
  targets: ['profiles', 'posts', 'reels', 'comments', 'likes', 'engagement metrics'],
  extractionMethods: ['Apify Instagram post scraper', 'Apify Instagram comment scraper', 'optional Apify like scraper'],
  outputEntities: [DATA_TYPES.scannerConfiguration, DATA_TYPES.socialData],
  implementationStatus: 'available',
  isPrimary: true,
});

const X_ENRICHMENT_SCANNER = scanner({
  id: 'trend-x-grok',
  type: 'trend',
  label: 'X / Grok Signal Scanner',
  platforms: ['x'],
  targets: ['trending narratives', 'related discussions', 'cross-platform momentum'],
  extractionMethods: ['xAI Grok X search enrichment'],
  outputEntities: [DATA_TYPES.realTimeSignal, DATA_TYPES.aiEnriched],
  implementationStatus: 'available',
  isPrimary: false,
});

const WEB_ENRICHMENT_SCANNER = scanner({
  id: 'web-openai',
  type: 'web',
  label: 'OpenAI Web Intelligence Scanner',
  platforms: ['web'],
  targets: ['news portals', 'blogs', 'media pages', 'public articles', 'market context'],
  extractionMethods: ['OpenAI web search enrichment'],
  outputEntities: [DATA_TYPES.mediaNarrative, DATA_TYPES.aiEnriched],
  implementationStatus: 'available',
  isPrimary: false,
});

const COMPETITOR_ENRICHMENT_SCANNER = scanner({
  id: 'competitor-openai',
  type: 'competitor',
  label: 'OpenAI Competitor Scanner',
  platforms: ['web', 'instagram'],
  targets: ['competitor brands', 'shared positioning', 'competitor evidence URLs'],
  extractionMethods: ['OpenAI competitor discovery', 'Instagram competitor profile analysis when available'],
  outputEntities: [DATA_TYPES.competitorIntelligence],
  implementationStatus: 'available',
  isPrimary: false,
});

function plannedSocialScanner(
  id: string,
  label: string,
  platform: OpsInputPlatform,
  targets: string[],
  extractionMethods: string[],
): OpsScannerModule {
  return scanner({
    id,
    type: 'social',
    label,
    platforms: [platform],
    targets,
    extractionMethods,
    outputEntities: [DATA_TYPES.scannerConfiguration, DATA_TYPES.socialData],
    implementationStatus: 'planned',
    isPrimary: true,
  });
}

function plannedWebScanner(isPrimary = true): OpsScannerModule {
  return scanner({
    id: isPrimary ? 'web-general-primary' : 'web-general-enrichment',
    type: 'web',
    label: 'Web Scanner',
    platforms: ['web'],
    targets: ['URLs', 'news articles', 'blogs', 'SEO pages', 'public reports'],
    extractionMethods: ['page fetch', 'metadata extraction', 'article text extraction', 'source classification'],
    outputEntities: [DATA_TYPES.scannerConfiguration, DATA_TYPES.mediaNarrative],
    implementationStatus: 'planned',
    isPrimary,
  });
}

function plannedForumScanner(platform: OpsInputPlatform): OpsScannerModule {
  return scanner({
    id: platform === 'reddit' ? 'forum-reddit' : 'forum-community',
    type: 'forum',
    label: platform === 'reddit' ? 'Reddit Forum Scanner' : 'Forum Intelligence Scanner',
    platforms: [platform],
    targets: ['threads', 'comments', 'community boards', 'organic sentiment', 'discussion behavior'],
    extractionMethods: ['thread fetch', 'comment tree extraction', 'community metadata extraction'],
    outputEntities: [DATA_TYPES.scannerConfiguration, DATA_TYPES.communitySignal],
    implementationStatus: 'planned',
    isPrimary: true,
  });
}

function plannedTrendScanner(): OpsScannerModule {
  return scanner({
    id: 'trend-query',
    type: 'trend',
    label: 'Trend Scanner',
    platforms: ['x', 'tiktok', 'instagram', 'web'],
    targets: ['trending topics', 'hashtags', 'viral posts', 'emerging narratives'],
    extractionMethods: ['query expansion', 'multi-source search', 'trend correlation'],
    outputEntities: [DATA_TYPES.scannerConfiguration, DATA_TYPES.realTimeSignal],
    implementationStatus: 'planned',
    isPrimary: true,
  });
}

function plannedTextAiScanner(): OpsScannerModule {
  return scanner({
    id: 'text-ai',
    type: 'text_ai',
    label: 'Text AI Scanner',
    platforms: ['unknown'],
    targets: ['comments', 'discussion text', 'plain-text claims', 'semantic topics'],
    extractionMethods: ['direct AI classification', 'sentiment analysis', 'topic extraction', 'intent detection'],
    outputEntities: [DATA_TYPES.scannerConfiguration, DATA_TYPES.textSignal, DATA_TYPES.aiEnriched],
    implementationStatus: 'planned',
    isPrimary: true,
  });
}

function plannedResolverScanner(entityType: OpsInputEntityType): OpsScannerModule {
  const label = entityType === 'brand'
    ? 'Brand Resolver Scanner'
    : entityType === 'product'
      ? 'Product Resolver Scanner'
      : 'Service Resolver Scanner';
  return scanner({
    id: `${entityType}-resolver`,
    type: 'web',
    label,
    platforms: ['web', 'instagram', 'x', 'tiktok', 'linkedin'],
    targets: ['official profiles', 'official websites', 'category keywords', 'competitor candidates'],
    extractionMethods: ['entity resolution', 'profile discovery', 'market/category expansion'],
    outputEntities: [DATA_TYPES.scannerConfiguration, DATA_TYPES.aiEnriched],
    implementationStatus: 'planned',
    isPrimary: true,
  });
}

function scannerPlanForEntity(entity: OpsInputEntity): OpsScannerModule[] {
  switch (entity.type) {
    case 'instagram_account':
    case 'instagram_post':
    case 'instagram_reel':
      return [
        INSTAGRAM_SOCIAL_SCANNER,
        X_ENRICHMENT_SCANNER,
        WEB_ENRICHMENT_SCANNER,
        COMPETITOR_ENRICHMENT_SCANNER,
      ];
    case 'x_account':
    case 'x_post':
      return [
        plannedSocialScanner('social-x-primary', 'X/Twitter Social Scanner', 'x', ['profiles', 'posts', 'reply chains', 'reposts', 'quote posts'], ['X API/search provider', 'reply-chain extraction', 'engagement velocity extraction']),
        WEB_ENRICHMENT_SCANNER,
        COMPETITOR_ENRICHMENT_SCANNER,
      ];
    case 'tiktok_account':
    case 'tiktok_video':
      return [
        plannedSocialScanner('social-tiktok', 'TikTok Social Scanner', 'tiktok', ['profiles', 'videos', 'comments', 'hashtags', 'sounds', 'engagement metrics'], ['TikTok scraper/provider', 'comment extraction', 'hashtag and sound extraction']),
        plannedTrendScanner(),
        WEB_ENRICHMENT_SCANNER,
      ];
    case 'social_profile':
      return [
        plannedSocialScanner(`social-${entity.platform || 'unknown'}`, `${formatOpsInputPlatform(entity.platform)} Social Scanner`, entity.platform || 'unknown', ['profiles', 'posts', 'comments', 'engagement metrics'], ['platform provider connector', 'profile/post extraction']),
        WEB_ENRICHMENT_SCANNER,
      ];
    case 'video':
      return [
        plannedSocialScanner('social-video', `${formatOpsInputPlatform(entity.platform)} Video Scanner`, entity.platform || 'youtube', ['videos', 'channels', 'comments', 'transcripts', 'view metrics'], ['video metadata extraction', 'comment extraction', 'transcript extraction when available']),
        WEB_ENRICHMENT_SCANNER,
      ];
    case 'discussion_thread':
    case 'forum_topic':
      return [
        plannedForumScanner(entity.platform === 'reddit' ? 'reddit' : 'forum'),
        WEB_ENRICHMENT_SCANNER,
      ];
    case 'url':
    case 'news_article':
      return [
        plannedWebScanner(true),
        COMPETITOR_ENRICHMENT_SCANNER,
      ];
    case 'hashtag':
    case 'topic':
    case 'keyword':
      return [
        plannedTrendScanner(),
        plannedWebScanner(false),
        COMPETITOR_ENRICHMENT_SCANNER,
      ];
    case 'brand':
    case 'product':
    case 'service':
      return [
        plannedResolverScanner(entity.type),
        plannedTrendScanner(),
        plannedWebScanner(false),
        COMPETITOR_ENRICHMENT_SCANNER,
      ];
    case 'comment':
      return [
        plannedTextAiScanner(),
        plannedWebScanner(false),
      ];
    default:
      return [plannedTextAiScanner()];
  }
}

export function selectOpsScanners(entity: OpsInputEntity | undefined): OpsScannerSelectionResult {
  if (!entity) {
    return {
      readiness: 'invalid',
      canRun: false,
      scanners: [],
      message: 'No input entity has been detected, so scanner selection cannot run.',
    };
  }

  const scanners = scannerPlanForEntity(entity);
  const primaryScanner = scanners.find((item) => item.isPrimary) || scanners[0];
  const canRun = primaryScanner?.implementationStatus === 'available';

  return {
    readiness: canRun ? 'runnable' : 'pending_scanner',
    canRun,
    primaryScanner,
    scanners,
    message: canRun
      ? `${primaryScanner.label} is available. Enrichment scanners will run where enabled by the current pipeline.`
      : `${primaryScanner.label} has been selected, but the primary scanner backend is not implemented yet.`,
  };
}

export function formatScannerType(type: OpsScannerType): string {
  const labels: Record<OpsScannerType, string> = {
    social: 'Social Scanner',
    web: 'Web Scanner',
    forum: 'Forum Scanner',
    trend: 'Trend Scanner',
    competitor: 'Competitor Scanner',
    text_ai: 'Text AI Scanner',
  };
  return labels[type];
}
