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

  const vuPad = String(__VU).padStart(3, "0"); 
  const iterPad = String(__ITER).padStart(4, "0"); 
  const timestamp = Date.now();

  const randomNim = `${vuPad}${iterPad}${String(timestamp).slice(-3)}`;
  const randomPhone = `08${String(__VU).padStart(2, "0")}${iterPad}${String(
    timestamp
  ).slice(-4)}`;
  const randomEmail = `k6_v${__VU}_i${__ITER}_${timestamp}@test.com`;
  const uniqueId = `${vuPad}${iterPad}${timestamp}`;
  let createdUserId = "";

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
      "create user status 201": (r) => r.status === 201,
    });

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
        "update user status 200": (r) => r.status === 200,
      });
    });

    sleep(1);

    // DELETE 
    group("Users - Delete", function () {
      const res = http.del(`${BASE_URL}/users/${createdUserId}`, null, {
        headers: authHeaders,
      });
    
      check(res, {
        "delete user status 200 or 403": (r) => r.status === 200 || r.status === 403,
      });
    });
  }

  sleep(1);
}
