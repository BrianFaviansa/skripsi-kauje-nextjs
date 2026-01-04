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
  let createdForumId = "";
  let createdCommentId = "";

  // CREATE FORUM
  group("Forums - Create", function () {
    const payload = JSON.stringify({
      title: `Forum Test K6 ${timestamp}`,
      content:
        "Ini adalah konten forum untuk testing dengan k6 load testing tool. Diskusi menarik!",
      imageUrl: "",
    });

    const res = http.post(`${BASE_URL}/forums`, payload, {
      headers: authHeaders,
    });

    check(res, {
      "create forum status 201": (r) => r.status === 201,
    });

    // Extract ID if successful
    if (res.status === 201) {
      try {
        const body = JSON.parse(res.body);
        createdForumId = body.data?.id || "";
      } catch (e) {}
    }
  });

  sleep(1);

  // READ ALL FORUMS
  group("Forums - Get All", function () {
    const res = http.get(`${BASE_URL}/forums?page=1&limit=10`, {
      headers: authHeaders,
    });

    check(res, {
      "get all forums status 200": (r) => r.status === 200,
      "get all forums has data": (r) => {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      },
    });
  });

  sleep(1);

  // SEARCH FORUMS
  group("Forums - Search", function () {
    const res = http.get(`${BASE_URL}/forums?q=forum&page=1&limit=10`, {
      headers: authHeaders,
    });

    check(res, {
      "search forums status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  if (createdForumId) {
    // READ ONE FORUM
    group("Forums - Get One", function () {
      const res = http.get(`${BASE_URL}/forums/${createdForumId}`, {
        headers: authHeaders,
      });

      check(res, {
        "get one forum status 200": (r) => r.status === 200,
      });
    });

    sleep(1);

    // UPDATE FORUM
    group("Forums - Update", function () {
      const payload = JSON.stringify({
        title: `Forum Updated ${timestamp}`,
        content: "Konten forum yang sudah diupdate melalui k6.",
      });

      const res = http.put(`${BASE_URL}/forums/${createdForumId}`, payload, {
        headers: authHeaders,
      });

      check(res, {
        "update forum status 200": (r) => r.status === 200,
      });
    });

    sleep(1);

    // CREATE COMMENT
    group("Forums - Create Comment", function () {
      const payload = JSON.stringify({
        content: `Komentar test K6 ${timestamp}`,
      });

      const res = http.post(
        `${BASE_URL}/forums/${createdForumId}/comments`,
        payload,
        {
          headers: authHeaders,
        }
      );

      check(res, {
        "create comment status 201": (r) => r.status === 201,
      });

      // Extract ID if successful
      if (res.status === 201) {
        try {
          const body = JSON.parse(res.body);
          createdCommentId = body.data?.id || "";
        } catch (e) {}
      }
    });

    sleep(1);

    // GET ALL COMMENTS
    group("Forums - Get Comments", function () {
      const res = http.get(`${BASE_URL}/forums/${createdForumId}/comments`, {
        headers: authHeaders,
      });

      check(res, {
        "get comments status 200": (r) => r.status === 200,
      });
    });

    sleep(1);

    // LIKE FORUM
    group("Forums - Like", function () {
      const res = http.post(`${BASE_URL}/forums/${createdForumId}/like`, null, {
        headers: authHeaders,
      });

      check(res, {
        "like status 200 or 201": (r) => r.status === 200 || r.status === 201,
      });
    });

    sleep(1);

    // GET LIKES
    group("Forums - Get Likes", function () {
      const res = http.get(`${BASE_URL}/forums/${createdForumId}/likes`, {
        headers: authHeaders,
      });

      check(res, {
        "get likes status 200": (r) => r.status === 200,
      });
    });

    sleep(1);

    // UNLIKE FORUM 
    group("Forums - Unlike", function () {
      const res = http.post(`${BASE_URL}/forums/${createdForumId}/like`, null, {
        headers: authHeaders,
      });

      check(res, {
        "unlike status 200": (r) => r.status === 200,
      });
    });

    sleep(1);

    // DELETE COMMENT
    if (createdCommentId) {
      group("Forums - Delete Comment", function () {
        const res = http.del(
          `${BASE_URL}/forums/${createdForumId}/comments/${createdCommentId}`,
          null,
          {
            headers: authHeaders,
          }
        );

        check(res, {
          "delete comment status 200": (r) => r.status === 200,
        });
      });

      sleep(1);
    }

    // DELETE FORUM
    group("Forums - Delete", function () {
      const res = http.del(`${BASE_URL}/forums/${createdForumId}`, null, {
        headers: authHeaders,
      });

      check(res, {
        "delete forum status 200": (r) => r.status === 200,
      });
    });
  }

  sleep(1);
}
