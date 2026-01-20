import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, TEST_USER, THRESHOLDS, handleSummary } from "./config.js";

export { handleSummary };

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: THRESHOLDS,
};

const testImageData = open("../image_upload_test/laravel_image.png", "b");

export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      nim: TEST_USER.nim,
      password: TEST_USER.password,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  const success = check(loginRes, {
    "setup login successful": (r) => r.status === 200,
  });

  if (!success) {
    console.log(`Setup login failed: ${loginRes.status} - ${loginRes.body}`);
  }

  const body = JSON.parse(loginRes.body);
  const token = body.data?.accessToken || body.accessToken;

  console.log(`Login successful, token obtained: ${token ? "yes" : "no"}`);

  return {
    accessToken: token,
  };
}

export default function (data) {
  const timestamp = Date.now();
  const uniqueId = `${__VU}_${__ITER}_${timestamp}`;
  const filename = `laravel_image_${uniqueId}.png`;

  const formData = {
    file: http.file(testImageData, filename, "image/png"),
  };

  const res = http.post(`${BASE_URL}/news/upload`, formData, {
    headers: {
      Authorization: `Bearer ${data.accessToken}`,
    },
  });

  check(res, {
    "upload status 200 or 201": (r) => r.status === 200 || r.status === 201,
    "upload has url": (r) => {
      if (r.status !== 200 && r.status !== 201) return false;
      try {
        const body = JSON.parse(r.body);
        return body.data?.url;
      } catch {
        return false;
      }
    },
  });

  if (__ITER < 3 && __VU === 1) {
    console.log(`VU ${__VU}, Iter ${__ITER}: Status ${res.status}`);
    if (res.status !== 200 && res.status !== 201) {
      console.log(`Response: ${res.body}`);
    }
  }

  sleep(0.5);
}

export function teardown() {
  console.log("News File Upload Load Test Completed");
  console.log("Configuration: 100 VUs, 3 minutes total duration");
  console.log("Image source: image_upload_test/laravel_image.png");
}
