import react from '@vitejs/plugin-react';
import path from 'path';
import { spawn } from 'node:child_process';
import {defineConfig, loadEnv} from 'vite';

const readJsonBody = (req: any) => new Promise<any>((resolve, reject) => {
  const chunks: Buffer[] = [];
  req.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
  req.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw.trim()) {
      resolve({});
      return;
    }
    try {
      resolve(JSON.parse(raw));
    } catch (error) {
      reject(error);
    }
  });
  req.on('error', reject);
});

type BackendJobStatus = 'queued' | 'running' | 'completed' | 'failed';

interface BackendJobLog {
  at: string;
  stream: 'stdout' | 'stderr' | 'system';
  text: string;
}

interface BackendJob {
  id: string;
  kind: 'bulk-like' | 'bulk-comment';
  status: BackendJobStatus;
  startedAt: string;
  finishedAt?: string;
  exitCode?: number | null;
  logs: BackendJobLog[];
  listeners: Set<(job: BackendJob) => void>;
}

const backendJobs = new Map<string, BackendJob>();

const sendJson = (res: any, statusCode: number, payload: any) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const publicJob = (job: BackendJob) => ({
  id: job.id,
  kind: job.kind,
  status: job.status,
  startedAt: job.startedAt,
  finishedAt: job.finishedAt,
  exitCode: job.exitCode,
  logs: job.logs,
});

const emitJob = (job: BackendJob) => {
  for (const listener of job.listeners) listener(job);
};

const appendJobLog = (job: BackendJob, stream: BackendJobLog['stream'], text: string) => {
  const chunks = text.split(/\r?\n/).filter(Boolean);
  for (const chunk of chunks) {
    job.logs.push({ at: new Date().toISOString(), stream, text: chunk });
  }
  job.logs = job.logs.slice(-500);
  emitJob(job);
};

const createJobId = (kind: BackendJob['kind']) =>
  `${kind}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const spawnBackendJob = (kind: BackendJob['kind'], scriptName: string, postUrl: string, env: Record<string, string>) => {
  const job: BackendJob = {
    id: createJobId(kind),
    kind,
    status: 'queued',
    startedAt: new Date().toISOString(),
    logs: [],
    listeners: new Set(),
  };
  backendJobs.set(job.id, job);

  const child = spawn(process.execPath, [scriptName, postUrl], {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    shell: false,
  });

  job.status = 'running';
  appendJobLog(job, 'system', `Started ${scriptName} for ${postUrl}`);

  child.stdout.on('data', (chunk: Buffer) => appendJobLog(job, 'stdout', chunk.toString('utf8')));
  child.stderr.on('data', (chunk: Buffer) => appendJobLog(job, 'stderr', chunk.toString('utf8')));
  child.on('error', (error: Error) => {
    job.status = 'failed';
    job.finishedAt = new Date().toISOString();
    appendJobLog(job, 'stderr', error.message);
    emitJob(job);
  });
  child.on('close', (code: number | null) => {
    job.exitCode = code;
    job.status = code === 0 ? 'completed' : 'failed';
    job.finishedAt = new Date().toISOString();
    appendJobLog(job, 'system', `Process exited with code ${code ?? 'unknown'}.`);
    emitJob(job);
  });

  return job;
};

const intelligenceStageIds = [
  'target_validation',
  'source_scrape',
  'post_scrape',
  'comment_scrape',
  'comment_narratives',
  'grouped_narratives',
  'x_signals',
  'web_evidence',
  'discover_competitors',
  'analyze_competitors',
  'audience_status',
  'brand_position',
];

type IntelligenceJobStatus = 'queued' | 'running' | 'completed' | 'failed';
type IntelligenceJobPhase = 'pending' | 'completed' | 'failed';

interface IntelligenceJobEvent {
  id: string;
  message: string;
  timestamp: string;
  milestone: string;
}

interface IntelligenceJob {
  id: string;
  status: IntelligenceJobStatus;
  startedAt: string;
  finishedAt?: string;
  progress: number;
  activeStageIndex: number;
  currentStageLabel: string;
  events: IntelligenceJobEvent[];
  error?: string;
  result?: any;
  listeners: Set<(job: IntelligenceJob) => void>;
  heartbeat?: ReturnType<typeof setInterval>;
}

const intelligenceJobs = new Map<string, IntelligenceJob>();

const createIntelligenceJobId = () =>
  `intelligence-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const intelligencePhase = (status: IntelligenceJobStatus): IntelligenceJobPhase => {
  if (status === 'completed') return 'completed';
  if (status === 'failed') return 'failed';
  return 'pending';
};

