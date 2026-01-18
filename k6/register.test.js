import http from "k6/http";
import { check, sleep } from "k6";
import {
  BASE_URL,
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

export default function () {
  const vuPad = String(__VU).padStart(3, "0"); 
  const iterPad = String(__ITER).padStart(4, "0"); 
  const timestamp = Date.now();
  const microRandom = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  const randomNim = `${vuPad}${String(__ITER).padStart(3, "0")}${microRandom}`;
  const randomPhone = `08${vuPad}${String(__ITER).padStart(
    3,
    "0"
  )}${microRandom}`;
  const randomEmail = `k6_v${__VU}_i${__ITER}_${timestamp}@test.com`;
  const uniqueId = `${vuPad}${iterPad}${timestamp}`;

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

  const success = check(res, {
    "register status 201": (r) => r.status === 201,
    "register has user data": (r) => {
      if (r.status !== 201) return false;
      try {
        const body = JSON.parse(r.body);
        return body.data?.id || body.user?.id || body.id;
      } catch {
        return false;
      }
    },
  });

  if (!success && __ITER < 3) {
    console.log(`Register failed - VU: ${__VU}, ITER: ${__ITER}`);
    console.log(`Status: ${res.status}, Body: ${res.body}`);
  }

  sleep(0.5);
}

export function teardown() {
  console.log("Register Load Test Completed");
}
