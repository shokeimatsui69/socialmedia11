import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  BarChart3,
  CheckSquare,
  Database,
  ExternalLink,
  Heart,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Table2,
  Zap,
} from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui/Primitives';
import { cn } from '../../lib/utils';
import {
  enqueueBulkComment,
  enqueueBulkLike,
  getApifyUsage,
  INSTAGRAM_POST_URL_VALIDATION_MESSAGE,
  normalizeInstagramPostUrl,
  parseCommentsJsonInput,
  previewSheetProfiles,
  selectedRowPayload,
  type BulkCommentPayload,
  type BulkLikePayload,
  type ApifyUsageSummary,
  type SheetProfileKind,
  type SheetProfileRow,
} from '../../services/bulkAutomation';

type ToolMode = 'like' | 'comment';

interface BulkAutomationToolProps {
  mode: ToolMode;
}

const CONCURRENCY_CAP = 50;
const INSTAGRAM_CONFIG_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1iYioMSubUS7Uk5hTPLTryGQblD9Tezi-iQfZt_y0rfc/edit?gid=0#gid=0';

const FieldLabel = ({ label, hint }: { label: string; hint?: string }) => (
  <label className="block">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/40">{label}</span>
    {hint && <span className="mt-2 block text-[10px] font-bold leading-relaxed text-terminal-text/32">{hint}</span>}
  </label>
);

const textInputClass =
  'mt-3 h-12 w-full border border-terminal-border/30 bg-black/35 px-4 text-sm font-bold text-terminal-text outline-none transition-all placeholder:text-terminal-text/18 focus:border-terminal-green/60 disabled:cursor-not-allowed disabled:opacity-50';

const textAreaClass =
  'mt-3 min-h-32 w-full border border-terminal-border/30 bg-black/35 p-4 text-sm font-bold text-terminal-text outline-none transition-all placeholder:text-terminal-text/18 focus:border-terminal-green/60 disabled:cursor-not-allowed disabled:opacity-50';

const ControlBlock = ({
  title,
  description,
  recommendation,
  children,
}: {
  title: string;
  description: string;
  recommendation?: string;
  children: React.ReactNode;
}) => (
  <div className="border border-terminal-border/20 bg-black/25 p-4">
    <div className="mb-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/45">{title}</p>
      <p className="mt-2 text-xs font-bold leading-relaxed text-terminal-text/50">{description}</p>
      {recommendation && (
        <p className="mt-2 border-l border-terminal-green/30 pl-3 text-[10px] font-black uppercase tracking-[0.12em] text-terminal-green/45">
          {recommendation}
        </p>
      )}
    </div>
    {children}
  </div>
);

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function formatCredits(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '--';
  return `${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} credits`;
}

