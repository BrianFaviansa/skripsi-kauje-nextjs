// K6 Load Test Configuration
// Ubah BASE_URL sesuai dengan environment yang akan ditest

export const BASE_URL = "http://localhost:3000/api";

// Test user credentials (sesuaikan dengan data di database)
export const TEST_USER = {
  nim: "12345",
  password: "password123",
};

// Foreign Keys - Ganti dengan CUID yang valid dari database kamu
export const FOREIGN_KEYS = {
  provinceId: "GANTI_DENGAN_PROVINCE_ID",
  cityId: "GANTI_DENGAN_CITY_ID",
  facultyId: "GANTI_DENGAN_FACULTY_ID",
  majorId: "GANTI_DENGAN_MAJOR_ID",
  roleId: "GANTI_DENGAN_ROLE_ID", // optional
  jobFieldId: "GANTI_DENGAN_JOB_FIELD_ID",
  collaborationFieldId: "GANTI_DENGAN_COLLABORATION_FIELD_ID",
};

// Load test options
export const OPTIONS = {
  // Smoke test - minimal load to verify system works
  smoke: {
    vus: 1,
    duration: "30s",
  },
  // Load test - normal expected load
  load: {
    stages: [
      { duration: "1m", target: 10 }, // ramp up to 10 users
      { duration: "3m", target: 10 }, // stay at 10 users
      { duration: "1m", target: 0 }, // ramp down to 0
    ],
  },
  // Stress test - find breaking point
  stress: {
    stages: [
      { duration: "2m", target: 10 },
      { duration: "5m", target: 50 },
      { duration: "2m", target: 100 },
      { duration: "5m", target: 100 },
      { duration: "2m", target: 0 },
    ],
  },
  // Spike test - sudden surge in traffic
  spike: {
    stages: [
      { duration: "10s", target: 100 },
      { duration: "1m", target: 100 },
      { duration: "10s", target: 0 },
    ],
  },
};

// Thresholds for performance
export const THRESHOLDS = {
  http_req_duration: ["p(95)<500"], // 95% of requests should be below 500ms
  http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail
};
