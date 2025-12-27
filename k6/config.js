// K6 Load Test Configuration
// Gunakan environment variable untuk override: k6 run -e API_URL=http://VPS_IP:3000/api

export const BASE_URL = __ENV.API_URL || "http://103.47.227.38:3000/api";

// Test user credentials (sesuaikan dengan data di database)
export const TEST_USER = {
  nim: "202410101014",
  password: "password123",
};

// Foreign Keys - Ganti dengan CUID yang valid dari database kamu
export const FOREIGN_KEYS = {
  provinceId: "cmjnolqjf00353hqyeq7b452h",
  cityId: "cmjnolqu0003c3hqyk3qyam4c",
  facultyId: "cmjnolp4v00033hqyyk8fuj5x",
  majorId: "cmjnolp7q000k3hqyeshqypze",
  roleId: "GANTI_DENGAN_ROLE_ID", // optional
  jobFieldId: "cmjnolpdj002p3hqydkyb1sgv",
  collaborationFieldId: "cmjnolper002z3hqykh9zfcft",
};

// Load test options
export const OPTIONS = {
  // Smoke test - minimal load to verify system works
  smoke: {
    vus: 1,
    duration: "30s",
  },
  // Load test - gradual ramp up to 100 VUs (3 minutes total)
  load: {
    stages: [
      { duration: "30s", target: 50 }, // ramp up to 50 users
      { duration: "30s", target: 100 }, // ramp up to 100 users
      { duration: "1m", target: 100 }, // stay at 100 users (steady state)
      { duration: "30s", target: 50 }, // ramp down to 50 users
      { duration: "30s", target: 0 }, // ramp down to 0
    ],
  },
};

// Thresholds for performance
export const THRESHOLDS = {
  http_req_duration: ["p(95)<1000"], // p95 latency < 1 seconds
  http_req_failed: ["rate<0.10"], // Success rate > 90%
};

// Custom summary handler - displays key metrics
export function handleSummary(data) {
  const metrics = data.metrics;

  // Response Time (avg)
  const avgResponseTime =
    metrics.http_req_duration?.values?.avg?.toFixed(2) || "N/A";

  // P95 Latency
  const p95Latency =
    metrics.http_req_duration?.values?.["p(95)"]?.toFixed(2) || "N/A";

  // Throughput (requests per second)
  const totalRequests = metrics.http_reqs?.values?.count || 0;
  const totalDuration =
    (metrics.iteration_duration?.values?.count *
      metrics.iteration_duration?.values?.avg) /
      1000 || 1;
  const throughput = (
    totalRequests /
    (data.state.testRunDurationMs / 1000)
  ).toFixed(2);

  // Success Rate
  const failedRate = metrics.http_req_failed?.values?.rate || 0;
  const successRate = ((1 - failedRate) * 100).toFixed(2);

  const summary = `
╔══════════════════════════════════════════════════════════════╗
║                    K6 LOAD TEST RESULTS                      ║
╠══════════════════════════════════════════════════════════════╣
║  Response Time (avg)  │  ${avgResponseTime.padStart(
    10
  )} ms                     ║
║  P95 Latency          │  ${p95Latency.padStart(10)} ms                     ║
║  Throughput           │  ${throughput.padStart(10)} req/s                  ║
║  Success Rate         │  ${successRate.padStart(10)} %                     ║
╠══════════════════════════════════════════════════════════════╣
║  Total Requests       │  ${String(totalRequests).padStart(
    10
  )}                       ║
║  Test Duration        │  ${(data.state.testRunDurationMs / 1000)
    .toFixed(2)
    .padStart(10)} s                      ║
╚══════════════════════════════════════════════════════════════╝
`;

  return {
    stdout:
      summary + "\n" + textSummary(data, { indent: "  ", enableColors: true }),
  };
}

import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
