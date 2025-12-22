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

let createdJobId = "";

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

  const body = JSON.parse(loginRes.body);
  return {
    accessToken: body.data?.accessToken || body.accessToken,
  };
}

export default function (data) {
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.accessToken}`,
  };

  const timestamp = Date.now();
  const today = new Date().toISOString().split("T")[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // CREATE
  group("Jobs - Create", function () {
    const payload = JSON.stringify({
      title: `Software Engineer K6 Test ${timestamp}`,
      content:
        "Deskripsi lowongan kerja untuk testing dengan k6 load testing. Kami mencari kandidat yang berpengalaman.",
      company: "PT K6 Testing Indonesia",
      jobType: "FULL_TIME", // Sesuaikan dengan enum JobType
      openFrom: today,
      openUntil: nextMonth,
      registrationLink: "https://example.com/apply",
      imageUrl: "",
      provinceId: FOREIGN_KEYS.provinceId,
      cityId: FOREIGN_KEYS.cityId,
      jobFieldId: FOREIGN_KEYS.jobFieldId,
    });

    const res = http.post(`${BASE_URL}/jobs`, payload, {
      headers: authHeaders,
    });

    check(res, {
      "create job status 201": (r) => r.status === 201,
      "create job has id": (r) => {
        const body = JSON.parse(r.body);
        if (body.data?.id) {
          createdJobId = body.data.id;
          return true;
        }
        return false;
      },
    });
  });

  sleep(1);

  // READ ALL
  group("Jobs - Get All", function () {
    const res = http.get(`${BASE_URL}/jobs?page=1&limit=10`, {
      headers: authHeaders,
    });

    check(res, {
      "get all jobs status 200": (r) => r.status === 200,
      "get all jobs has data": (r) => {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      },
    });
  });

  sleep(1);

  // SEARCH
  group("Jobs - Search", function () {
    const res = http.get(`${BASE_URL}/jobs?q=engineer&page=1&limit=10`, {
      headers: authHeaders,
    });

    check(res, {
      "search jobs status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  // FILTER by jobType
  group("Jobs - Filter by Type", function () {
    const res = http.get(`${BASE_URL}/jobs?jobType=FULL_TIME&page=1&limit=10`, {
      headers: authHeaders,
    });

    check(res, {
      "filter jobs status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  if (createdJobId) {
    // READ ONE
    group("Jobs - Get One", function () {
      const res = http.get(`${BASE_URL}/jobs/${createdJobId}`, {
        headers: authHeaders,
      });

      check(res, {
        "get one job status 200": (r) => r.status === 200,
        "get one job has correct id": (r) => {
          const body = JSON.parse(r.body);
          return body.data?.id === createdJobId;
        },
      });
    });

    sleep(1);

    // UPDATE
    group("Jobs - Update", function () {
      const payload = JSON.stringify({
        title: `Job Updated ${timestamp}`,
        content: "Deskripsi lowongan yang sudah diupdate melalui k6.",
      });

      const res = http.put(`${BASE_URL}/jobs/${createdJobId}`, payload, {
        headers: authHeaders,
      });

      check(res, {
        "update job status 200": (r) => r.status === 200,
      });
    });

    sleep(1);

    // DELETE
    group("Jobs - Delete", function () {
      const res = http.del(`${BASE_URL}/jobs/${createdJobId}`, null, {
        headers: authHeaders,
      });

      check(res, {
        "delete job status 200": (r) => r.status === 200,
      });
    });
  }

  sleep(1);
}
