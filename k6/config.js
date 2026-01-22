// K6 Load Test Configuration

export const BASE_URL = __ENV.API_URL || "http://43.228.212.184:3000/api";

// Test user credentials
export const TEST_USER = {
  nim: "202410101014",
  password: "password123",
};

export const FOREIGN_KEYS = {
  provinceId: "019bdc5f-999f-7322-bc3c-affaac1b2a5b",
  cityId: "019bdc5f-99a9-7375-b09f-4cdb1a25d0cd",
  facultyId: "019bdc5f-9932-725a-934d-c54e3904a48c",
  majorId: "019bdc5f-ea12-71a8-8993-292b3feb2162",
  roleId: "019bdc5f-992b-7068-a1bb-7e35a82eaaea",
  jobFieldId: "019bdc5f-9954-700d-8fe5-8a39aac48076",
  collaborationFieldId: "019bdc5f-996a-701b-8180-b372f681144a",
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
  load_file: {
    vus: 10,
    duration: "30s",
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