const publicIntelligenceJob = (job: IntelligenceJob) => ({
  jobId: job.id,
  id: job.id,
  status: job.status,
  phase: intelligencePhase(job.status),
  startedAt: job.startedAt,
  completedAt: job.finishedAt,
  progress: job.status === 'completed' ? 100 : job.progress,
  activeStageIndex: job.activeStageIndex,
  totalStages: intelligenceStageIds.length,
  currentStageLabel: job.currentStageLabel,
  events: job.events,
  error: job.error,
  elapsedMs: Math.max(0, new Date(job.finishedAt ?? new Date().toISOString()).getTime() - new Date(job.startedAt).getTime()),
});

const emitIntelligenceJob = (job: IntelligenceJob) => {
  for (const listener of job.listeners) listener(job);
};

const appendIntelligenceEvent = (job: IntelligenceJob, event: IntelligenceJobEvent) => {
  if (!job.events.some(existing => existing.id === event.id)) {
    job.events = [event, ...job.events].slice(0, 64);
  }
  emitIntelligenceJob(job);
};

const updateIntelligenceJob = (job: IntelligenceJob, update: any) => {
  const stageIndex = Math.max(0, intelligenceStageIds.indexOf(update.stageId));
  job.status = update.status === 'failed' ? 'failed' : 'running';
  job.progress = Math.max(job.progress, Math.min(99, Number(update.progress) || job.progress));
  job.activeStageIndex = stageIndex;
  job.currentStageLabel = update.stageLabel || job.currentStageLabel;
  appendIntelligenceEvent(job, {
    id: `${job.id}-${update.stageId}-${update.status}-${Date.now()}`,
    message: update.message || job.currentStageLabel,
    timestamp: update.timestamp || new Date().toISOString(),
    milestone: update.stageId || update.status,
  });
};

const finishIntelligenceJob = (job: IntelligenceJob, status: 'completed' | 'failed', payload?: { result?: any; error?: string }) => {
  job.status = status;
  job.finishedAt = new Date().toISOString();
  job.progress = status === 'completed' ? 100 : job.progress;
  job.activeStageIndex = status === 'completed' ? intelligenceStageIds.length - 1 : job.activeStageIndex;
  job.currentStageLabel = status === 'completed' ? 'Brand position package ready' : 'Mission failed';
  job.result = payload?.result;
  job.error = payload?.error;
  if (job.heartbeat) {
    clearInterval(job.heartbeat);
    job.heartbeat = undefined;
  }
  appendIntelligenceEvent(job, {
    id: `${job.id}-${status}`,
    message: status === 'completed' ? 'Report ready. Intelligence briefing is available.' : `Scan failed: ${payload?.error || 'Pipeline failed.'}`,
    timestamp: new Date().toISOString(),
    milestone: status === 'completed' ? 'ready' : 'failed',
  });
};