function formatDate(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ApifyUsageCard({
  usage,
  loading,
  error,
  onRefresh,
}: {
  usage: ApifyUsageSummary | null;
  loading: boolean;
  error: string;
  onRefresh: () => void;
}) {
  const includedProgress = usage?.includedCreditsUsd
    ? Math.min(100, Math.round((usage.usedCreditsUsd / usage.includedCreditsUsd) * 100))
    : 0;
  const limitProgress = usage?.maxMonthlyUsageUsd
    ? Math.min(100, Math.round((usage.usedCreditsUsd / usage.maxMonthlyUsageUsd) * 100))
    : 0;

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-terminal-border/10 pb-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-4 w-4 text-terminal-green" />
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-terminal-green/70">Apify Usage</p>
        </div>
        <Button type="button" variant="secondary" disabled={loading} onClick={onRefresh}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="border border-terminal-red/25 bg-terminal-red/[0.04] p-4">
          <p className="text-xs font-bold leading-relaxed text-terminal-red/80">{error}</p>
        </div>
      )}

      {!error && !usage && (
        <div className="border border-dashed border-terminal-border/20 bg-black/20 p-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/25">
            {loading ? 'Loading Apify usage' : 'Apify usage unavailable'}
          </p>
        </div>
      )}

      {usage && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="border border-terminal-border/20 bg-black/25 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-terminal-green/35">Included Credits Left</p>
              <p className="mt-2 text-2xl font-black tracking-tight text-terminal-text">{formatCredits(usage.remainingIncludedCreditsUsd)}</p>
              <p className="mt-2 text-[10px] font-bold text-terminal-text/35">
                {formatCredits(usage.includedCreditsUsd)} included on {usage.planId || 'current plan'}
              </p>
            </div>
            <div className="border border-terminal-border/20 bg-black/25 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-terminal-green/35">Used This Cycle</p>
              <p className="mt-2 text-2xl font-black tracking-tight text-terminal-text">{formatCredits(usage.usedCreditsUsd)}</p>
              <p className="mt-2 text-[10px] font-bold text-terminal-text/35">
                {formatDate(usage.usageCycle?.startAt)} to {formatDate(usage.usageCycle?.endAt)}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.18em] text-terminal-text/30">
              <span>Included Credit Usage</span>
              <span>{includedProgress}%</span>
            </div>
            <div className="h-2 border border-terminal-border/20 bg-black/50">
              <div className="h-full bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.45)]" style={{ width: `${includedProgress}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="border border-terminal-border/15 bg-black/20 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-terminal-green/35">Actor Usage</p>
              <p className="mt-2 text-lg font-black text-terminal-text">{formatCredits(usage.actorUsageUsd)}</p>
            </div>
            <div className="border border-terminal-border/15 bg-black/20 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-terminal-green/35">Monthly Limit Left</p>
              <p className="mt-2 text-lg font-black text-terminal-text">{formatCredits(usage.remainingMonthlyLimitUsd)}</p>
              {usage.maxMonthlyUsageUsd > 0 && (
                <p className="mt-1 text-[9px] font-bold text-terminal-text/30">{limitProgress}% of limit used</p>
              )}
            </div>
          </div>

          {!!usage.serviceUsage.length && (
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-terminal-green/40">Top Usage Lines</p>
              <div className="space-y-2">
                {usage.serviceUsage.slice(0, 4).map((item) => (
                  <div key={item.service} className="flex items-center justify-between gap-4 border border-terminal-border/10 bg-black/20 px-3 py-2">
                    <span className="truncate text-[10px] font-bold text-terminal-text/45">{item.label}</span>
                    <span className="shrink-0 text-[10px] font-black text-terminal-green/65">{formatCredits(item.amountUsd)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function ConfirmModal({
  mode,
  summary,
  disabled,
  onCancel,
  onConfirm,
}: {
  mode: ToolMode;
  summary: string;
  disabled: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const title = mode === 'like' ? 'Confirm Bulk Like' : 'Confirm Bulk Comment';
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          className="w-full max-w-lg border border-terminal-red/35 bg-terminal-bg p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)]"
        >
          <div className="mb-6 flex items-start gap-4 border-b border-terminal-border/20 pb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-terminal-red/35 bg-terminal-red/10">
              <ShieldAlert className="h-5 w-5 text-terminal-red" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-terminal-text">{title}</h2>
              <p className="mt-2 text-xs font-bold leading-relaxed text-terminal-text/50">
                This will dispatch authenticated Instagram automation through Apify. Confirm account safety, rate limits, and terms compliance before continuing.
              </p>
            </div>
          </div>

          <div className="border border-terminal-border/20 bg-black/35 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/40">Run Scope</p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-terminal-text/70">{summary}</p>
          </div>

          <div className="mt-8 flex gap-3">
            <Button type="button" variant="secondary" disabled={disabled} onClick={onCancel} className="h-12 flex-1">
              Cancel
            </Button>
            <Button type="button" disabled={disabled} onClick={onConfirm} className="h-12 flex-1 bg-terminal-red text-black hover:bg-terminal-red/90">
              {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Enqueue
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <Card className="border-terminal-red/35 bg-terminal-red/[0.035] p-5">
      <div className="flex items-start gap-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-terminal-red" />
        <p className="text-sm font-bold leading-relaxed text-terminal-text/70">{message}</p>
      </div>
    </Card>
  );
}

function ProfilePreviewTable({
  mode,
  rows,
  selectedRows,
  disabled,
  onToggle,
  onSelectAll,
  onClear,
}: {
  mode: ToolMode;
  rows: SheetProfileRow[] | null;
  selectedRows: Set<number>;
  disabled: boolean;
  onToggle: (rowNumber: number) => void;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  if (!rows) {
    return (
      <div className="border border-dashed border-terminal-border/20 bg-black/20 p-8 text-center">
        <Table2 className="mx-auto mb-4 h-8 w-8 text-terminal-green/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-terminal-text/30">
          Profile preview not loaded. Submit will use all eligible sheet rows.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-terminal-border/25 bg-black/25">
      <div className="flex flex-col gap-3 border-b border-terminal-border/20 bg-black/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/45">Loaded Profiles</p>
          <p className="mt-1 text-[10px] font-bold text-terminal-text/35">{selectedRows.size} of {rows.length} selected</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" disabled={disabled || rows.length === 0} onClick={onSelectAll}>
            <CheckSquare className="h-3.5 w-3.5" />
            All
          </Button>
          <Button type="button" variant="outline" disabled={disabled || rows.length === 0} onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-terminal-panel">
            <tr className="border-b border-terminal-border/20">
              <th className="w-16 px-5 py-4 text-[9px] font-black uppercase tracking-[0.18em] text-terminal-green/30">Use</th>
              <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.18em] text-terminal-green/30">Row</th>
              <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.18em] text-terminal-green/30">Profile</th>
              {mode === 'comment' && (
                <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.18em] text-terminal-green/30">Comment Source</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-terminal-border/10">
            {rows.map((row) => {
              const selected = selectedRows.has(row.rowNumber);
              return (
                <tr
                  key={row.rowNumber}
                  onClick={() => !disabled && onToggle(row.rowNumber)}
                  className={cn('cursor-pointer transition-all hover:bg-terminal-green/[0.025]', selected && 'bg-terminal-green/[0.045]')}
                >
                  <td className="px-5 py-4">
                    <span className={cn('block h-4 w-4 border border-terminal-border/40 bg-black', selected && 'border-terminal-green bg-terminal-green shadow-[0_0_10px_rgba(0,255,102,0.35)]')} />
                  </td>
                  <td className="px-5 py-4 text-xs font-black text-terminal-green/65">{row.rowNumber}</td>
                  <td className="px-5 py-4 text-xs font-bold text-terminal-text/70">{row.label}</td>
                  {mode === 'comment' && (
                    <td className="px-5 py-4">
                      <Badge variant={row.commentReady ? 'positive' : 'negative'} dot={false}>
                        {row.commentMode || (row.commentReady ? 'Ready' : 'Missing')}
                      </Badge>
                    </td>
                  )}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={mode === 'comment' ? 4 : 3} className="py-16 text-center text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/20">
                  No eligible cookie rows found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BulkAutomationTool({ mode }: BulkAutomationToolProps) {
  const navigate = useNavigate();
  const isComment = mode === 'comment';
  const sheetKind: SheetProfileKind = isComment ? 'bulk_comment' : 'bulk_like';
  const Icon = isComment ? MessageSquare : Heart;
  const [postUrl, setPostUrl] = useState('');
  const [concurrency, setConcurrency] = useState(1);
  const [delayBetweenLikes, setDelayBetweenLikes] = useState(20);
  const [maxLikesPerRun, setMaxLikesPerRun] = useState(1);
  const [delayBetweenCommentsSec, setDelayBetweenCommentsSec] = useState(15);
  const [commentText, setCommentText] = useState('');
  const [commentsJson, setCommentsJson] = useState('');
  const [previewRows, setPreviewRows] = useState<SheetProfileRow[] | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<BulkLikePayload | BulkCommentPayload | null>(null);
  const [apifyUsage, setApifyUsage] = useState<ApifyUsageSummary | null>(null);
  const [apifyUsageError, setApifyUsageError] = useState('');
  const [isApifyUsageLoading, setIsApifyUsageLoading] = useState(false);

  const liveUrlValidation = useMemo(() => normalizeInstagramPostUrl(postUrl), [postUrl]);
  const globalCommentSource = commentsJson.trim() || commentText.trim();

  const loadApifyUsage = async () => {
    setIsApifyUsageLoading(true);
    setApifyUsageError('');
    try {
      setApifyUsage(await getApifyUsage());
    } catch (usageError) {
      setApifyUsageError(usageError instanceof Error ? usageError.message : String(usageError));
    } finally {
      setIsApifyUsageLoading(false);
    }
  };

  useEffect(() => {
    loadApifyUsage();
  }, []);

  const clearPreview = () => {
    setPreviewRows(null);
    setSelectedRows(new Set());
  };

  const selectionSummary = () => {
    if (!previewRows) return 'all eligible rows from the sheet';
    if (selectedRows.size === previewRows.length) return `all ${previewRows.length} loaded rows`;
    return `${selectedRows.size} selected row(s)`;
  };

  const setNumeric = (setter: (value: number) => void, min: number, max: number) => (value: number) => {
    setter(clampNumber(Math.trunc(value), min, max));
  };

  const loadPreview = async () => {
    setError('');
    if (isComment && commentsJson.trim()) {
      const parsed = parseCommentsJsonInput(commentsJson);
      if (!parsed.ok) {
        setError(parsed.error || 'Comments JSON must be valid.');
        return;
      }
    }

    setIsPreviewLoading(true);
    try {
      const rows = await previewSheetProfiles({
        kind: sheetKind,
        commentText: commentText.trim(),
        commentsJson: commentsJson.trim(),
      });
      setPreviewRows(rows);
      setSelectedRows(new Set(rows.map((row) => row.rowNumber)));
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : String(previewError));
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const toggleRow = (rowNumber: number) => {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  };

  const validateAndBuildPayload = () => {
    const normalized = normalizeInstagramPostUrl(postUrl);
    if (!normalized.isValid || !normalized.normalizedUrl) {
      throw new Error(INSTAGRAM_POST_URL_VALIDATION_MESSAGE);
    }

    const rowNumbers = selectedRowPayload(previewRows, selectedRows);
    const normalizedConcurrency = clampNumber(Math.trunc(concurrency), 1, CONCURRENCY_CAP);

    if (isComment) {
      const parsedJson = parseCommentsJsonInput(commentsJson);
      if (!parsedJson.ok) throw new Error(parsedJson.error || 'Comments JSON must be valid.');

      if (!globalCommentSource && previewRows) {
        const selected = previewRows.filter((row) => selectedRows.has(row.rowNumber));
        const missingRows = selected.filter((row) => !row.commentReady).map((row) => row.rowNumber);
        if (missingRows.length) {
          throw new Error(`Comment source is missing for selected sheet row(s): ${missingRows.join(', ')}.`);
        }
      }

      return {
        postUrl: normalized.normalizedUrl,
        commentText: commentsJson.trim() ? undefined : commentText.trim(),
        commentsJson: commentsJson.trim() || undefined,
        concurrency: normalizedConcurrency,
        delayBetweenCommentsSec: Math.max(1, Math.trunc(delayBetweenCommentsSec)),
        selectedRowNumbers: rowNumbers,
      } satisfies BulkCommentPayload;
    }

    if (delayBetweenLikes < 10) {
      throw new Error('Delay between likes must be at least 10 seconds.');
    }

    return {
      postUrl: normalized.normalizedUrl,
      concurrency: normalizedConcurrency,
      delayBetweenLikes: Math.max(10, Math.trunc(delayBetweenLikes)),
      maxLikesPerRun: Math.max(1, Math.trunc(maxLikesPerRun)),
      selectedRowNumbers: rowNumbers,
    } satisfies BulkLikePayload;
  };

  const openConfirm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      setPendingPayload(validateAndBuildPayload());
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : String(validationError));
    }
  };

  const enqueue = async () => {
    if (!pendingPayload) return;
    setError('');
    setIsSubmitting(true);
    try {
      const jobId = isComment
        ? await enqueueBulkComment(pendingPayload as BulkCommentPayload)
        : await enqueueBulkLike(pendingPayload as BulkLikePayload);
      window.sessionStorage.setItem('watchJobId', jobId);
      window.sessionStorage.setItem('watchJobKind', isComment ? 'bulk-comment' : 'bulk-like');
      navigate('/ingestion');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : String(submitError));
      setPendingPayload(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = isComment ? 'Bulk Comment' : 'Bulk Like';
  const subtitle = isComment
    ? 'Comment on one Instagram post with selected session-cookie rows from the locked Instagram config sheet.'
    : 'Like one Instagram post with selected session-cookie rows from the locked Instagram config sheet.';

  return (
    <div className="min-h-screen pb-20 font-mono">
      {pendingPayload && (
        <ConfirmModal
          mode={mode}
          disabled={isSubmitting}
          summary={`${title} will run against ${selectionSummary()} with concurrency ${pendingPayload.concurrency}.`}
          onCancel={() => setPendingPayload(null)}
          onConfirm={enqueue}
        />
      )}

      <section className="mx-auto max-w-6xl border-b border-terminal-border/25 pb-10">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center border border-terminal-green/35 bg-terminal-green/10">
            <Icon className="h-5 w-5 text-terminal-green" />
          </div>
          <Badge variant="positive">Apify dispatch</Badge>
          <Badge variant="outline" dot={false}>Instagram automation</Badge>
        </div>

        <h1 className="text-5xl font-black uppercase tracking-tight text-terminal-text md:text-7xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-terminal-text/58 md:text-lg">{subtitle}</p>
      </section>

      <form onSubmit={openConfirm} className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="space-y-8 xl:col-span-7">
          <ErrorBanner message={error} />

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3 border-b border-terminal-border/10 pb-4">
              <Database className="h-4 w-4 text-terminal-green" />
              <h2 className="text-[12px] font-black uppercase tracking-[0.18em] text-terminal-green/70">Target</h2>
            </div>

            <div className="space-y-6">
              <div>
                <FieldLabel
                  label="Post URL"
                  hint="Query strings and hash fragments are stripped before dispatch."
                />
                <input
                  value={postUrl}
                  disabled={isSubmitting}
                  onChange={(event) => setPostUrl(event.target.value)}
                  placeholder="https://www.instagram.com/reel/SHORTCODE/"
                  className={textInputClass}
                />
                {postUrl.trim() && (
                  <p className={cn('mt-2 text-xs font-bold', liveUrlValidation.isValid ? 'text-terminal-green/60' : 'text-terminal-amber')}>
                    {liveUrlValidation.isValid ? liveUrlValidation.normalizedUrl : INSTAGRAM_POST_URL_VALIDATION_MESSAGE}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {isComment && (
            <Card className="p-6">
              <div className="mb-6 flex items-center gap-3 border-b border-terminal-border/10 pb-4">
                <MessageSquare className="h-4 w-4 text-terminal-green" />
                <h2 className="text-[12px] font-black uppercase tracking-[0.18em] text-terminal-green/70">Comment Source</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <FieldLabel label="Single Comment" hint="Used only when Comments JSON is empty. If both are empty, selected rows must provide comments in the sheet." />
                  <input
                    value={commentText}
                    disabled={isSubmitting}
                    onChange={(event) => {
                      setCommentText(event.target.value);
                      clearPreview();
                    }}
                    placeholder="Nice post!"
                    className={textInputClass}
                  />
                </div>

                <div>
                  <FieldLabel
                    label="Comments JSON"
                    hint="A JSON array of strings. If its length matches selected profiles, comments map 1:1 in sheet order; otherwise the array is used as a global pool for each account."
                  />
                  <textarea
                    value={commentsJson}
                    disabled={isSubmitting}
                    onChange={(event) => {
                      setCommentsJson(event.target.value);
                      clearPreview();
                    }}
                    placeholder={'["Great shot!", "Love this update"]'}
                    className={textAreaClass}
                  />
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-terminal-border/10 pb-4">
              <div className="flex items-center gap-3">
                <Table2 className="h-4 w-4 text-terminal-green" />
                <h2 className="text-[12px] font-black uppercase tracking-[0.18em] text-terminal-green/70">Profile Preview</h2>
              </div>
              <Button type="button" variant="secondary" disabled={isPreviewLoading || isSubmitting} onClick={loadPreview}>
                {isPreviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Load
              </Button>
            </div>

            <ProfilePreviewTable
              mode={mode}
              rows={previewRows}
              selectedRows={selectedRows}
              disabled={isSubmitting}
              onToggle={toggleRow}
              onSelectAll={() => setSelectedRows(new Set((previewRows || []).map((row) => row.rowNumber)))}
              onClear={() => setSelectedRows(new Set())}
            />
          </Card>
        </div>

        <div className="space-y-8 xl:col-span-5">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3 border-b border-terminal-border/10 pb-4">
              <Zap className="h-4 w-4 text-terminal-green" />
              <h2 className="text-[12px] font-black uppercase tracking-[0.18em] text-terminal-green/70">Run Controls</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-1">
              <ControlBlock
                title="Concurrency"
                description="How many selected sheet profiles may have Apify runs active at the same time. Higher values finish faster, but create more simultaneous activity."
                recommendation={`Allowed: 1-${CONCURRENCY_CAP}. Start with 1-3 for safer pacing.`}
              >
                <input
                  type="number"
                  min={1}
                  max={CONCURRENCY_CAP}
                  value={concurrency}
                  disabled={isSubmitting}
                  onChange={(event) => setNumeric(setConcurrency, 1, CONCURRENCY_CAP)(Number(event.target.value))}
                  className={textInputClass}
                />
              </ControlBlock>

              {isComment ? (
                <ControlBlock
                  title="Delay Between Comments"
                  description="Seconds to wait before starting the next profile's Apify comment run. Dispatches are globally spaced, so this delay still applies when concurrency is above 1."
                  recommendation="Use a larger delay for conservative account pacing."
                >
                  <input
                    type="number"
                    min={1}
                    value={delayBetweenCommentsSec}
                    disabled={isSubmitting}
                    onChange={(event) => setNumeric(setDelayBetweenCommentsSec, 1, 3600)(Number(event.target.value))}
                    className={textInputClass}
                  />
                </ControlBlock>
              ) : (
                <>
                  <ControlBlock
                    title="Delay Between Likes"
                    description="Seconds passed to the Apify like actor as delayBetweenLikes. The actor rejects values below 10 seconds."
                    recommendation="Minimum: 10 seconds. Higher values are slower but gentler."
                  >
                    <input
                      type="number"
                      min={10}
                      value={delayBetweenLikes}
                      disabled={isSubmitting}
                      onChange={(event) => setNumeric(setDelayBetweenLikes, 10, 300)(Number(event.target.value))}
                      className={textInputClass}
                    />
                  </ControlBlock>
                  <ControlBlock
                    title="Max Likes Per Run"
                    description="Maximum number of like actions the Apify actor may attempt for each profile run. For one target post, 1 is usually the intended value."
                    recommendation="Default: 1 per selected profile."
                  >
                    <input
                      type="number"
                      min={1}
                      value={maxLikesPerRun}
                      disabled={isSubmitting}
                      onChange={(event) => setNumeric(setMaxLikesPerRun, 1, 1000)(Number(event.target.value))}
                      className={textInputClass}
                    />
                  </ControlBlock>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3 border-b border-terminal-border/10 pb-4">
              <Table2 className="h-4 w-4 text-terminal-green" />
              <p className="text-[12px] font-black uppercase tracking-[0.18em] text-terminal-green/70">Profile Source</p>
            </div>
            <p className="text-xs font-bold leading-relaxed text-terminal-text/52">
              Profiles always come from the locked Instagram config Google Sheet. The preview table shows only row numbers and safe labels; session cookies stay server-side.
            </p>
            <a
              href={INSTAGRAM_CONFIG_SHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 border border-terminal-border/25 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-terminal-green/60 transition-all hover:border-terminal-green/50 hover:text-terminal-green"
            >
              Open Config Sheet
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Card>

          <ApifyUsageCard
            usage={apifyUsage}
            loading={isApifyUsageLoading}
            error={apifyUsageError}
            onRefresh={loadApifyUsage}
          />

          <Card className="border-terminal-amber/25 bg-terminal-amber/[0.025] p-6">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-terminal-amber" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-amber">Safety Notice</p>
            </div>
            <p className="text-xs font-bold leading-relaxed text-terminal-text/55">
              Automation must comply with Instagram and Apify terms. Customers are responsible for account safety, consent, and rate limits.
            </p>
          </Card>

          <Button type="submit" disabled={isSubmitting || isPreviewLoading} className="h-14 w-full text-[11px]">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
            Review and Enqueue
          </Button>
        </div>
      </form>
    </div>
  );
}
