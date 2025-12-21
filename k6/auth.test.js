import http from "k6/http";
import { check, sleep, group } from "k6";
import {
  BASE_URL,
  TEST_USER,
  FOREIGN_KEYS,
  OPTIONS,
  THRESHOLDS,
} from "./config.js";

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
        "refresh status 200 or 401": (r) =>
          r.status === 200 || r.status === 401,
      });
    }
  });

  sleep(1);
}
