import http from "k6/http";
import { check, sleep, group } from "k6";
import { BASE_URL, TEST_USER, OPTIONS, THRESHOLDS } from "./config.js";

// Tell k6 that these responses are expected (not failures)
http.setResponseCallback(
  http.expectedStatuses(200, 201, 400, 401, 403, 404, 409, 500)
);

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
  };
}

export default function (data) {
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.accessToken}`,
  };

  const timestamp = Date.now();
  let createdProductId = ""; // Local variable for this iteration

  // CREATE
  group("Products - Create", function () {
    const payload = JSON.stringify({
      name: `Produk K6 Test ${timestamp}`,
      description:
        "Ini adalah deskripsi produk untuk testing dengan k6 load testing tool. Produk berkualitas tinggi.",
      price: 150000,
      category: "PRODUK", // atau "JASA"
      imageUrl: "",
    });

    const res = http.post(`${BASE_URL}/products`, payload, {
      headers: authHeaders,
    });

    check(res, {
      "create product status 201": (r) => r.status === 201,
    });

    // Extract ID if successful
    if (res.status === 201) {
      try {
        const body = JSON.parse(res.body);
        createdProductId = body.data?.id || "";
      } catch (e) {}
    }
  });

  sleep(1);

  // CREATE JASA type
  group("Products - Create Jasa", function () {
    const payload = JSON.stringify({
      name: `Jasa K6 Test ${timestamp}`,
      description:
        "Jasa profesional untuk testing dengan k6. Layanan terbaik untuk kebutuhan Anda.",
      price: 250000,
      category: "JASA",
      imageUrl: "",
    });

    const res = http.post(`${BASE_URL}/products`, payload, {
      headers: authHeaders,
    });

    check(res, {
      "create jasa status 201": (r) => r.status === 201,
    });
  });

  sleep(1);

  // READ ALL
  group("Products - Get All", function () {
    const res = http.get(`${BASE_URL}/products?page=1&limit=10`, {
      headers: authHeaders,
    });

    check(res, {
      "get all products status 200": (r) => r.status === 200,
      "get all products has data": (r) => {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      },
    });
  });

  sleep(1);

  // SEARCH
  group("Products - Search", function () {
    const res = http.get(`${BASE_URL}/products?q=produk&page=1&limit=10`, {
      headers: authHeaders,
    });

    check(res, {
      "search products status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  // FILTER by category
  group("Products - Filter by Category", function () {
    const res = http.get(
      `${BASE_URL}/products?category=PRODUK&page=1&limit=10`,
      {
        headers: authHeaders,
      }
    );

    check(res, {
      "filter by category status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  // FILTER by price range
  group("Products - Filter by Price Range", function () {
    const res = http.get(
      `${BASE_URL}/products?minPrice=100000&maxPrice=500000&page=1&limit=10`,
      {
        headers: authHeaders,
      }
    );

    check(res, {
      "filter by price status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  if (createdProductId) {
    // READ ONE
    group("Products - Get One", function () {
      const res = http.get(`${BASE_URL}/products/${createdProductId}`, {
        headers: authHeaders,
      });

      check(res, {
        "get one product status 200": (r) => r.status === 200,
        "get one product has correct id": (r) => {
          const body = JSON.parse(r.body);
          return body.data?.id === createdProductId;
        },
      });
    });

    sleep(1);

    // UPDATE
    group("Products - Update", function () {
      const payload = JSON.stringify({
        name: `Produk Updated ${timestamp}`,
        description: "Deskripsi produk yang sudah diupdate melalui k6.",
        price: 200000,
      });

      const res = http.put(
        `${BASE_URL}/products/${createdProductId}`,
        payload,
        {
          headers: authHeaders,
        }
      );

      check(res, {
        "update product status 200": (r) => r.status === 200,
      });
    });

    sleep(1);

    // DELETE
    group("Products - Delete", function () {
      const res = http.del(`${BASE_URL}/products/${createdProductId}`, null, {
        headers: authHeaders,
      });

      check(res, {
        "delete product status 200": (r) => r.status === 200,
      });
    });
  }

  sleep(1);
}
