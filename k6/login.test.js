import http from "k6/http";
import { check, sleep, group } from "k6";
import {
  BASE_URL,
  TEST_USER,
  OPTIONS,
  THRESHOLDS,
  handleSummary,
} from "./config.js";

export { handleSummary };

export const options = {
  ...OPTIONS.load,
  thresholds: THRESHOLDS,
};

export function setup() {
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

  const success = check(loginRes, {
    "setup login successful": (r) => r.status === 200,
  });

  if (!success) {
    console.log(`Setup login failed: ${loginRes.status} - ${loginRes.body}`);
  }

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

  // Login Test
  group("Login", function () {
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
        if (r.status !== 200) return false;
        try {
          const body = JSON.parse(r.body);
          return body.data?.accessToken || body.accessToken;
        } catch {
          return false;
        }
      },
    });
  });

  sleep(0.5);

  // Me Test
  group("Me", function () {
    const res = http.get(`${BASE_URL}/auth/me`, {
      headers: authHeaders,
    });

    check(res, {
      "me status 200": (r) => r.status === 200,
      "me has user data": (r) => {
        if (r.status !== 200) return false;
        try {
          const body = JSON.parse(r.body);
          return body.data?.id || body.id;
        } catch {
          return false;
        }
      },
    });
  });

  sleep(0.5);

  // Refresh Token Test
  group("Refresh Token", function () {
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

  sleep(0.5);
}

export function teardown() {
  console.log("Login Load Test Completed");
}
