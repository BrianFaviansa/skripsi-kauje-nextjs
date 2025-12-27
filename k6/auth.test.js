import http from "k6/http";
import { check, sleep, group } from "k6";
import {
  BASE_URL,
  TEST_USER,
  FOREIGN_KEYS,
  OPTIONS,
  THRESHOLDS,
  handleSummary,
} from "./config.js";

export { handleSummary };

export const options = {
  ...OPTIONS.load,
  thresholds: THRESHOLDS,
};

// Shared state untuk menyimpan token
let accessToken = "";
let refreshToken = "";

export function setup() {
  // Login untuk mendapatkan token
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      nim: TEST_USER.nim,
      password: TEST_USER.password,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  check(loginRes, {
    "login successful": (r) => r.status === 200,
  });

  const body = JSON.parse(loginRes.body);
  return {
    accessToken: body.data?.accessToken || body.accessToken,
    refreshToken: body.data?.refreshToken || body.refreshToken,
  };
}

export default function (data) {
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.accessToken}`,
  };

  // Generate guaranteed unique values: VU + ITER ensures uniqueness across all VUs
  const vuPad = String(__VU).padStart(3, "0"); // 001-100
  const iterPad = String(__ITER).padStart(4, "0"); // 0000-9999
  const timestamp = Date.now();

  // NIM: 10 chars - VU(3) + ITER(4) + timestamp(3) = unique per iteration
  const randomNim = `${vuPad}${iterPad}${String(timestamp).slice(-3)}`;
  // Phone: 12 chars - 08 + VU(2) + ITER(4) + random(4) = unique per iteration
  const randomPhone = `08${String(__VU).padStart(2, "0")}${iterPad}${String(
    timestamp
  ).slice(-4)}`;
  // Email: fully unique
  const randomEmail = `k6_v${__VU}_i${__ITER}_${timestamp}@test.com`;
  const uniqueId = `${vuPad}${iterPad}${timestamp}`;

  // Register Test
  group("Auth - Register", function () {
    const payload = JSON.stringify({
      nim: randomNim,
      name: `User K6 Test ${uniqueId.substring(0, 8)}`,
      email: randomEmail,
      password: "password123",
      phoneNumber: randomPhone,
      enrollmentYear: 2020,
      graduationYear: 2024,
      provinceId: FOREIGN_KEYS.provinceId,
      cityId: FOREIGN_KEYS.cityId,
      facultyId: FOREIGN_KEYS.facultyId,
      majorId: FOREIGN_KEYS.majorId,
      verificationFileUrl: "/uploads/verification/test.pdf",
    });

    const res = http.post(`${BASE_URL}/auth/register`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const success = check(res, {
      "register status 201": (r) => r.status === 201,
    });

    // Debug: log first few failures
    if (!success && __ITER < 3) {
      console.log(`Register failed - Status: ${res.status}, Body: ${res.body}`);
    }
  });

  sleep(1);

  group("Auth - Login", function () {
    const res = http.post(
      `${BASE_URL}/auth/login`,
      JSON.stringify({
        nim: TEST_USER.nim,
        password: TEST_USER.password,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    check(res, {
      "login status 200": (r) => r.status === 200,
      "login has token": (r) => {
        const body = JSON.parse(r.body);
        return body.data?.accessToken || body.accessToken;
      },
    });
  });

  sleep(1);

  group("Auth - Me", function () {
    const res = http.get(`${BASE_URL}/auth/me`, {
      headers: authHeaders,
    });

    check(res, {
      "me status 200": (r) => r.status === 200,
      "me has user data": (r) => {
        const body = JSON.parse(r.body);
        return body.data?.id || body.id;
      },
    });
  });

  sleep(1);

  group("Auth - Refresh Token", function () {
    if (data.refreshToken) {
      const res = http.post(
        `${BASE_URL}/auth/refresh`,
        JSON.stringify({
          oldRefreshToken: data.refreshToken,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      check(res, {
        "refresh status 200": (r) => r.status === 200,
      });
    }
  });

  sleep(1);
}
