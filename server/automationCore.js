import { setTimeout as sleep } from 'node:timers/promises';
import {
  INSTAGRAM_POST_URL_VALIDATION_MESSAGE,
  normalizeInstagramPostUrl,
  parseCommentsJsonInput,
} from '../shared/instagramAutomation.js';

const DEFAULT_APIFY_BASE_URL = 'https://api.apify.com';
const DEFAULT_BULK_LIKE_ACTOR_ID = 'dead00/instagram-like-bot';
const DEFAULT_BULK_COMMENT_ACTOR_ID = 'dead00/insta-comment-bot';
const DEFAULT_INSTAGRAM_CONFIG_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1iYioMSubUS7Uk5hTPLTryGQblD9Tezi-iQfZt_y0rfc/edit?gid=0#gid=0';
const DEFAULT_APIFY_TIMEOUT_MS = 120_000;
const DEFAULT_CONCURRENCY_CAP = 50;

const COOKIE_COLUMNS = [
  'cookies',
  'cookie',
  'sessioncookies',
  'session_cookies',
  'instagramcookies',
  'instagram_cookies',
  'cookiejson',
  'cookie_json',
  'cookiesjson',
  'cookies_json',
  'cookieconfig',
  'cookie_config',
];

const SESSION_COLUMNS = ['sessionid', 'session_id', 'ig_sessionid', 'instagram_sessionid'];
const COMMENT_COLUMNS = ['comment', 'commenttext', 'comment_text', 'bulkcomment', 'bulk_comment', 'message', 'text', 'caption'];
const LABEL_COLUMNS = [
  'label',
  'displaylabel',
  'display_label',
  'username',
  'handle',
  'account',
  'multilogin_profile_name',
  'profile',
  'name',
];

export const AUTOMATION_DEFAULTS = {
  likeActorId: DEFAULT_BULK_LIKE_ACTOR_ID,
  commentActorId: DEFAULT_BULK_COMMENT_ACTOR_ID,
  concurrencyCap: DEFAULT_CONCURRENCY_CAP,
};

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

function envNumber(name, fallback, options = {}) {
  const parsed = Number(process.env[name]);
  if (!Number.isFinite(parsed)) return fallback;
  const min = options.min ?? Number.NEGATIVE_INFINITY;
  const max = options.max ?? Number.POSITIVE_INFINITY;
  return Math.min(max, Math.max(min, parsed));
}

function envString(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  row.push(field);
  rows.push(row);
  return rows.filter((item) => item.some((cell) => String(cell || '').trim()));
}

function rowValue(row, names) {
  for (const name of names) {
    const value = row[name];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function parseCookieJson(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return [parsed];
  } catch {
    // Fall through to semicolon cookie parsing.
  }

  if (!value.includes('=')) return null;

  const cookies = value
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf('=');
      if (separator <= 0) return null;
      return {
        domain: '.instagram.com',
        path: '/',
        secure: true,
        name: part.slice(0, separator).trim(),
        value: part.slice(separator + 1).trim(),
      };
    })
    .filter(Boolean);

  return cookies.length ? cookies : null;
}

function cookiesFromRow(row) {
  const cookieCell = rowValue(row, COOKIE_COLUMNS);
  const parsedCookies = parseCookieJson(cookieCell);
  if (parsedCookies?.length) return parsedCookies;

  const sessionId = rowValue(row, SESSION_COLUMNS);
  if (!sessionId) return null;

  const cookies = [
    {
      domain: '.instagram.com',
      path: '/',
      secure: true,
      httpOnly: true,
      name: 'sessionid',
      value: sessionId,
    },
  ];

  for (const name of ['csrftoken', 'ds_user_id', 'mid', 'ig_did', 'rur']) {
    const value = rowValue(row, [name]);
    if (value) {
      cookies.push({
        domain: '.instagram.com',
        path: '/',
        secure: true,
        name,
        value,
      });
    }
  }

  return cookies;
}

function sheetCommentFromRow(row) {
  const direct = rowValue(row, COMMENT_COLUMNS);
  if (!direct) return '';

  const parsed = parseCommentsJsonInput(direct);
  if (parsed.ok && parsed.comments.length) return parsed.comments[0];
  return direct.trim();
}

