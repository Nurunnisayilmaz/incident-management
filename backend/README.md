# Incident Management Backend

Backend API for the Incident Management System. It provides authentication, incident CRUD operations, incident audit logs, Swagger documentation, rate limiting, persistence, caching, pagination, index optimization, unit tests, dockerized environment, logging system and real-time Socket.IO support.

## Project Setup

### Prerequisites

- Docker and Docker Compose

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start PostgreSQL and Redis

```bash
docker compose up -d
```

The included `docker-compose.yml` starts:

- PostgreSQL `15` on `localhost:5432`
- Redis `7` on `localhost:6379`

Default database values from Docker Compose:

```text
Database: incident_db
Username: postgres
Password: postgres
```

### 3. Configure Environment Variables

Create a local environment file:

```bash
cp .env.example .env
```

For local development, use values like:

```env
PORT=3000
NODE_ENV=local
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Run the Backend

```bash
npm run dev
```

The API runs at:

```text
http://localhost:3000
```

Swagger documentation is available at:

```text
http://localhost:3000/docs
```

### 5. Run Tests

```bash
npm test
```

## Technologies Used

- Node.js
- TypeScript
- Express 5
- TypeORM
- PostgreSQL
- Redis
- ioredis
- Socket.IO
- JSON Web Tokens
- bcrypt
- cookie-parser
- cors
- express-rate-limit
- class-validator and class-transformer
- Swagger / OpenAPI
- Jest and ts-jest
- log4js
- Docker Compose

## Architecture

The backend follows a modular layered architecture. Each domain contains its own routes, controllers, services, models, DTOs, middleware, and tests where applicable.

```text
backend/
  src/
    index.ts                 Application bootstrap
    config/                  Environment configuration
    auth/                    Authentication domain
    incident/                Incident management domain
    utils/                   Shared infrastructure utilities
  docker-compose.yml         PostgreSQL and Redis services
  jest.config.ts             Jest test configuration
  tsconfig.json              TypeScript configuration
```

### Application Bootstrap

`src/index.ts` creates the Express app, attaches middleware, initializes Socket.IO, registers routes, serves Swagger docs, connects to the database, and starts the HTTP server.

Core middleware and infrastructure:

- `express.json()` and `express.urlencoded()` for request parsing
- `cookie-parser` for cookie handling
- `cors` configured for the Vite frontend at `http://localhost:5173`
- Optional rate limiting from `src/utils/rateLimiter.ts`
- Route logging through `log4js`
- Socket.IO initialization through `src/utils/socket.ts`

### Main Domains

#### Authentication

Located in `src/auth`.

Responsibilities:

- User registration
- Login and logout
- Access token refresh
- Current user lookup
- JWT authentication middleware
- Password hashing
- Auth session persistence

Primary routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

#### Incidents

Located in `src/incident`.

Responsibilities:

- Create incidents
- List incidents
- Get incident details
- Update incidents
- Soft-delete incidents
- Track and read incident audit logs
- Validate incident input DTOs

Primary routes:

- `POST /incidents`
- `GET /incidents`
- `GET /incidents/:id`
- `PATCH /incidents/:id`
- `DELETE /incidents/:id`
- `GET /incident-audit-logs/:incidentId`

### Data Layer

TypeORM entities are used for persistence:

- `auth/models/user.entity.ts`
- `auth/models/auth.session.entity.ts`
- `incident/models/incident.entity.ts`
- `incident/models/incident-audit-log.entity.ts`

Database connection setup lives in `src/utils/database.ts`, with environment values loaded from `src/config/envvars.ts`.

### Shared Utilities

The `src/utils` directory contains reusable backend infrastructure:

- Auth helpers for JWTs, cookies, and passwords
- Response helpers and API response wrappers
- Pagination helpers
- Redis cache helpers
- Logging
- Rate limiting
- Swagger setup
- Socket.IO setup
