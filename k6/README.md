# K6 Load Testing untuk KAUJE API

Folder ini berisi script k6 untuk load testing API KAUJE.

## Prerequisites

Install k6 terlebih dahulu:

```bash
# Windows (menggunakan winget)
winget install k6 --source winget

# Windows (menggunakan chocolatey)
choco install k6

# MacOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Konfigurasi

Edit file `config.js` untuk menyesuaikan:

1. **BASE_URL**: URL API yang akan ditest
2. **TEST_USER**: Credentials user untuk testing
3. **FOREIGN_KEYS**: Ganti dengan CUID yang valid dari database

```javascript
export const FOREIGN_KEYS = {
  provinceId: "GANTI_DENGAN_PROVINCE_ID",
  cityId: "GANTI_DENGAN_CITY_ID",
  facultyId: "GANTI_DENGAN_FACULTY_ID",
  majorId: "GANTI_DENGAN_MAJOR_ID",
  roleId: "GANTI_DENGAN_ROLE_ID",
  jobFieldId: "GANTI_DENGAN_JOB_FIELD_ID",
  collaborationFieldId: "GANTI_DENGAN_COLLABORATION_FIELD_ID",
};
```

## Menjalankan Test

### Test Individual API

```bash
# Auth API
k6 run k6/auth.test.js

# Jobs API
k6 run k6/jobs.test.js

# Collaborations API
k6 run k6/collaborations.test.js

# Forums API
k6 run k6/forums.test.js

# News API
k6 run k6/news.test.js

# Products API
k6 run k6/products.test.js

# Users API
k6 run k6/users.test.js
```

### Test Semua API Sekaligus

```bash
k6 run k6/all.test.js
```

### Mengubah Test Options

Edit `options` di file config.js untuk mengubah jenis test:

```javascript
// Di file test, ganti OPTIONS.load dengan:
export const options = {
  ...OPTIONS.smoke, // Smoke test (1 VU, 30s)
  ...OPTIONS.load, // Load test (10 VUs, 5 menit)
  ...OPTIONS.stress, // Stress test (sampai 100 VUs)
  ...OPTIONS.spike, // Spike test (lonjakan drastis)
  thresholds: THRESHOLDS,
};
```

### Menjalankan dengan Custom VUs dan Duration

```bash
# 10 virtual users selama 30 detik
k6 run --vus 10 --duration 30s k6/auth.test.js

# 50 virtual users selama 2 menit
k6 run --vus 50 --duration 2m k6/all.test.js
```

## Output ke File

```bash
# Output JSON
k6 run --out json=results.json k6/all.test.js

# Output CSV
k6 run --out csv=results.csv k6/all.test.js
```

## File Structure

```
k6/
├── config.js              # Konfigurasi (BASE_URL, credentials, options)
├── auth.test.js           # Test Auth API (login, me, refresh)
├── jobs.test.js           # Test Jobs API (CRUD)
├── collaborations.test.js # Test Collaborations API (CRUD)
├── forums.test.js         # Test Forums API (CRUD + comments + likes)
├── news.test.js           # Test News API (CRUD)
├── products.test.js       # Test Products API (CRUD)
├── users.test.js          # Test Users API (CRUD)
└── all.test.js            # Test semua API sekaligus
```

## Test Coverage

| API            | Endpoints Tested                                                               |
| -------------- | ------------------------------------------------------------------------------ |
| Auth           | Login, Me, Refresh Token                                                       |
| Jobs           | Create, Get All, Get One, Search, Filter, Update, Delete                       |
| Collaborations | Create, Get All, Get One, Search, Update, Delete                               |
| Forums         | Create, Get All, Get One, Search, Update, Delete, Comments (CRUD), Like/Unlike |
| News           | Create, Get All, Get One, Search, Filter by Date, Update, Delete               |
| Products       | Create, Get All, Get One, Search, Filter by Category/Price, Update, Delete     |
| Users          | Create, Get All, Get One, Search, Filter by Faculty/Year, Update               |

## Thresholds

Default thresholds yang digunakan:

- 95% requests harus selesai dalam < 500ms
- Error rate harus < 1%

Kamu bisa mengubah thresholds di `config.js`.
