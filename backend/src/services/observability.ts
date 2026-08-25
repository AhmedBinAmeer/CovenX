type Metric = { requests: number; errors: number; totalLatencyMs: number; workerFailures: number; outboxFailures: number };
const metric: Metric = { requests: 0, errors: 0, totalLatencyMs: 0, workerFailures: 0, outboxFailures: 0 };
export function observeRequest(input: { requestId?: string; tenantId?: string; userId?: string; route: string; status: number; latencyMs: number }) { metric.requests += 1; metric.totalLatencyMs += input.latencyMs; if (input.status >= 400) metric.errors += 1; if (process.env.NODE_ENV !== 'test') console.log(JSON.stringify({ level: input.status >= 500 ? 'error' : 'info', ...input, errorCode: input.status >= 400 ? `HTTP_${input.status}` : undefined })); }
export function incrementWorkerFailure() { metric.workerFailures += 1; }
export function incrementOutboxFailure() { metric.outboxFailures += 1; }
export function metricsSnapshot() { return { ...metric, averageLatencyMs: metric.requests ? metric.totalLatencyMs / metric.requests : 0 }; }
