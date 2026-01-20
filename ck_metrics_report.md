# Laporan Perhitungan CK-Metrics

## Proyek Next.js KAUJE Digital - 8 Fitur Utama

---

## Tabel Ringkasan CK-Metrics

| No  | Fitur             | WMC  | RFC  | LCOM | CBO | DIT | NOC |
| --- | ----------------- | ---- | ---- | ---- | --- | --- | --- |
| 1   | **Register**      | 8    | 12   | 0    | 5   | 0   | 0   |
| 2   | **Login**         | 5    | 10   | 0    | 5   | 0   | 0   |
| 3   | **Collaboration** | 12   | 13   | 0    | 4   | 0   | 0   |
| 4   | **Forum**         | 28   | 32   | 0    | 4   | 0   | 0   |
| 5   | **Job**           | 12   | 13   | 0    | 4   | 0   | 0   |
| 6   | **News**          | 15   | 14   | 0    | 4   | 0   | 0   |
| 7   | **Product**       | 13   | 14   | 0    | 4   | 0   | 0   |
| 8   | **User**          | 16   | 15   | 0    | 5   | 0   | 0   |
|     | **Total**         | 109  | 123  | 0    | 35  | 0   | 0   |
|     | **Rata-rata**     | 13.6 | 15.4 | 0    | 4.4 | 0   | 0   |

---

## Detail Perhitungan Per Fitur

### 1. Register Feature

**File yang Dianalisis:**

- `services/auth.service.ts` → metode `register()`
- `validators/auth.schema.ts` → `registerSchema`
- `app/api/auth/register/route.ts`

#### WMC = 8

| Komponen      | Metode/Fungsi | CC  |
| ------------- | ------------- | --- |
| AuthService   | `register()`  | 5   |
| Route Handler | `POST()`      | 3   |

**Detail Cyclomatic Complexity:**

- `register()`: 5 (5 if statements untuk validasi email, nim, phone, city, role)
- `POST()`: 3 (if contentType, if ZodError, if already registered)

#### RFC = 12

| Tipe         | Metode                                                                      |
| ------------ | --------------------------------------------------------------------------- |
| Metode Lokal | `register`, `POST` (2)                                                      |
| Prisma       | `user.findFirst`, `user.create`, `city.findUnique`, `role.findUnique` (4)   |
| Auth Utils   | `hashPassword` (1)                                                          |
| Framework    | `NextResponse.json`, `req.json`, `req.formData`, `registerSchema.parse` (4) |
| Error        | `ZodError` (1)                                                              |

#### LCOM = 0, CBO = 5, DIT = 0, NOC = 0

**CBO Dependencies:** `@/lib/prisma`, `@/lib/auth`, `@/validators/auth.schema`, `zod`, `next/server`

---

### 2. Login Feature

**File yang Dianalisis:**

- `services/auth.service.ts` → metode `login()`
- `validators/auth.schema.ts` → `loginSchema`
- `app/api/auth/login/route.ts`

#### WMC = 5

| Komponen      | Metode/Fungsi | CC  |
| ------------- | ------------- | --- |
| AuthService   | `login()`     | 3   |
| Route Handler | `POST()`      | 2   |

**Detail Cyclomatic Complexity:**

- `login()`: 3 (if !user, if !isPasswordValid, await chain)
- `POST()`: 2 (if contentType, if ZodError)

#### RFC = 10

| Tipe         | Metode                                                       |
| ------------ | ------------------------------------------------------------ |
| Metode Lokal | `login`, `POST` (2)                                          |
| Prisma       | `user.findUnique`, `user.update` (2)                         |
| Auth Utils   | `comparePassword`, `signAccessToken`, `signRefreshToken` (3) |
| Framework    | `NextResponse.json`, `loginSchema.parse` (2)                 |
| Error        | `ZodError` (1)                                               |

#### LCOM = 0, CBO = 5, DIT = 0, NOC = 0

**CBO Dependencies:** `@/lib/prisma`, `@/lib/auth`, `@/validators/auth.schema`, `zod`, `next/server`

---

### 3. Collaboration Feature

**File yang Dianalisis:**

