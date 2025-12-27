# Docker Setup for VPS Hosting

## Quick Start

### 1. Build and Run

```bash
# Build and start all services
docker-compose up -d --build

# Run migrations and seed database
docker-compose run --rm migrate
```

### 2. Verify

```bash
# Check logs
docker-compose logs -f app

# Test API
curl http://localhost:3000/api/health
```

### 3. Stop

```bash
docker-compose down
```

## Environment Variables

Set these in `docker-compose.yml` or create `.env`:

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET`   | Secret for JWT tokens        |
| `NODE_ENV`     | `production`                 |

## K6 Load Testing

Update K6 config to point to VPS:

```javascript
// k6/config.js
export const BASE_URL = "http://YOUR_VPS_IP:3000/api";
```

Run tests:

```bash
k6 run k6/all.test.js
```

## Commands

| Command                           | Description             |
| --------------------------------- | ----------------------- |
| `docker-compose up -d --build`    | Build and start         |
| `docker-compose run --rm migrate` | Run migrations          |
| `docker-compose logs -f app`      | View logs               |
| `docker-compose down`             | Stop all                |
| `docker-compose down -v`          | Stop and remove volumes |
