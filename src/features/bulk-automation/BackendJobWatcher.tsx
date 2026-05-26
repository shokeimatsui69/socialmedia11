import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Terminal } from 'lucide-react';
import { Badge, Card } from '../../components/ui/Primitives';
import { cn } from '../../lib/utils';
import {
  getBackendJob,
  subscribeBackendJob,
  type BackendJob,
  type BackendJobLog,
} from '../../services/bulkAutomation';

function statusVariant(status?: BackendJob['status']) {
  if (status === 'completed') return 'positive';
  if (status === 'failed') return 'negative';
  if (status === 'running') return 'neutral';
  return 'outline';
}

function LogLine({ log }: { log: BackendJobLog }) {
  return (
    <div className="grid grid-cols-[92px_64px_1fr] gap-3 border-b border-terminal-border/10 px-4 py-2 last:border-0">
      <span className="text-[9px] font-black uppercase text-terminal-text/20">{new Date(log.at).toLocaleTimeString([], { hour12: false })}</span>
      <span className={cn(
        'text-[9px] font-black uppercase tracking-wider',
        log.stream === 'stderr' ? 'text-terminal-red' : log.stream === 'system' ? 'text-terminal-amber' : 'text-terminal-green/55',
      )}>
        {log.stream}
      </span>
      <span className="break-words text-[11px] font-bold leading-relaxed text-terminal-text/62">{log.text}</span>
    </div>
  );
}

export function BackendJobWatcher() {
  const [watchJobId, setWatchJobId] = useState('');
  const [job, setJob] = useState<BackendJob | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = window.sessionStorage.getItem('watchJobId') || '';
    setWatchJobId(id);
  }, []);

  useEffect(() => {
    if (!watchJobId) return;

    let cancelled = false;
    getBackendJob(watchJobId)
      .then((nextJob) => {
        if (!cancelled) setJob(nextJob);
      })
      .catch((jobError) => {
        if (!cancelled) setError(jobError instanceof Error ? jobError.message : String(jobError));
      });

    const unsubscribe = subscribeBackendJob(watchJobId, (nextJob) => {
      setJob(nextJob);
      if (nextJob.status === 'completed' || nextJob.status === 'failed') {
        window.sessionStorage.removeItem('watchJobId');
        window.sessionStorage.removeItem('watchJobKind');
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [watchJobId]);

  const lastError = useMemo(() => {
    if (!job) return '';
    return [...job.logs].reverse().find((log) => log.stream === 'stderr')?.text || '';
  }, [job]);

  if (!watchJobId) return null;

  return (
    <Card className="border-terminal-green/35 bg-terminal-green/[0.025] p-0">
      <div className="flex flex-col gap-4 border-b border-terminal-border/20 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-terminal-green/30 bg-black/50">
            {job?.status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5 text-terminal-green" />
            ) : job?.status === 'failed' ? (
              <AlertTriangle className="h-5 w-5 text-terminal-red" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-terminal-amber" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-green/45">Highlighted Job</p>
            <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-terminal-text">{watchJobId}</h2>
          </div>
        </div>
        <Badge variant={statusVariant(job?.status) as any}>{job?.status || 'loading'}</Badge>
      </div>

      {error && (
        <div className="border-b border-terminal-red/25 bg-terminal-red/[0.04] p-5 text-sm font-bold text-terminal-red/80">
          {error}
        </div>
      )}

      {lastError && job?.status === 'failed' && (
        <div className="border-b border-terminal-red/25 bg-terminal-red/[0.04] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-terminal-red">Failure</p>
          <p className="mt-2 text-sm font-bold leading-relaxed text-terminal-text/70">{lastError}</p>
        </div>
      )}

      <div className="bg-black/35">
        <div className="flex items-center gap-3 border-b border-terminal-border/10 px-4 py-3">
          <Terminal className="h-4 w-4 text-terminal-green/55" />
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-terminal-green/40">Live Output</p>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {job?.logs.length ? (
            job.logs.map((log, index) => (
              <React.Fragment key={`${log.at}-${index}`}>
                <LogLine log={log} />
              </React.Fragment>
            ))
          ) : (
            <p className="p-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-terminal-text/20">Waiting for output</p>
          )}
        </div>
      </div>
    </Card>
  );
}
