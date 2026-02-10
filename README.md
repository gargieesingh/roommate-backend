# Roommate Backend — Authentication System

A production-ready authentication API built with Node.js, TypeScript, Express, PostgreSQL, and Redis.

## Features

- **User Registration** — Email/password signup with JWT tokens
- **User Login** — Authentication with access + refresh tokens
- **Phone Verification** — OTP via Twilio SMS, stored in Redis
- **Profile Management** — Get and update user profile
- **Token Refresh** — Exchange refresh tokens for new access tokens
- **Rate Limiting** — Configurable per-endpoint limits
- **Input Validation** — Zod schemas on all endpoints
- **Security** — Helmet, CORS, bcrypt password hashing

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** 15+
- **Redis** 7+
- **Twilio account** (optional — falls back to console logging in dev)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your PostgreSQL credentials.

### 3. Setup database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run development server

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

## API Endpoints

All endpoints are under `/api/v1/auth`.

| Method | Endpoint              | Auth     | Description              |
| ------ | --------------------- | -------- | ------------------------ |
| POST   | `/register`           | No       | Create a new account     |
| POST   | `/login`              | No       | Login with credentials   |
| POST   | `/refresh-token`      | No       | Get new access token     |
| POST   | `/logout`             | No       | Invalidate refresh token |
| POST   | `/send-phone-otp`     | Bearer   | Send OTP to phone        |
| POST   | `/verify-phone`       | Bearer   | Verify phone with OTP    |
| GET    | `/profile`            | Bearer   | Get current user profile |
| PUT    | `/profile`            | Bearer   | Update profile fields    |

### Request/Response Examples

**Register:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Test1234","firstName":"John"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Test1234"}'
```

**Get Profile (protected):**
```bash
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

## Environment Variables

| Variable                | Description                          | Required |
| ----------------------- | ------------------------------------ | -------- |
| `DATABASE_URL`          | PostgreSQL connection string         | Yes      |
| `REDIS_URL`             | Redis connection string              | Yes      |
| `JWT_SECRET`            | Access token signing key (32+ chars) | Yes      |
| `JWT_REFRESH_SECRET`    | Refresh token signing key (32+ chars)| Yes      |
| `JWT_EXPIRES_IN`        | Access token lifetime (e.g. `7d`)    | No       |
| `JWT_REFRESH_EXPIRES_IN`| Refresh token lifetime (e.g. `30d`)  | No       |
| `TWILIO_ACCOUNT_SID`    | Twilio account SID                   | No       |
| `TWILIO_AUTH_TOKEN`      | Twilio auth token                    | No       |
| `TWILIO_PHONE_NUMBER`   | Twilio sender phone number           | No       |
| `CORS_ORIGIN`           | Allowed CORS origin                  | No       |
| `PORT`                  | Server port (default: 3000)          | No       |

## Scripts

| Script              | Command                            |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start dev server with hot reload   |
| `npm run build`     | Compile TypeScript to `dist/`      |
| `npm start`         | Run compiled production build      |
| `npm run prisma:migrate` | Run database migrations       |
| `npm run prisma:generate`| Generate Prisma client         |
| `npm run prisma:studio`  | Open Prisma database GUI       |

## Project Structure

```
src/
├── config/          # Database, Redis, Logger, Environment
├── types/           # TypeScript type extensions
├── utils/           # JWT, hashing, OTP, SMS helpers
├── validators/      # Zod request validation schemas
├── middleware/       # Auth, validation, rate limiting, errors
├── services/        # Business logic (auth, OTP)
├── controllers/     # Request handlers
├── routes/          # Express route definitions
├── app.ts           # Express app setup
└── server.ts        # Entry point
```
