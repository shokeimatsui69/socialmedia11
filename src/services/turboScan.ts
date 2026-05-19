import type { IntelligencePipelineRequest, IntelligencePipelineResult } from '../types';

export type TurboScanInputType = 'post' | 'reel' | 'profile';

export interface DetectedInstagramUrl {
  originalUrl: string;
  normalizedUrl: string;
  type: TurboScanInputType;
  handle?: string;
  shortcode?: string;
}

export interface InstagramUrlDetectionResult {
  isValid: boolean;
  error?: string;
  detected?: DetectedInstagramUrl;
}

export interface TurboScanSettings {
  postCount: number;
  includeXSearch: boolean;
  includeWebSearch: boolean;
  includeCompetitors: boolean;
  competitorCount: number;
  commentLimit: number;
  likeLimit: number;
}

export const DEFAULT_TURBO_SCAN_SETTINGS: TurboScanSettings = {
  postCount: 3,
  includeXSearch: true,
  includeWebSearch: true,
  includeCompetitors: true,
  competitorCount: 3,
  commentLimit: 25,
  likeLimit: 0,
};

const TURBO_SCAN_CLIENT_TIMEOUT_MS = 15 * 60 * 1000;

const SUPPORTED_HOSTS = new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com']);
const RESERVED_PROFILE_SEGMENTS = new Set([
  'about',
  'accounts',
  'api',
  'developer',
  'direct',
  'explore',
  'legal',
  'oauth',
  'p',
  'press',
  'privacy',
  'reel',
  'reels',
  'stories',
  'terms',
  'tv',
]);

const HANDLE_PATTERN = /^[A-Za-z0-9._]{1,30}$/;
const SHORTCODE_PATTERN = /^[A-Za-z0-9_-]+$/;

const asUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`;

  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
};

export function detectInstagramUrl(input: string): InstagramUrlDetectionResult {
  const url = asUrl(input);
  if (!url) {
    return { isValid: false, error: 'Enter a valid Instagram URL.' };
  }

  if (!SUPPORTED_HOSTS.has(url.hostname.toLowerCase())) {
    return { isValid: false, error: 'TurboScan supports instagram.com URLs only.' };
  }

  const segments = url.pathname.split('/').filter(Boolean);
  if (!segments.length) {
    return { isValid: false, error: 'Paste an Instagram post, Reel, or profile URL.' };
  }

  const firstSegment = segments[0].toLowerCase();
  if (['p', 'reel', 'reels', 'tv'].includes(firstSegment)) {
    const shortcode = segments[1];
    if (!shortcode || !SHORTCODE_PATTERN.test(shortcode)) {
      return { isValid: false, error: 'This Instagram post or Reel URL is missing a valid shortcode.' };
    }

    const normalizedMarker = firstSegment === 'reels' ? 'reel' : firstSegment;
    const type: TurboScanInputType = normalizedMarker === 'reel' ? 'reel' : 'post';
    return {
      isValid: true,
      detected: {
        originalUrl: input.trim(),
        normalizedUrl: `https://www.instagram.com/${normalizedMarker}/${shortcode}/`,
        type,
        shortcode,
      },
    };
  }

  const handle = segments[0];
  if (RESERVED_PROFILE_SEGMENTS.has(firstSegment) || !HANDLE_PATTERN.test(handle)) {
    return { isValid: false, error: 'This URL is not a supported Instagram post, Reel, or profile URL.' };
  }

  return {
    isValid: true,
    detected: {
      originalUrl: input.trim(),
      normalizedUrl: `https://www.instagram.com/${handle}/`,
      type: 'profile',
      handle,
    },
  };
}

export function buildTurboScanRequest(
  target: DetectedInstagramUrl,
  settings: TurboScanSettings,
): IntelligencePipelineRequest {
  const isProfile = target.type === 'profile';

  return {
    url: target.normalizedUrl,
    handle: target.handle,
    source: 'instagram',
    mode: isProfile ? 'latest_n' : 'manual_urls',
    count: isProfile ? settings.postCount : 1,
    urls: isProfile ? '' : target.normalizedUrl,
    commentLimit: settings.commentLimit,
    likeLimit: settings.likeLimit,
    includeXSearch: settings.includeXSearch,
    includeWebSearch: settings.includeWebSearch,
    includeCompetitors: settings.includeCompetitors,
    competitorCount: settings.includeCompetitors ? settings.competitorCount : 0,
  };
}

export async function runTurboScan(
  target: DetectedInstagramUrl,
  settings: TurboScanSettings,
): Promise<IntelligencePipelineResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), TURBO_SCAN_CLIENT_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch('/api/intelligence/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildTurboScanRequest(target, settings)),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('TurboScan timed out after 15 minutes. Try again with competitor discovery disabled or fewer posts.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || 'TurboScan could not complete the intelligence workflow.');
  }

  return payload as IntelligencePipelineResult;
}
