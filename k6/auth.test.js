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

  // Generate unique values using timestamp + VU ID + iteration number + random
  const uniqueId = `${Date.now()}${__VU}${__ITER}${Math.random()
    .toString(36)
    .substring(2, 6)}`;
  const randomNim = uniqueId.substring(0, 10);
  const randomPhone = `08${uniqueId}`.substring(0, 12);
  const randomEmail = `k6${uniqueId}@test.com`;

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

    check(res, {
      "register status 201": (r) => r.status === 201,
    });
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
