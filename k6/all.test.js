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
    refreshToken: body.data?.refreshToken || body.refreshToken,
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

  // ============ AUTH ============
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
    });
  });

  sleep(0.5);

  group("Auth - Me", function () {
    const res = http.get(`${BASE_URL}/auth/me`, {
      headers: authHeaders,
    });

    check(res, {
      "me status 200": (r) => r.status === 200,
    });
  });

  sleep(0.5);

  // ============ JOBS ============
  let jobId = "";
  group("Jobs - Create", function () {
    const payload = JSON.stringify({
      title: `Job All Test ${timestamp}`,
      content: "Deskripsi lowongan kerja untuk comprehensive testing.",
      company: "PT All Test",
      jobType: "FULL_TIME",
      openFrom: today,
      openUntil: nextMonth,
      registrationLink: "",
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
    });

    const body = JSON.parse(res.body);
    jobId = body.data?.id || "";
  });

  sleep(0.5);

  group("Jobs - Get All", function () {
    const res = http.get(`${BASE_URL}/jobs?page=1&limit=5`, {
      headers: authHeaders,
    });

    check(res, {
      "get jobs status 200": (r) => r.status === 200,
    });
  });

  if (jobId) {
    group("Jobs - Delete", function () {
      http.del(`${BASE_URL}/jobs/${jobId}`, null, { headers: authHeaders });
    });
  }

  sleep(0.5);

  // ============ COLLABORATIONS ============
  let collabId = "";
  group("Collaborations - Create", function () {
    const payload = JSON.stringify({
      title: `Collab All Test ${timestamp}`,
      content: "Kolaborasi untuk comprehensive testing dengan k6.",
      imageUrl: "",
      collaborationFieldId: "",
    });

    const res = http.post(`${BASE_URL}/collaborations`, payload, {
      headers: authHeaders,
    });

    check(res, {
      "create collab status 201": (r) => r.status === 201,
    });

    const body = JSON.parse(res.body);
    collabId = body.data?.id || "";
  });

  sleep(0.5);

  group("Collaborations - Get All", function () {
    const res = http.get(`${BASE_URL}/collaborations?page=1&limit=5`, {
      headers: authHeaders,
    });

    check(res, {
      "get collabs status 200": (r) => r.status === 200,
    });
  });

  if (collabId) {
    group("Collaborations - Delete", function () {
      http.del(`${BASE_URL}/collaborations/${collabId}`, null, {
        headers: authHeaders,
      });
    });
  }

  sleep(0.5);

  // ============ FORUMS ============
  let forumId = "";
  group("Forums - Create", function () {
    const payload = JSON.stringify({
      title: `Forum All Test ${timestamp}`,
      content: "Diskusi forum untuk comprehensive testing dengan k6.",
      imageUrl: "",
    });

    const res = http.post(`${BASE_URL}/forums`, payload, {
      headers: authHeaders,
    });

    check(res, {
      "create forum status 201": (r) => r.status === 201,
    });

    const body = JSON.parse(res.body);
    forumId = body.data?.id || "";
  });

  sleep(0.5);

  group("Forums - Get All", function () {
    const res = http.get(`${BASE_URL}/forums?page=1&limit=5`, {
      headers: authHeaders,
    });

    check(res, {
      "get forums status 200": (r) => r.status === 200,
    });
  });

  if (forumId) {
    group("Forums - Like", function () {
      http.post(`${BASE_URL}/forums/${forumId}/like`, null, {
        headers: authHeaders,
      });
    });

    group("Forums - Delete", function () {
      http.del(`${BASE_URL}/forums/${forumId}`, null, { headers: authHeaders });
    });
  }

  sleep(0.5);

  // ============ NEWS ============
  let newsId = "";
  group("News - Create", function () {
    const payload = JSON.stringify({
      title: `News All Test ${timestamp}`,
      content: "Berita untuk comprehensive testing dengan k6.",
      date: today,
      imageUrl: "",
    });

    const res = http.post(`${BASE_URL}/news`, payload, {
      headers: authHeaders,
    });

    check(res, {
      "create news status 201": (r) => r.status === 201,
    });

    const body = JSON.parse(res.body);
    newsId = body.data?.id || "";
  });

  sleep(0.5);

  group("News - Get All", function () {
    const res = http.get(`${BASE_URL}/news?page=1&limit=5`, {
      headers: authHeaders,
    });

    check(res, {
      "get news status 200": (r) => r.status === 200,
    });
  });

  if (newsId) {
    group("News - Delete", function () {
      http.del(`${BASE_URL}/news/${newsId}`, null, { headers: authHeaders });
    });
  }

  sleep(0.5);

  // ============ PRODUCTS ============
  let productId = "";
  group("Products - Create", function () {
    const payload = JSON.stringify({
      name: `Product All Test ${timestamp}`,
      description: "Produk untuk comprehensive testing dengan k6.",
      price: 100000,
      category: "PRODUK",
      imageUrl: "",
    });

    const res = http.post(`${BASE_URL}/products`, payload, {
      headers: authHeaders,
    });

    check(res, {
      "create product status 201": (r) => r.status === 201,
    });

    const body = JSON.parse(res.body);
    productId = body.data?.id || "";
  });

  sleep(0.5);

  group("Products - Get All", function () {
    const res = http.get(`${BASE_URL}/products?page=1&limit=5`, {
      headers: authHeaders,
    });

    check(res, {
      "get products status 200": (r) => r.status === 200,
    });
  });

  if (productId) {
    group("Products - Delete", function () {
      http.del(`${BASE_URL}/products/${productId}`, null, {
        headers: authHeaders,
      });
    });
  }

  sleep(0.5);

  // ============ USERS ============
  group("Users - Get All", function () {
    const res = http.get(`${BASE_URL}/users?page=1&limit=5`, {
      headers: authHeaders,
    });

    check(res, {
      "get users status 200": (r) => r.status === 200,
    });
  });

  sleep(1);
}