function labelFromRow(row, rowNumber) {
  const label = rowValue(row, LABEL_COLUMNS);
  if (!label) return `Sheet row ${rowNumber}`;
  return label.startsWith('@') ? label : label;
}

function rowsFromCsv(text) {
  const csvRows = parseCsv(text);
  if (csvRows.length < 2) return [];

  const headers = csvRows[0].map(normalizeHeader);
  return csvRows.slice(1).map((cells, index) => {
    const row = {};
    headers.forEach((header, cellIndex) => {
      if (header) row[header] = String(cells[cellIndex] || '').trim();
    });
    return {
      rowNumber: index + 2,
      row,
    };
  });
}

function toCsvUrl(input) {
  const source = String(input || '').trim();
  if (!source) return '';

  let url;
  try {
    url = new URL(source);
  } catch {
    return source;
  }

  if (!/docs\.google\.com$/i.test(url.hostname) || !url.pathname.includes('/spreadsheets/d/')) {
    return source;
  }

  const match = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
  if (!match) return source;

  const gidFromHash = url.hash.match(/gid=(\d+)/)?.[1];
  const gidFromQuery = url.searchParams.get('gid');
  const gid = gidFromHash || gidFromQuery || '0';

  if (url.pathname.includes('/pub') || url.searchParams.get('output') === 'csv') {
    url.searchParams.set('output', 'csv');
    return url.toString();
  }

  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`;
}

function defaultSheetUrl() {
  return DEFAULT_INSTAGRAM_CONFIG_SHEET_URL;
}

export function getSheetUrl(kind, sheetUrl) {
  const value = defaultSheetUrl(kind);
  if (!value) {
    throw new Error('Instagram config sheet URL is not configured on the server.');
  }
  return value;
}

export async function fetchSheetRows(kind, sheetUrl) {
  const resolvedSheetUrl = getSheetUrl(kind, sheetUrl);
  const csvUrl = toCsvUrl(resolvedSheetUrl);
  const response = await fetch(csvUrl, {
    headers: {
      Accept: 'text/csv,text/plain,*/*',
    },
  });

  if (!response.ok) {
    throw new Error(`Sheet CSV could not be fetched (${response.status} ${response.statusText}). Make sure it is shared as Anyone with the link or published as CSV.`);
  }

  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  if (/text\/html/i.test(contentType) || /^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text)) {
    throw new Error('Sheet CSV could not be read. Make sure the Google Sheet is shared as Anyone with the link viewer or published as CSV.');
  }
  return rowsFromCsv(text);
}

function commentPlanForProfiles(profiles, commentText, commentsJson) {
  const parsedJson = parseCommentsJsonInput(commentsJson);
  if (!parsedJson.ok) {
    throw new Error(parsedJson.error);
  }

  const trimmedText = String(commentText || '').trim();

  if (parsedJson.comments.length) {
    if (parsedJson.comments.length === profiles.length) {
      return {
        mode: 'aligned_json',
        comments: parsedJson.comments,
        describe: (index) => `JSON aligned #${index + 1}`,
        commentsForProfile: (index) => [parsedJson.comments[index]],
      };
    }
    return {
      mode: 'global_json_pool',
      comments: parsedJson.comments,
      describe: () => 'JSON global pool',
      commentsForProfile: () => parsedJson.comments,
    };
  }

  if (trimmedText) {
    return {
      mode: 'single_comment',
      comments: [trimmedText],
      describe: () => 'Single comment',
      commentsForProfile: () => [trimmedText],
    };
  }

  return {
    mode: 'sheet_comments',
    comments: [],
    describe: (_index, profile) => (profile.sheetComment ? 'Sheet comment' : 'Missing sheet comment'),
    commentsForProfile: (_index, profile) => (profile.sheetComment ? [profile.sheetComment] : []),
  };
}

