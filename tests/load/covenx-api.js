import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const base = __ENV.COVENX_API_URL || 'http://localhost:4000/api/v1';
const token = __ENV.COVENX_ACCESS_TOKEN || '';
const failures = new Rate('covenx_failures');
const latency = new Trend('covenx_latency_ms');

export const options = {
  scenarios: { api_read_burst: { executor: 'constant-vus', vus: Number(__ENV.VUS || 10), duration: __ENV.DURATION || '30s' } },
  thresholds: { http_req_failed: ['rate<0.02'], http_req_duration: ['p(95)<750'], covenx_failures: ['rate<0.02'] }
};

export default function () {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  for (const path of ['/health/ready', '/dashboard/summary', '/contracts?limit=25']) {
    const response = http.get(`${base.replace('/api/v1', '')}${path.startsWith('/health') ? path : `/api/v1${path}`}`, { headers });
    latency.add(response.timings.duration);
    const ok = check(response, { [`${path} responds`]: (res) => res.status >= 200 && res.status < 500 });
    failures.add(!ok);
  }
  sleep(1);
}
