import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up to 20 virtual users
    { duration: '1m', target: 50 },   // Sustained load of 50 users
    { duration: '20s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // CAT-12: p95 latency under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api/v1';

export default function () {
  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  // 2. Catalog Home Page
  const homeRes = http.get(`${BASE_URL}/catalog/home`);
  check(homeRes, {
    'home status is 200': (r) => r.status === 200,
  });

  // 3. Catalog Course Search / Discovery
  const searchRes = http.get(`${BASE_URL}/catalog/courses?filter[price]=free&sort=-rating`);
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
  });

  // 4. Autocomplete
  const autoRes = http.get(`${BASE_URL}/catalog/search/autocomplete?q=laravel`);
  check(autoRes, {
    'autocomplete status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