- `services/collaboration.service.ts`
- `validators/collaboration.schema.ts`
- `app/api/collaborations/route.ts`, `[id]/route.ts`

#### WMC = 12

| Komponen             | Metode      | CC  |
| -------------------- | ----------- | --- |
| CollaborationService | `getAll()`  | 4   |
| CollaborationService | `getById()` | 2   |
| CollaborationService | `create()`  | 2   |
| CollaborationService | `update()`  | 2   |
| CollaborationService | `delete()`  | 2   |

**Detail Cyclomatic Complexity:**

- `getAll()`: 4 (if q, if collaborationFieldId, if postedById, whereClause building)
- `getById()`: 2 (if !collaboration, return transformation)
- `create()`: 2 (if data.imageUrl, if data.collaborationFieldId)
- `update()`: 2 (if !collaboration, if role !== "Admin")
- `delete()`: 2 (if !collaboration, if role !== "Admin")

#### RFC = 13

| Tipe         | Metode                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Metode Lokal | `getAll`, `getById`, `create`, `update`, `delete` (5)                                                                                                                  |
| Prisma       | `collaboration.findMany`, `collaboration.findUnique`, `collaboration.create`, `collaboration.update`, `collaboration.delete`, `collaboration.count`, `Promise.all` (7) |
| Schema       | `getCollaborationQuerySchema.parse` (1)                                                                                                                                |

#### LCOM = 0, CBO = 4, DIT = 0, NOC = 0

**CBO Dependencies:** `@/lib/prisma`, `@/validators/collaboration.schema`, `zod`, `@/lib/auth`

---

### 4. Forum Feature

**File yang Dianalisis:**

- `services/forum.service.ts`
- `validators/forum.schema.ts`
- `app/api/forums/route.ts`, `[id]/route.ts`, `comments/route.ts`, `likes/route.ts`

#### WMC = 28 (Tertinggi)

| Komponen     | Metode            | CC  |
| ------------ | ----------------- | --- |
| ForumService | `getAll()`        | 3   |
| ForumService | `getById()`       | 3   |
| ForumService | `create()`        | 2   |
| ForumService | `update()`        | 5   |
| ForumService | `delete()`        | 3   |
| ForumService | `getComments()`   | 1   |
| ForumService | `createComment()` | 2   |
| ForumService | `updateComment()` | 3   |
| ForumService | `deleteComment()` | 3   |
| ForumService | `toggleLike()`    | 2   |
| ForumService | `getLikes()`      | 1   |

**Detail Cyclomatic Complexity:**

- `getAll()`: 3 (if q, if postedById, whereClause building)
- `getById()`: 3 (if !forum, if userId, isLiked check)
- `create()`: 2 (if data.imageUrl, prisma.create)
- `update()`: 5 (if !forum, if role !== "Admin", if data.title, if data.content, if data.imageUrl)
- `delete()`: 3 (if !forum, if role !== "Admin", prisma.delete)
- `getComments()`: 1 (simple query)
- `createComment()`: 2 (if !forum, prisma.create)
- `updateComment()`: 3 (if !comment, if role !== "Admin", prisma.update)
- `deleteComment()`: 3 (if !comment, if role !== "Admin", prisma.delete)
- `toggleLike()`: 2 (if !forum, if existingLike)
- `getLikes()`: 1 (simple query)

#### RFC = 32 (Tertinggi)

| Tipe           | Metode                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Metode Lokal   | `getAll`, `getById`, `create`, `update`, `delete`, `getComments`, `createComment`, `updateComment`, `deleteComment`, `toggleLike`, `getLikes` (11) |
| Prisma Forum   | `forum.findMany`, `forum.findUnique`, `forum.create`, `forum.update`, `forum.delete`, `forum.count` (6)                                            |
| Prisma Comment | `forumComment.findMany`, `forumComment.findUnique`, `forumComment.create`, `forumComment.update`, `forumComment.delete`, `forumComment.count` (6)  |
| Prisma Like    | `forumLike.findMany`, `forumLike.findUnique`, `forumLike.create`, `forumLike.delete` (4)                                                           |
| Utility        | `Promise.all` (1)                                                                                                                                  |
| Schema         | `getForumQuerySchema.parse`, `createForumSchema.parse`, `createCommentSchema.parse`, `getCommentsQuerySchema.parse` (4)                            |

