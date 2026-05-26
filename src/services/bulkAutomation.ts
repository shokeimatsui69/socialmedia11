import {
  INSTAGRAM_POST_URL_VALIDATION_MESSAGE,
  normalizeInstagramPostUrl as normalizeSharedInstagramPostUrl,
  parseCommentsJsonInput as parseSharedCommentsJsonInput,
} from '../../shared/instagramAutomation.js';

export type SheetProfileKind = 'bulk_like' | 'bulk_comment';

export interface SheetProfileRow {
  rowNumber: number;
  label: string;
  commentMode?: string;
  commentReady?: boolean;
}

export interface BackendJobLog {
  at: string;
  stream: 'stdout' | 'stderr' | 'system';
  text: string;
}

export interface BackendJob {
  id: string;
  kind: 'bulk-like' | 'bulk-comment';
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: string;
  finishedAt?: string;
  exitCode?: number | null;
  logs: BackendJobLog[];
}

export interface ApifyServiceUsage {
  service: string;
  label: string;
  quantity: number;
  amountUsd: number;
}

export interface ApifyUsageSummary {
  username: string;
  planId: string;
  planDescription: string;
  usageCycle: {
    startAt: string;
    endAt: string;
  } | null;
  includedCreditsUsd: number;
  usedCreditsUsd: number;
  remainingIncludedCreditsUsd: number;
  maxMonthlyUsageUsd: number;
  remainingMonthlyLimitUsd: number | null;
  actorUsageUsd: number;
  serviceUsage: ApifyServiceUsage[];
  fetchedAt: string;
}

export interface BulkLikePayload {
  postUrl: string;
  sheetUrl?: string;
  concurrency: number;
  delayBetweenLikes: number;
  maxLikesPerRun: number;
  selectedRowNumbers?: number[];
}

export interface BulkCommentPayload {
  postUrl: string;
  commentText?: string;
  commentsJson?: string;
  sheetUrl?: string;
  concurrency: number;
  delayBetweenCommentsSec: number;
  selectedRowNumbers?: number[];
}

export { INSTAGRAM_POST_URL_VALIDATION_MESSAGE };

export function normalizeInstagramPostUrl(input: string): {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
} {
  return normalizeSharedInstagramPostUrl(input);
}

export function parseCommentsJsonInput(input: string): {
  ok: boolean;
  error?: string;
  comments: string[];
  raw?: string;
} {
  const result = parseSharedCommentsJsonInput(input);
  if (!result.ok) {
    return { ok: false, error: result.error, comments: [] };
  }
  return { ok: true, comments: result.comments || [], raw: result.raw };
}

async function parseJsonResponse(response: Response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with status ${response.status}.`);
  }
  return payload;
}

export async function previewSheetProfiles(body: {
  kind: SheetProfileKind;
  sheetUrl?: string;
  commentText?: string;
  commentsJson?: string;
}): Promise<SheetProfileRow[]> {
  const response = await fetch('/api/sheet-profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await parseJsonResponse(response);
  return payload.rows || [];
}

export async function enqueueBulkLike(payload: BulkLikePayload): Promise<string> {
  const response = await fetch('/api/jobs/bulk-like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await parseJsonResponse(response);
  return body.job.id;
}

export async function enqueueBulkComment(payload: BulkCommentPayload): Promise<string> {
  const response = await fetch('/api/jobs/bulk-comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await parseJsonResponse(response);
  return body.job.id;
}

export async function getBackendJob(jobId: string): Promise<BackendJob> {
  const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`);
  const payload = await parseJsonResponse(response);
  return payload.job;
}

export async function getApifyUsage(): Promise<ApifyUsageSummary> {
  const response = await fetch('/api/apify/usage');
  const payload = await parseJsonResponse(response);
  return payload.usage;
}

export function subscribeBackendJob(jobId: string, onUpdate: (job: BackendJob) => void): () => void {
  const source = new EventSource(`/api/jobs/${encodeURIComponent(jobId)}/stream`);
  source.onmessage = (event) => {
    onUpdate(JSON.parse(event.data));
  };
  source.onerror = () => {
    source.close();
  };
  return () => source.close();
}

export function selectedRowPayload(previewRows: SheetProfileRow[] | null, selectedRows: Set<number>) {
  if (!previewRows) return undefined;
  if (selectedRows.size === 0) {
    throw new Error('Select at least one loaded profile row before enqueueing.');
  }
  if (selectedRows.size === previewRows.length) return undefined;
  return [...selectedRows].sort((a, b) => a - b);
}