const startIntelligenceJob = async (body: any): Promise<IntelligenceJob> => {
  const job: IntelligenceJob = {
    id: createIntelligenceJobId(),
    status: 'queued',
    startedAt: new Date().toISOString(),
    progress: 1,
    activeStageIndex: 0,
    currentStageLabel: 'Validate target URL',
    events: [],
    listeners: new Set(),
  };
  intelligenceJobs.set(job.id, job);

  job.heartbeat = setInterval(() => {
    if (job.status === 'running' || job.status === 'queued') emitIntelligenceJob(job);
  }, 10_000);

  queueMicrotask(async () => {
    try {
      job.status = 'running';
      emitIntelligenceJob(job);
      const { runIntelligencePipeline } = await import('./server/intelligencePipeline');
      const result = await runIntelligencePipeline(body, (update: any) => updateIntelligenceJob(job, update));
      finishIntelligenceJob(job, 'completed', { result });
    } catch (error) {
      finishIntelligenceJob(job, 'failed', { error: error instanceof Error ? error.message : String(error) });
    }
  });

  return job;
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  Object.assign(process.env, env);
  return {
    plugins: [
      react(),
      {
        name: 'matrix-intelligence-api',
        configureServer(server) {
          server.middlewares.use('/api/intelligence/jobs', async (req: any, res: any, next: any) => {
            const requestUrl = new URL(req.url || '/', 'http://localhost');
            const parts = requestUrl.pathname.split('/').filter(Boolean);
            const jobId = parts[0];
            const job = jobId ? intelligenceJobs.get(jobId) : undefined;

            if (req.method === 'POST' && !jobId) {
              try {
                const body = await readJsonBody(req);
                const created = await startIntelligenceJob(body);
                sendJson(res, 200, { job: publicIntelligenceJob(created) });
              } catch (error) {
                sendJson(res, 400, { error: error instanceof Error ? error.message : String(error) });
              }
              return;
            }

            if (!jobId || !job) {
              next();
              return;
            }

            if (req.method === 'GET' && parts[1] === 'stream') {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache, no-transform');
              res.setHeader('Connection', 'keep-alive');
              res.write(`data: ${JSON.stringify(publicIntelligenceJob(job))}\n\n`);

              const listener = (updated: IntelligenceJob) => {
                res.write(`data: ${JSON.stringify(publicIntelligenceJob(updated))}\n\n`);
              };
              job.listeners.add(listener);
              req.on('close', () => job.listeners.delete(listener));
              return;
            }

            if (req.method === 'GET') {
              sendJson(res, 200, { job: publicIntelligenceJob(job), result: job.result });
              return;
            }

            next();
          });

          server.middlewares.use('/api/intelligence/run', async (req: any, res: any, next: any) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            try {
              const body = await readJsonBody(req);
              const { runIntelligencePipeline } = await import('./server/intelligencePipeline');
              const result = await runIntelligencePipeline(body);
              sendJson(res, 200, result);
            } catch (error) {
              sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
            }
          });

          server.middlewares.use('/api/sheet-profiles', async (req: any, res: any, next: any) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            try {
              const body = await readJsonBody(req);
              const { previewSheetProfiles } = await import('./server/automationCore.js');
              const result = await previewSheetProfiles(body);
              sendJson(res, 200, result);
            } catch (error) {
              sendJson(res, 400, { error: error instanceof Error ? error.message : String(error) });
            }
          });

          server.middlewares.use('/api/apify/usage', async (req: any, res: any, next: any) => {
            if (req.method !== 'GET') {
              next();
              return;
            }

            try {
              const { getApifyUsageSummary } = await import('./server/automationCore.js');
              const result = await getApifyUsageSummary();
              sendJson(res, 200, { usage: result });
            } catch (error) {
              sendJson(res, 400, { error: error instanceof Error ? error.message : String(error) });
            }
          });

          server.middlewares.use('/api/jobs/bulk-like', async (req: any, res: any, next: any) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            try {
              const body = await readJsonBody(req);
              const { validateBulkLikePayload, envConfigForBulkLike, getSheetUrl } = await import('./server/automationCore.js');
              const payload = validateBulkLikePayload(body);
              getSheetUrl('bulk_like', payload.sheetUrl);
              const job = spawnBackendJob('bulk-like', 'bulk_like.js', payload.postUrl, envConfigForBulkLike(payload));
              sendJson(res, 200, { job: { id: job.id } });
            } catch (error) {
              sendJson(res, 400, { error: error instanceof Error ? error.message : String(error) });
            }
          });

          server.middlewares.use('/api/jobs/bulk-comment', async (req: any, res: any, next: any) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            try {
              const body = await readJsonBody(req);
              const {
                validateBulkCommentPayload,
                envConfigForBulkComment,
                resolveProfilesForRun,
              } = await import('./server/automationCore.js');
              const payload = validateBulkCommentPayload(body);
              await resolveProfilesForRun({
                kind: 'bulk_comment',
                sheetUrl: payload.sheetUrl,
                selectedRowNumbers: payload.selectedRowNumbers,
                commentText: payload.commentText,
                commentsJson: payload.commentsJson,
              });
              const job = spawnBackendJob('bulk-comment', 'bulk_comment.js', payload.postUrl, envConfigForBulkComment(payload));
              sendJson(res, 200, { job: { id: job.id } });
            } catch (error) {
              sendJson(res, 400, { error: error instanceof Error ? error.message : String(error) });
            }
          });

          server.middlewares.use('/api/jobs', (req: any, res: any, next: any) => {
            const requestUrl = new URL(req.url || '/', 'http://localhost');
            const parts = requestUrl.pathname.split('/').filter(Boolean);
            const jobId = parts[0];
            const job = jobId ? backendJobs.get(jobId) : undefined;

            if (req.method === 'GET' && !jobId) {
              sendJson(res, 200, { jobs: [...backendJobs.values()].map(publicJob) });
              return;
            }

            if (!jobId || !job) {
              next();
              return;
            }

            if (req.method === 'GET' && parts[1] === 'stream') {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache, no-transform');
              res.setHeader('Connection', 'keep-alive');
              res.write(`data: ${JSON.stringify(publicJob(job))}\n\n`);

              const listener = (updated: BackendJob) => {
                res.write(`data: ${JSON.stringify(publicJob(updated))}\n\n`);
              };
              job.listeners.add(listener);
              req.on('close', () => job.listeners.delete(listener));
              return;
            }

            if (req.method === 'GET') {
              sendJson(res, 200, { job: publicJob(job) });
              return;
            }

            next();
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
