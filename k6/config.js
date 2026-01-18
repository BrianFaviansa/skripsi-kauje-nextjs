// K6 Load Test Configuration

export const BASE_URL = __ENV.API_URL || "http://43.228.215.252:3000/api";

// Test user credentials 
export const TEST_USER = {
  nim: "202410101014",
  password: "password123",
};

export const FOREIGN_KEYS = {
  provinceId: "019b783f-b33a-7004-91da-c62a2b33096d",
  cityId: "019b783f-b345-70a7-99ad-f380e7eb054b",
  facultyId: "019b783f-b303-71e7-bdb7-a8468324ee67",
  majorId: "019b7840-0185-71a6-8b04-f7c56ea1b1d0",
  roleId: "019b783f-b2ff-7314-b244-83cbc5f145c1",
  jobFieldId: "019b783f-b313-7337-afa0-91be3a383bef",
  collaborationFieldId: "019b783f-b31e-72a5-9621-d262b371772a",
};

// Load test options
export const OPTIONS = {
  smoke: {
    vus: 1,
    duration: "30s",
  },
  load: {
    stages: [
      { duration: "30s", target: 50 },
      { duration: "30s", target: 100 },
      { duration: "1m", target: 100 },
      { duration: "30s", target: 50 },
      { duration: "30s", target: 0 },
    ],
  },
};

export const THRESHOLDS = {
  http_req_duration: ["p(95)<1000"], 
  http_req_failed: ["rate<0.10"], 
};

export function handleSummary(data) {
  const metrics = data.metrics;

  const avgResponseTime =
    metrics.http_req_duration?.values?.avg?.toFixed(2) || "N/A";

  const p95Latency =
    metrics.http_req_duration?.values?.["p(95)"]?.toFixed(2) || "N/A";

  const totalRequests = metrics.http_reqs?.values?.count || 0;
  const totalDuration =
    (metrics.iteration_duration?.values?.count *
      metrics.iteration_duration?.values?.avg) /
      1000 || 1;
  const throughput = (
    totalRequests /
    (data.state.testRunDurationMs / 1000)
  ).toFixed(2);

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