#### LCOM = 0, CBO = 4, DIT = 0, NOC = 0

**CBO Dependencies:** `@/lib/prisma`, `@/validators/forum.schema`, `zod`, `@/lib/auth`

---

### 5. Job Feature

**File yang Dianalisis:**

- `services/job.service.ts`
- `validators/job.schema.ts`
- `app/api/jobs/route.ts`, `[id]/route.ts`

#### WMC = 12

| Komponen   | Metode      | CC  |
| ---------- | ----------- | --- |
| JobService | `getAll()`  | 6   |
| JobService | `getById()` | 2   |
| JobService | `create()`  | 1   |
| JobService | `update()`  | 1   |
| JobService | `delete()`  | 2   |

**Detail Cyclomatic Complexity:**

- `getAll()`: 6 (if q, if jobType, if provinceId, if cityId, if jobFieldId, if company)
- `getById()`: 2 (if !job, return transformation)
- `create()`: 1 (simple prisma.create)
- `update()`: 1 (if !job, if role !== "Admin" combined)
- `delete()`: 2 (if !job, if role !== "Admin")

#### RFC = 13

| Tipe         | Metode                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Metode Lokal | `getAll`, `getById`, `create`, `update`, `delete` (5)                                                      |
| Prisma       | `job.findMany`, `job.findUnique`, `job.create`, `job.update`, `job.delete`, `job.count`, `Promise.all` (7) |
| Schema       | `getJobQuerySchema.parse` (1)                                                                              |

#### LCOM = 0, CBO = 4, DIT = 0, NOC = 0

**CBO Dependencies:** `@/lib/prisma`, `@/validators/job.schema`, `zod`, `@/lib/auth`

---

### 6. News Feature

**File yang Dianalisis:**

- `services/news.service.ts`
- `validators/news.schema.ts`
- `app/api/news/route.ts`, `[id]/route.ts`

#### WMC = 15

| Komponen    | Metode      | CC  |
| ----------- | ----------- | --- |
| NewsService | `getAll()`  | 4   |
| NewsService | `getById()` | 2   |
| NewsService | `create()`  | 3   |
| NewsService | `update()`  | 3   |
| NewsService | `delete()`  | 3   |

**Detail Cyclomatic Complexity:**

- `getAll()`: 4 (if q, if startDate, if endDate, whereClause building)
- `getById()`: 2 (if !news, return)
- `create()`: 3 (if role !== "Admin", if data.imageUrl, prisma.create)
- `update()`: 3 (if role !== "Admin", if !news, data field updates)
- `delete()`: 3 (if role !== "Admin", if !news, prisma.delete)

#### RFC = 14

| Tipe         | Metode                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| Metode Lokal | `getAll`, `getById`, `create`, `update`, `delete` (5)                                                            |
| Prisma       | `news.findMany`, `news.findUnique`, `news.create`, `news.update`, `news.delete`, `news.count`, `Promise.all` (7) |
| Schema       | `getNewsQuerySchema.parse`, `createNewsSchema.parse` (2)                                                         |

#### LCOM = 0, CBO = 4, DIT = 0, NOC = 0

**CBO Dependencies:** `@/lib/prisma`, `@/validators/news.schema`, `zod`, `@/lib/auth`

---

### 7. Product Feature

**File yang Dianalisis:**

- `services/product.service.ts`
- `validators/product.schema.ts`
- `app/api/products/route.ts`, `[id]/route.ts`

#### WMC = 13

| Komponen       | Metode      | CC  |
| -------------- | ----------- | --- |
| ProductService | `getAll()`  | 5   |
| ProductService | `getById()` | 2   |
| ProductService | `create()`  | 2   |
| ProductService | `update()`  | 2   |
| ProductService | `delete()`  | 2   |

**Detail Cyclomatic Complexity:**

