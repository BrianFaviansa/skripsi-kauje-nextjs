// K6 Load Test Configuration
// Gunakan environment variable untuk override: k6 run -e API_URL=http://VPS_IP:3000/api

export const BASE_URL = __ENV.API_URL || "http://103.47.227.38:3000/api";

// Test user credentials (sesuaikan dengan data di database)
export const TEST_USER = {
  nim: "202410101014",
  password: "password123",
};

// Foreign Keys - UUIDs dari database kauje_db (Shared with Laravel)
// Jalankan query ini untuk mendapatkan ID setelah seeding:
// docker compose exec db psql -U postgres -d kauje_db -c "SELECT id FROM provinces LIMIT 1;"
// docker compose exec db psql -U postgres -d kauje_db -c "SELECT id FROM cities LIMIT 1;"
// docker compose exec db psql -U postgres -d kauje_db -c "SELECT id FROM faculties LIMIT 1;"
// docker compose exec db psql -U postgres -d kauje_db -c "SELECT id FROM majors LIMIT 1;"
// docker compose exec db psql -U postgres -d kauje_db -c "SELECT id FROM job_fields LIMIT 1;"
// docker compose exec db psql -U postgres -d kauje_db -c "SELECT id FROM collaboration_fields LIMIT 1;"
export const FOREIGN_KEYS = {
  provinceId: "019b72b6-e20a-7275-8792-8084a52c594c",
  cityId: "019b72b6-e217-7117-8233-6d290699f3aa",
  facultyId: "019b72b6-e1b8-7299-b5b1-6c2bf099c1a9",
  majorId: "019b72b7-3105-7340-a12c-0c8df50cf892",
  roleId: "019b72b6-e1b3-7337-a623-84ae06900878",
  jobFieldId: "019b72b6-e1d1-7266-ac29-bcf9a7e5eb0a",
  collaborationFieldId: "019b72b6-e1e2-70c1-aee2-613d501410b5",
};

// Load test options
export const OPTIONS = {
  // Smoke test - minimal load to verify system works
  smoke: {
    vus: 1,
    duration: "30s",
  },
  // Load test - gradual ramp up to 100 VUs (3 minutes total) - FOR VPS
  load: {
    stages: [
      { duration: "30s", target: 50 }, // ramp up to 50 users
      { duration: "30s", target: 100 }, // ramp up to 100 users
      { duration: "1m", target: 100 }, // stay at 100 users (steady state)
      { duration: "30s", target: 50 }, // ramp down to 50 users
      { duration: "30s", target: 0 }, // ramp down to 0
    ],
  },
  // Load test for local development - lower VUs (1.5 minutes total)
  loadDev: {
    stages: [
      { duration: "15s", target: 10 }, // ramp up to 10 users
      { duration: "15s", target: 20 }, // ramp up to 20 users
      { duration: "30s", target: 20 }, // stay at 20 users (steady state)
      { duration: "15s", target: 10 }, // ramp down to 10 users
      { duration: "15s", target: 0 }, // ramp down to 0
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

  const testDuration = (data.state.testRunDurationMs / 1000).toFixed(2);

  const summary = `
========================================
        K6 LOAD TEST RESULTS
========================================

  Response Time (avg) :  ${avgResponseTime} ms
  P95 Latency         :  ${p95Latency} ms
  Throughput          :  ${throughput} req/s
  Success Rate        :  ${successRate} %

----------------------------------------
  Total Requests      :  ${totalRequests}
  Test Duration       :  ${testDuration} s
========================================
`;

  return {
    stdout:
      summary + "\n" + textSummary(data, { indent: "  ", enableColors: true }),
  };
}

import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
