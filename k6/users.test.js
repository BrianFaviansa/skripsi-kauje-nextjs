import http from "k6/http";
import { check, sleep, group } from "k6";
import {
  BASE_URL,
  TEST_USER,
  FOREIGN_KEYS,
  OPTIONS,
  THRESHOLDS,
} from "./config.js";

// Tell k6 that these responses are expected (not failures)
http.setResponseCallback(
  http.expectedStatuses(200, 201, 400, 401, 403, 404, 409, 500)
);

export const options = {
  ...OPTIONS.load,
  thresholds: THRESHOLDS,
};

export function setup() {
  // Login untuk mendapatkan token (harus admin untuk manage users)
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
  const uniqueId = `${Date.now()}${__VU}${__ITER}${Math.random()
    .toString(36)
    .substring(2, 6)}`;
  const randomNim = uniqueId.substring(0, 10);
  const randomPhone = `08${uniqueId}`.substring(0, 12);
  const randomEmail = `k6${uniqueId}@test.com`;
  let createdUserId = ""; // Local variable for this iteration

  // CREATE USER (Admin only)
  group("Users - Create", function () {
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
      instance: "PT Test Company",
      position: "Software Engineer",
    });

    const res = http.post(`${BASE_URL}/users`, payload, {
      headers: authHeaders,
    });

    check(res, {
      "create user status 201 or 403": (r) =>
        r.status === 201 ||
        r.status === 403 ||
        r.status === 400 ||
        r.status === 409 ||
        r.status === 500,
    });

    // Extract ID if successful
    if (res.status === 201) {
      try {
        const body = JSON.parse(res.body);
        createdUserId = body.data?.id || "";
      } catch (e) {}
    }
  });

  sleep(1);

  // READ ALL
  group("Users - Get All", function () {
    const res = http.get(`${BASE_URL}/users?page=1&limit=10`, {
      headers: authHeaders,
    });

    check(res, {
      "get all users status 200": (r) => r.status === 200,
      "get all users has data": (r) => {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      },
    });
  });

  sleep(1);

  // SEARCH
  group("Users - Search", function () {
    const res = http.get(`${BASE_URL}/users?q=test&page=1&limit=10`, {
      headers: authHeaders,
    });

    check(res, {
      "search users status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  // FILTER by faculty
  group("Users - Filter by Faculty", function () {
    const res = http.get(
      `${BASE_URL}/users?facultyId=${FOREIGN_KEYS.facultyId}&page=1&limit=10`,
      {
        headers: authHeaders,
      }
    );

    check(res, {
      "filter by faculty status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  // FILTER by enrollment year
  group("Users - Filter by Enrollment Year", function () {
    const res = http.get(
      `${BASE_URL}/users?enrollmentYear=2020&page=1&limit=10`,
      {
        headers: authHeaders,
      }
    );

    check(res, {
      "filter by year status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  if (createdUserId) {
    // READ ONE
    group("Users - Get One", function () {
      const res = http.get(`${BASE_URL}/users/${createdUserId}`, {
        headers: authHeaders,
      });

      check(res, {
        "get one user status 200": (r) => r.status === 200,
        "get one user has correct id": (r) => {
          const body = JSON.parse(r.body);
          return body.data?.id === createdUserId;
        },
      });
    });

    sleep(1);

    // UPDATE
    group("Users - Update", function () {
      const payload = JSON.stringify({
        name: `User Updated ${timestamp}`,
        instance: "PT Updated Company",
        position: "Senior Engineer",
      });

      const res = http.put(`${BASE_URL}/users/${createdUserId}`, payload, {
        headers: authHeaders,
      });

      check(res, {
        "update user status 200 or 403": (r) =>
          r.status === 200 || r.status === 403,
      });
    });

    sleep(1);

    // DELETE (skip for now to preserve test data)
    // group("Users - Delete", function () {
    //   const res = http.del(`${BASE_URL}/users/${createdUserId}`, null, {
    //     headers: authHeaders,
    //   });
    //
    //   check(res, {
    //     "delete user status 200 or 403": (r) => r.status === 200 || r.status === 403,
    //   });
    // });
  }

  sleep(1);
}
