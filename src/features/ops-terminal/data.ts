import { OpsDemoResult, OpsRunInput, PipelineStage } from './types';

export const OPS_PIPELINE_STAGES: PipelineStage[] = [
  { id: 'validate_url', label: 'Validate Instagram post URL', detail: 'Confirm URL format and post identity' },
  { id: 'scrape_source_post', label: 'Scrape source post', detail: 'Extract post caption, engagement, and comments' },
  { id: 'scrape_profile_posts', label: 'Scrape profile posts', detail: 'Collect recent profile posts for context' },
  { id: 'extract_topics', label: 'Extract topic and narratives', detail: 'Group discussion themes and polarity' },
  { id: 'x_signals', label: 'Search X/Grok signals', detail: 'Map echo patterns and key reactions' },
  { id: 'web_evidence', label: 'Search web/OpenAI evidence', detail: 'Surface matching external media narratives' },
  { id: 'discover_competitors', label: 'Discover competitors', detail: 'Identify comparable brands in conversation' },
  { id: 'analyze_competitors', label: 'Analyze top 3 competitors', detail: 'Compare messaging pressure and response quality' },
  { id: 'audience_status', label: 'Build audience status', detail: 'Summarize sentiment concerns and opportunities' },
  { id: 'brand_position', label: 'Build brand position', detail: 'Produce SWOT and decision-ready recommendation' },
];

export const DEFAULT_OPS_INPUT: OpsRunInput = {
  instagramPostUrl: 'https://www.instagram.com/p/DM-BRAND42/',
  recentProfilePosts: 8,
};

function extractHandle(url: string): string {
  const normalized = url.trim().toLowerCase();
  if (normalized.includes('/nike')) return '@nike';
  if (normalized.includes('/adidas')) return '@adidas';
  if (normalized.includes('/zar')) return '@zara';
  return '@brand_ambassador_target';
}

export function createDemoResult(input: OpsRunInput): OpsDemoResult {
  const posts = Math.max(3, Math.min(20, input.recentProfilePosts));
  const accountHandle = extractHandle(input.instagramPostUrl);
  const positiveShare = Math.min(72, 56 + Math.round(posts * 0.9));
  const criticalShare = Math.max(10, 24 - Math.round(posts * 0.5));
  const neutralShare = 100 - positiveShare - criticalShare;

  return {
    accountHandle,
    followerMap: [
      { name: 'Core Supporters', share: positiveShare, trend: 'up' },
      { name: 'Neutral Audience', share: neutralShare, trend: 'stable' },
      { name: 'Critical Cluster', share: criticalShare, trend: 'down' },
    ],
    narrativeThemes: [
      { title: 'Product durability confidence', sentiment: 'positive', evidence: 'Repeated mention of lifespan and quality in top comments.' },
      { title: 'Price-pressure discussion', sentiment: 'neutral', evidence: 'Value-for-money debates are steady across profile posts.' },
      { title: 'Delivery speed criticism', sentiment: 'negative', evidence: 'Localized complaints cluster around delayed shipping windows.' },
    ],
    socialSignals: [
      { source: 'X / trend cluster', signal: 'Positive amplification from micro-influencers after reposts.', intensity: 'high' },
      { source: 'X / competitor mentions', signal: 'Comparison chatter with premium competitor is increasing.', intensity: 'medium' },
      { source: 'Community threads', signal: 'Service friction topics tapering after support replies.', intensity: 'low' },
    ],
    webEvidence: [
      { outlet: 'RetailWatch Daily', finding: 'Market tone favors transparent sourcing narratives.', confidence: 87 },
      { outlet: 'SocialPulse Monitor', finding: 'Brand mentions rose after sustainability-focused post sequence.', confidence: 81 },
      { outlet: 'Commerce Briefing', finding: 'Competitor campaign underperformed on trust messaging this week.', confidence: 76 },
    ],
    competitors: [
      {
        name: 'UrbanThread Co.',
        position: 'High awareness, lower trust on fulfillment consistency.',
        risk: 'Can capture undecided buyers through heavy paid reach.',
        action: 'Counter with proof-based delivery performance messaging.',
      },
      {
        name: 'NovaWear Collective',
        position: 'Strong creator partnerships and trend-driven narrative lift.',
        risk: 'Short-term share shift among younger segments.',
        action: 'Increase creator co-sign content tied to product outcomes.',
      },
      {
        name: 'EcoLoop Apparel',
        position: 'Sustainability-first positioning with moderate engagement depth.',
        risk: 'Narrative overlap could dilute differentiation.',
        action: 'Emphasize measurable impact metrics and customer evidence.',
      },
    ],
    audienceStatus: {
      sentiment: `Overall sentiment is positive with ${positiveShare}% supportive audience share after analyzing ${posts} recent posts.`,
      concerns: [
        'Delivery speed confidence in two key metro clusters.',
        'Price sensitivity among first-time buyers.',
        'Skepticism around competitor comparison claims.',
      ],
      opportunities: [
        'Reinforce product durability proof in short-form creative.',
        'Deploy targeted fulfillment transparency updates.',
        'Scale creator-led testimonials in neutral segments.',
      ],
    },
    brandPosition: {
      strengths: ['High trust among core supporters', 'Consistent product-quality narrative', 'Rising positive signal velocity'],
      weaknesses: ['Service-delay perception in specific regions', 'Limited differentiation in price messaging'],
      opportunities: ['Expand creator proof format', 'Activate market education on lifecycle value'],
      threats: ['Aggressive paid activity by premium competitors', 'Narrative hijacking during delivery spikes'],
      recommendation:
        'Prioritize a two-week evidence-led campaign: lead with fulfillment transparency and creator proof to convert neutral audience before competitor push cycles.',
    },
  };
}
