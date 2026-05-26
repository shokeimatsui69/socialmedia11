export const INSTAGRAM_POST_URL_VALIDATION_MESSAGE =
  'Use an Instagram post, Reel, or TV URL: https://www.instagram.com/p/{shortcode}/, /reel/{shortcode}/, or /tv/{shortcode}/.';

const SUPPORTED_INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com']);
const INSTAGRAM_POST_PATH_PATTERN = /^\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?$/;

export function normalizeInstagramPostUrl(input) {
  const raw = String(input || '').trim();
  if (!raw) {
    return { isValid: false, error: INSTAGRAM_POST_URL_VALIDATION_MESSAGE };
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, '')}`;
  let url;
  try {
    url = new URL(withProtocol);
  } catch {
    return { isValid: false, error: INSTAGRAM_POST_URL_VALIDATION_MESSAGE };
  }

  if (!SUPPORTED_INSTAGRAM_HOSTS.has(url.hostname.toLowerCase())) {
    return { isValid: false, error: INSTAGRAM_POST_URL_VALIDATION_MESSAGE };
  }

  const normalizedPath = url.pathname.replace(/\/+$/, '/');
  const match = normalizedPath.match(INSTAGRAM_POST_PATH_PATTERN);
  if (!match) {
    return { isValid: false, error: INSTAGRAM_POST_URL_VALIDATION_MESSAGE };
  }

  const [, kind, shortcode] = match;
  return {
    isValid: true,
    normalizedUrl: `https://www.instagram.com/${kind}/${shortcode}/`,
    kind,
    shortcode,
  };
}

export function parseCommentsJsonInput(input) {
  const raw = String(input || '').trim();
  if (!raw) {
    return { ok: true, comments: [], raw: '' };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'Comments JSON must be a valid JSON array of strings.' };
  }

  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
    return { ok: false, error: 'Comments JSON must be a valid JSON array of strings.' };
  }

  const comments = parsed.map((item) => item.trim()).filter(Boolean);
  if (!comments.length) {
    return { ok: false, error: 'Comments JSON must contain at least one non-empty string.' };
  }

  return { ok: true, comments, raw };
}