function buildProfiles(rows, kind, options = {}) {
  const selected = Array.isArray(options.selectedRowNumbers) && options.selectedRowNumbers.length
    ? new Set(options.selectedRowNumbers.map(Number))
    : null;

  const profiles = rows
    .filter((item) => !selected || selected.has(item.rowNumber))
    .map((item) => {
      const cookies = cookiesFromRow(item.row);
      const sheetComment = sheetCommentFromRow(item.row);
      return {
        rowNumber: item.rowNumber,
        label: labelFromRow(item.row, item.rowNumber),
        cookies,
        sheetComment,
      };
    })
    .filter((profile) => Array.isArray(profile.cookies) && profile.cookies.length);

  if (kind === 'bulk_comment') {
    const plan = commentPlanForProfiles(profiles, options.commentText, options.commentsJson);
    return profiles.map((profile, index) => ({
      ...profile,
      commentMode: plan.describe(index, profile),
      comments: plan.commentsForProfile(index, profile),
      commentPlanMode: plan.mode,
    }));
  }

  return profiles;
}

export async function previewSheetProfiles({ kind, sheetUrl, commentText = '', commentsJson = '' }) {
  if (!['bulk_like', 'bulk_comment'].includes(kind)) {
    throw new Error('kind must be "bulk_like" or "bulk_comment".');
  }
  if (kind === 'bulk_comment') {
    const parsedJson = parseCommentsJsonInput(commentsJson);
    if (!parsedJson.ok) throw new Error(parsedJson.error);
  }

  const rows = await fetchSheetRows(kind, sheetUrl);
  const profiles = buildProfiles(rows, kind, { commentText, commentsJson });
  return {
    rows: profiles.map((profile) => ({
      rowNumber: profile.rowNumber,
      label: profile.label,
      commentMode: profile.commentMode,
      commentReady: kind === 'bulk_comment' ? profile.comments.length > 0 : undefined,
    })),
  };
}

function parseRowNumbers(value) {
  const raw = String(value || '').trim();
  if (!raw) return undefined;
  const numbers = raw
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
  return [...new Set(numbers)].sort((a, b) => a - b);
}

export async function resolveProfilesForRun({
  kind,
  sheetUrl,
  selectedRowNumbers,
  commentText = '',
  commentsJson = '',
}) {
  const rows = await fetchSheetRows(kind, sheetUrl);
  const profiles = buildProfiles(rows, kind, {
    selectedRowNumbers,
    commentText,
    commentsJson,
  });

  if (!profiles.length) {
    throw new Error('No eligible sheet rows were found. Each selected profile row must include Instagram session cookies.');
  }

  if (kind === 'bulk_comment') {
    const missing = profiles.filter((profile) => !profile.comments.length).map((profile) => profile.rowNumber);
    if (missing.length) {
      throw new Error(`Comment source is missing for sheet row(s): ${missing.join(', ')}. Add a single comment, valid Comments JSON, or per-row sheet comments.`);
    }
  }

  return profiles;
}

function validateInteger(value, label, min, max = Number.POSITIVE_INFINITY) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}

export function validateSelectedRowNumbers(selectedRowNumbers) {
  if (selectedRowNumbers === undefined || selectedRowNumbers === null) return undefined;
  if (!Array.isArray(selectedRowNumbers)) {
    throw new Error('selectedRowNumbers must be an array of 1-based sheet row numbers.');
  }
  if (!selectedRowNumbers.length) {
    throw new Error('Select at least one sheet row or choose all loaded rows.');
  }
  const numbers = selectedRowNumbers.map((item) => Number(item));
  if (numbers.some((item) => !Number.isInteger(item) || item < 1)) {
    throw new Error('selectedRowNumbers must contain positive integer sheet row numbers.');
  }
  return [...new Set(numbers)].sort((a, b) => a - b);
}

export function validateBulkLikePayload(body) {
  const normalized = normalizeInstagramPostUrl(body?.postUrl);
  if (!normalized.isValid) {
    throw new Error(INSTAGRAM_POST_URL_VALIDATION_MESSAGE);
  }

  const delayBetweenLikes = validateInteger(body?.delayBetweenLikes, 'Delay between likes', 10, 300);
  return {
    postUrl: normalized.normalizedUrl,
    sheetUrl: String(body?.sheetUrl || '').trim(),
    concurrency: validateInteger(body?.concurrency ?? 1, 'Concurrency', 1, DEFAULT_CONCURRENCY_CAP),
    delayBetweenLikes,
    maxLikesPerRun: validateInteger(body?.maxLikesPerRun ?? 1, 'Max likes per run', 1, 1000),
    selectedRowNumbers: validateSelectedRowNumbers(body?.selectedRowNumbers),
  };
}

