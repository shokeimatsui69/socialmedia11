export type PipelineStatus = 'waiting' | 'running' | 'completed';

export interface OpsRunInput {
  instagramPostUrl: string;
  recentProfilePosts: number;
}

export interface PipelineStage {
  id: string;
  label: string;
  detail: string;
}

export interface AudienceSegment {
  name: string;
  share: number;
  trend: 'up' | 'stable' | 'down';
}

export interface NarrativeTheme {
  title: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  evidence: string;
}

export interface SocialSignal {
  source: string;
  signal: string;
  intensity: 'high' | 'medium' | 'low';
}

export interface WebEvidenceItem {
  outlet: string;
  finding: string;
  confidence: number;
}

export interface CompetitorInsight {
  name: string;
  position: string;
  risk: string;
  action: string;
}

export interface AudienceStatus {
  sentiment: string;
  concerns: string[];
  opportunities: string[];
}

export interface BrandPosition {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendation: string;
}

export interface OpsDemoResult {
  accountHandle: string;
  followerMap: AudienceSegment[];
  narrativeThemes: NarrativeTheme[];
  socialSignals: SocialSignal[];
  webEvidence: WebEvidenceItem[];
  competitors: CompetitorInsight[];
  audienceStatus: AudienceStatus;
  brandPosition: BrandPosition;
}
