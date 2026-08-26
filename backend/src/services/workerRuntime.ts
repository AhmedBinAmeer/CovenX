import { User } from '../models/index.js';
import { dispatchOutboxBatch, runApprovalSlaWorker, runObligationReminderWorker, runRenewalReminderWorker } from './workers.js';

let outboxTimer: NodeJS.Timeout | undefined;
let scheduleTimer: NodeJS.Timeout | undefined;
let running = false;
let lastOutboxRunAt: Date | undefined;
let lastScheduleRunAt: Date | undefined;
let lastError: string | undefined;

async function dispatchOnce() {
  if (running) return;
  running = true;
  try {
    await dispatchOutboxBatch(50);
    lastOutboxRunAt = new Date();
    lastError = undefined;
  } catch (error: any) {
    lastError = error?.message ?? 'Outbox dispatch failed';
  } finally {
    running = false;
  }
}

async function scheduledOnce() {
  try {
    const tenants = await User.distinct('tenantId', { status: 'active' });
    for (const tenantId of tenants) {
      await Promise.all([
        runApprovalSlaWorker(String(tenantId)),
        runObligationReminderWorker(String(tenantId)),
        runRenewalReminderWorker(String(tenantId)),
      ]);
    }
    lastScheduleRunAt = new Date();
    lastError = undefined;
  } catch (error: any) {
    lastError = error?.message ?? 'Scheduled worker run failed';
  }
}

export function startWorkerRuntime(input: { pollIntervalMs?: number; scheduleIntervalMs?: number } = {}) {
  if (outboxTimer || scheduleTimer) return;
  const pollIntervalMs = Math.max(500, input.pollIntervalMs ?? 2000);
  const scheduleIntervalMs = Math.max(60_000, input.scheduleIntervalMs ?? 15 * 60_000);
  void dispatchOnce();
  void scheduledOnce();
  outboxTimer = setInterval(() => void dispatchOnce(), pollIntervalMs);
  scheduleTimer = setInterval(() => void scheduledOnce(), scheduleIntervalMs);
  outboxTimer.unref();
  scheduleTimer.unref();
}

export async function stopWorkerRuntime() {
  if (outboxTimer) clearInterval(outboxTimer);
  if (scheduleTimer) clearInterval(scheduleTimer);
  outboxTimer = undefined;
  scheduleTimer = undefined;
  await dispatchOnce();
}

export function workerRuntimeStatus() {
  return { enabled: Boolean(outboxTimer || scheduleTimer), running, lastOutboxRunAt, lastScheduleRunAt, lastError };
}