export function validateBulkCommentPayload(body) {
  const normalized = normalizeInstagramPostUrl(body?.postUrl);
  if (!normalized.isValid) {
    throw new Error(INSTAGRAM_POST_URL_VALIDATION_MESSAGE);
  }

  const commentText = String(body?.commentText || '').trim();
  const commentsJson = String(body?.commentsJson || '').trim();
  const parsedJson = parseCommentsJsonInput(commentsJson);
  if (!parsedJson.ok) {
    throw new Error(parsedJson.error);
  }

  return {
    postUrl: normalized.normalizedUrl,
    commentText,
    commentsJson,
    sheetUrl: String(body?.sheetUrl || '').trim(),
    concurrency: validateInteger(body?.concurrency ?? 1, 'Concurrency', 1, DEFAULT_CONCURRENCY_CAP),
    delayBetweenCommentsSec: validateInteger(body?.delayBetweenCommentsSec ?? 15, 'Delay between comments', 1, 3600),
    selectedRowNumbers: validateSelectedRowNumbers(body?.selectedRowNumbers),
  };
}

function apifyBaseUrl() {
  const base = envString('APIFY_BASE_URL') || DEFAULT_APIFY_BASE_URL;
  return base.replace(/\/+$/, '').endsWith('/v2')
    ? base.replace(/\/+$/, '')
    : `${base.replace(/\/+$/, '')}/v2`;
}

function toApiActorId(actorId) {
  return actorId.includes('/') ? actorId.replace('/', '~') : actorId;
}

function apifyToken() {
  const token = envString('APIFY_TOKEN', 'APIFY_API_KEY');
  if (!token) {
    throw new Error('APIFY_TOKEN is required. APIFY_API_KEY is also supported for this app.');
  }
  return token;
}

function readableApifyError(payload, fallback) {
  if (payload && typeof payload === 'object') {
    return payload.error?.message || payload.error?.type || payload.message || fallback;
  }
  if (typeof payload === 'string' && payload.trim()) return payload.trim();
  return fallback;
}

