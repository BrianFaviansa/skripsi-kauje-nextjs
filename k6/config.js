// K6 Load Test Configuration
// Ubah BASE_URL sesuai dengan environment yang akan ditest

export const BASE_URL = "http://localhost:3000/api";

// Test user credentials (sesuaikan dengan data di database)
export const TEST_USER = {
  nim: "202410101014",
  password: "password123",
};

// Foreign Keys - Ganti dengan CUID yang valid dari database kamu
export const FOREIGN_KEYS = {
  provinceId: "cmjgzhqzq007bt407znej4rl5",
  cityId: "cmjgzhr0v007it407low43neg",
  facultyId: "cmjgzhlwg0002t407hh67fzrf",
  majorId: "cmjgzhlz7000ht4078229mstr",
  roleId: "GANTI_DENGAN_ROLE_ID", // optional
  jobFieldId: "cmjgzhm63002pt407zniilhdv",
  collaborationFieldId: "cmjgzhm7k002zt407rfy460pe",
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
      { duration: "30s", target: 50 }, // ramp up to 25 users
      { duration: "30s", target: 100 }, // ramp up to 50 users
      { duration: "1m", target: 100 }, // stay at 50 users (steady state)
      { duration: "30s", target: 50 }, // ramp down to 25 users
      { duration: "30s", target: 0 }, // ramp down to 0
    ],
  },
};

// Thresholds for performance (realistic for local development with 100 VUs)
export const THRESHOLDS = {
  http_req_duration: ["p(95)<2000"], // 95% of requests should be below 2 seconds
  http_req_failed: ["rate<0.10"], // Less than 10% of requests should fail
};