- `getAll()`: 5 (if q, if category, if postedById, if minPrice, if maxPrice)
- `getById()`: 2 (if !product, return)
- `create()`: 2 (if data.imageUrl, prisma.create)
- `update()`: 2 (if !product, if role !== "Admin")
- `delete()`: 2 (if !product, if role !== "Admin")

#### RFC = 14

| Tipe         | Metode                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Metode Lokal | `getAll`, `getById`, `create`, `update`, `delete` (5)                                                                              |
| Prisma       | `product.findMany`, `product.findUnique`, `product.create`, `product.update`, `product.delete`, `product.count`, `Promise.all` (7) |
| Schema       | `getProductQuerySchema.parse`, `createProductSchema.parse` (2)                                                                     |

#### LCOM = 0, CBO = 4, DIT = 0, NOC = 0

**CBO Dependencies:** `@/lib/prisma`, `@/validators/product.schema`, `zod`, `@/lib/auth`

---

### 8. User Feature

**File yang Dianalisis:**

- `services/user.service.ts`
- `validators/user.schema.ts`
- `app/api/users/route.ts`, `[id]/route.ts`

#### WMC = 16

| Komponen    | Metode      | CC  |
| ----------- | ----------- | --- |
| UserService | `getAll()`  | 7   |
| UserService | `getById()` | 2   |
| UserService | `create()`  | 5   |
| UserService | `update()`  | 0   |
| UserService | `delete()`  | 2   |

**Detail Cyclomatic Complexity:**

- `getAll()`: 7 (if q, if facultyId, if majorId, if provinceId, if cityId, if enrollmentYear, if graduationYear)
- `getById()`: 2 (if !user, return safeUser)
- `create()`: 5 (if existingUser, if email match, if nim match, if phoneNumber match, if !finalRoleId)
- `update()`: 0 (simple update with optional fields)
- `delete()`: 2 (if !user, prisma.delete)

#### RFC = 15

| Tipe         | Metode                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Metode Lokal | `getAll`, `getById`, `create`, `update`, `delete` (5)                                                                                  |
| Prisma       | `user.findMany`, `user.findUnique`, `user.findFirst`, `user.create`, `user.update`, `user.delete`, `user.count`, `role.findUnique` (8) |
| Auth Utils   | `hashPassword` (1)                                                                                                                     |
| Schema       | `createUserSchema.parse` (1)                                                                                                           |

#### LCOM = 0, CBO = 5, DIT = 0, NOC = 0

**CBO Dependencies:** `@/lib/prisma`, `@/lib/auth`, `@/validators/user.schema`, `zod`, `next/server`

---

## Interpretasi & Kesimpulan

### Nilai Keseluruhan

| Metrik | Total | Rata-rata | Threshold | Status      |
| ------ | ----- | --------- | --------- | ----------- |
| WMC    | 109   | 13.6      | < 20      | ✅ Baik     |
| RFC    | 123   | 15.4      | < 50      | ✅ Baik     |
| LCOM   | 0     | 0         | 0         | ✅ Sempurna |
| CBO    | 35    | 4.4       | < 10      | ✅ Baik     |
| DIT    | 0     | 0         | 0-3       | ✅ Baik     |
| NOC    | 0     | 0         | 0-5       | ✅ Baik     |

### Kesimpulan

1. **LCOM = 0** di semua fitur → Kohesi tinggi (sangat baik)
2. **DIT = 0** dan **NOC = 0** → Tidak ada hierarki inheritance kompleks
3. **CBO rendah (4-5)** → Coupling terkontrol
4. **Forum** memiliki kompleksitas tertinggi → Rekomendasi: refactoring

---

## Metodologi

- **WMC**: Σ Cyclomatic Complexity setiap metode
- **RFC**: |M ∪ Rᵢ| (metode lokal + metode eksternal yang dipanggil)
- **LCOM**: max(0, P - Q) dimana P=pasangan tanpa atribut bersama, Q=dengan atribut bersama
- **CBO**: Jumlah kelas/modul yang di-import
- **DIT**: Kedalaman inheritance tree
- **NOC**: Jumlah direct subclass

---

_Dokumen dibuat: 18 Januari 2026 | Versi: 4.0_