async function fetchApifyJson(path) {
  const token = apifyToken();
  const response = await fetch(`${apifyBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const text = await response.text();
  let payload = text;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = text;
  }

  if (!response.ok) {
    throw new Error(`Apify usage request failed: ${readableApifyError(payload, response.statusText)}`);
  }

  return payload?.data || payload;
}

function roundCredits(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 10000) / 10000;
}

function serviceAmount(serviceUsage) {
  return Number(serviceUsage?.amountAfterVolumeDiscountUsd ?? serviceUsage?.baseAmountUsd ?? 0) || 0;
}

function readableServiceName(service) {
  return String(service || '')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function getApifyUsageSummary() {
  const [user, monthly] = await Promise.all([
    fetchApifyJson('/users/me'),
    fetchApifyJson('/users/me/usage/monthly'),
  ]);

  const plan = user?.plan || {};
  const monthlyServiceUsage = monthly?.monthlyServiceUsage || {};
  const usedCreditsUsd = roundCredits(
    monthly?.totalUsageCreditsUsdAfterVolumeDiscount
      ?? monthly?.totalUsageCreditsUsdBeforeVolumeDiscount
      ?? 0,
  );
  const includedCreditsUsd = roundCredits(plan.monthlyUsageCreditsUsd ?? 0);
  const maxMonthlyUsageUsd = roundCredits(plan.maxMonthlyUsageUsd ?? 0);
  const remainingIncludedCreditsUsd = roundCredits(Math.max(0, includedCreditsUsd - usedCreditsUsd));
  const remainingMonthlyLimitUsd = maxMonthlyUsageUsd
    ? roundCredits(Math.max(0, maxMonthlyUsageUsd - usedCreditsUsd))
    : null;

  const serviceUsage = Object.entries(monthlyServiceUsage)
    .map(([service, usage]) => ({
      service,
      label: readableServiceName(service),
      quantity: Number(usage?.quantity ?? 0) || 0,
      amountUsd: roundCredits(serviceAmount(usage)),
    }))
    .filter((item) => item.amountUsd > 0)
    .sort((a, b) => b.amountUsd - a.amountUsd);

  const actorUsageUsd = roundCredits(serviceUsage
    .filter((item) => item.service.includes('ACTOR') || item.service.includes('PAID_ACTORS'))
    .reduce((total, item) => total + item.amountUsd, 0));

  return {
    username: user?.username || '',
    planId: plan.id || '',
    planDescription: plan.description || '',
    usageCycle: monthly?.usageCycle || null,
    includedCreditsUsd,
    usedCreditsUsd,
    remainingIncludedCreditsUsd,
    maxMonthlyUsageUsd,
    remainingMonthlyLimitUsd,
    actorUsageUsd,
    serviceUsage: serviceUsage.slice(0, 8),
    fetchedAt: new Date().toISOString(),
  };
}

export async function dispatchApifyRun(actorId, input, log = () => {}) {
  const token = apifyToken();
  const waitForFinish = envNumber('APIFY_WAIT_FOR_FINISH', 0, { min: 0, max: 3600 });
  const timeoutMs = envNumber('APIFY_TIMEOUT_MS', DEFAULT_APIFY_TIMEOUT_MS, { min: 1000 });
  const url = new URL(`${apifyBaseUrl()}/acts/${encodeURIComponent(toApiActorId(actorId))}/runs`);
  if (waitForFinish > 0) url.searchParams.set('waitForFinish', String(waitForFinish));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    const text = await response.text();
    let payload = text;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = text;
    }

    if (!response.ok) {
      throw new Error(`Apify actor ${actorId} failed: ${readableApifyError(payload, response.statusText)}`);
    }

    const run = payload?.data || payload;
    log(`Apify run ${run?.id || 'created'} status: ${run?.status || 'SUBMITTED'}`);
    return run;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Apify actor ${actorId} timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function runPool(items, concurrency, handler) {
  const results = [];
  let cursor = 0;
  const workerCount = Math.min(concurrency, items.length);

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await handler(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

function logProfileStart(log, action, profile, index, total) {
  log(`[${index + 1}/${total}] Row ${profile.rowNumber} (${profile.label}) ${action}.`);
}

export async function runBulkLike({ postUrl, sheetUrl, concurrency, delayBetweenLikes, maxLikesPerRun, selectedRowNumbers }, log = console.log) {
  const profiles = await resolveProfilesForRun({
    kind: 'bulk_like',
    sheetUrl,
    selectedRowNumbers,
  });
  const actorId = envString('BULK_LIKE_APIFY_ACTOR_ID') || DEFAULT_BULK_LIKE_ACTOR_ID;
  log(`Bulk Like loaded ${profiles.length} eligible profile row(s).`);
  log(`Dispatching actor ${actorId} with concurrency ${concurrency}.`);

  const results = await runPool(profiles, concurrency, async (profile, index) => {
    logProfileStart(log, 'like run dispatching', profile, index, profiles.length);
    const run = await dispatchApifyRun(actorId, {
      cookies: profile.cookies,
      postUrls: [postUrl],
      delayBetweenLikes,
      maxLikesPerRun,
    }, log);
    return { rowNumber: profile.rowNumber, label: profile.label, runId: run?.id, status: run?.status };
  });

  log(`Bulk Like complete. Dispatched ${results.length} Apify run(s).`);
  return results;
}

export async function runBulkComment({ postUrl, sheetUrl, concurrency, delayBetweenCommentsSec, selectedRowNumbers, commentText, commentsJson }, log = console.log) {
  const profiles = await resolveProfilesForRun({
    kind: 'bulk_comment',
    sheetUrl,
    selectedRowNumbers,
    commentText,
    commentsJson,
  });
  const actorId = envString('BULK_COMMENT_APIFY_ACTOR_ID') || DEFAULT_BULK_COMMENT_ACTOR_ID;
  const delayMs = Math.max(0, Number(delayBetweenCommentsSec || 0)) * 1000;
  let nextDispatchAt = Date.now();

  async function waitForDispatchSlot() {
    if (delayMs <= 0) return;
    const now = Date.now();
    const waitMs = Math.max(0, nextDispatchAt - now);
    nextDispatchAt = Math.max(now, nextDispatchAt) + delayMs;
    if (waitMs > 0) await sleep(waitMs);
  }

  log(`Bulk Comment loaded ${profiles.length} eligible profile row(s).`);
  log(`Comment mode: ${profiles[0]?.commentPlanMode || 'sheet_comments'}.`);
  log(`Dispatching actor ${actorId} with concurrency ${concurrency} and global ${delayBetweenCommentsSec}s dispatch throttle.`);

  const results = await runPool(profiles, concurrency, async (profile, index) => {
    await waitForDispatchSlot();
    logProfileStart(log, 'comment run dispatching', profile, index, profiles.length);
    const run = await dispatchApifyRun(actorId, {
      cookies: profile.cookies,
      comments: profile.comments,
      post_urls: [postUrl],
    }, log);
    return { rowNumber: profile.rowNumber, label: profile.label, runId: run?.id, status: run?.status };
  });

  log(`Bulk Comment complete. Dispatched ${results.length} Apify run(s).`);
  return results;
}

export function envConfigForBulkLike(payload) {
  return {
    BULK_LIKE_CONCURRENCY: String(payload.concurrency),
    BULK_LIKE_DELAY_BETWEEN_LIKES: String(payload.delayBetweenLikes),
    BULK_LIKE_MAX_LIKES_PER_RUN: String(payload.maxLikesPerRun),
    ...(payload.sheetUrl ? { BULK_LIKE_SHEET_URL: payload.sheetUrl } : {}),
    ...(payload.selectedRowNumbers?.length ? { BULK_LIKE_ROW_NUMBERS: payload.selectedRowNumbers.join(',') } : {}),
  };
}

export function envConfigForBulkComment(payload) {
  return {
    BULK_COMMENT_CONCURRENCY: String(payload.concurrency),
    BULK_COMMENT_DELAY_BETWEEN_RUNS_SEC: String(payload.delayBetweenCommentsSec),
    ...(payload.sheetUrl ? { BULK_COMMENT_SHEET_URL: payload.sheetUrl } : {}),
    ...(payload.selectedRowNumbers?.length ? { BULK_COMMENT_ROW_NUMBERS: payload.selectedRowNumbers.join(',') } : {}),
    ...(payload.commentsJson ? { BULK_COMMENT_COMMENTS_JSON: payload.commentsJson } : {}),
    ...(!payload.commentsJson && payload.commentText ? { BULK_COMMENT_TEXT: payload.commentText } : {}),
  };
}

export function payloadFromBulkLikeEnv(postUrl) {
  const normalized = normalizeInstagramPostUrl(postUrl);
  if (!normalized.isValid) {
    throw new Error(INSTAGRAM_POST_URL_VALIDATION_MESSAGE);
  }
  return {
    postUrl: normalized.normalizedUrl,
    sheetUrl: envString('BULK_LIKE_SHEET_URL'),
    concurrency: envNumber('BULK_LIKE_CONCURRENCY', 1, { min: 1, max: DEFAULT_CONCURRENCY_CAP }),
    delayBetweenLikes: envNumber('BULK_LIKE_DELAY_BETWEEN_LIKES', 20, { min: 10, max: 300 }),
    maxLikesPerRun: envNumber('BULK_LIKE_MAX_LIKES_PER_RUN', 1, { min: 1, max: 1000 }),
    selectedRowNumbers: parseRowNumbers(process.env.BULK_LIKE_ROW_NUMBERS),
  };
}

export function payloadFromBulkCommentEnv(postUrl) {
  const normalized = normalizeInstagramPostUrl(postUrl);
  if (!normalized.isValid) {
    throw new Error(INSTAGRAM_POST_URL_VALIDATION_MESSAGE);
  }
  const commentsJson = envString('BULK_COMMENT_COMMENTS_JSON');
  const parsedJson = parseCommentsJsonInput(commentsJson);
  if (!parsedJson.ok) throw new Error(parsedJson.error);
  return {
    postUrl: normalized.normalizedUrl,
    sheetUrl: envString('BULK_COMMENT_SHEET_URL'),
    concurrency: envNumber('BULK_COMMENT_CONCURRENCY', 1, { min: 1, max: DEFAULT_CONCURRENCY_CAP }),
    delayBetweenCommentsSec: envNumber('BULK_COMMENT_DELAY_BETWEEN_RUNS_SEC', 15, { min: 1, max: 3600 }),
    selectedRowNumbers: parseRowNumbers(process.env.BULK_COMMENT_ROW_NUMBERS),
    commentText: envString('BULK_COMMENT_TEXT'),
    commentsJson,
  };
}
