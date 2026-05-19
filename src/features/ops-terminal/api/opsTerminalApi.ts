import { realRunnerResponseFixture } from '../data';
import type {
  OpsRunInput,
  RunnerEvent,
  RunnerOpsResponse,
} from '../types';

export interface OpsTerminalJobHandle {
  jobId: string;
  startedAt: string;
}

const SIMULATED_LATENCY_MS = 50;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), SIMULATED_LATENCY_MS);
  });
}

function deriveJobId(input: OpsRunInput): string {
  const handle = input.instagramPostUrl
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
    .toLowerCase();
  return `${handle}-${Date.now()}`;
}

export async function startOpsTerminalJob(input: OpsRunInput): Promise<OpsTerminalJobHandle> {
  return delay({
    jobId: deriveJobId(input),
    startedAt: new Date().toISOString(),
  });
}

export async function getOpsTerminalJob(_jobId: string): Promise<RunnerOpsResponse> {
  return delay(realRunnerResponseFixture);
}

export async function getOpsTerminalJobResults(_jobId: string): Promise<RunnerOpsResponse> {
  return delay(realRunnerResponseFixture);
}

export async function getOpsTerminalJobEvents(_jobId: string): Promise<RunnerEvent[]> {
  return delay(realRunnerResponseFixture.session.events);
}

export function getRunnerResponseSnapshot(): RunnerOpsResponse {
  return realRunnerResponseFixture;
}
