# Roommate Backend API

A production-ready RESTful API for a roommate finder application, built with Node.js, TypeScript, Express, PostgreSQL, and Redis. Features comprehensive authentication, real-time messaging, listing management, and user safety tools.

## 🚀 Features

### 🔐 Authentication & User Management
- **Secure Signup/Login**: Email & password authentication with bcrypt hashing.
- **JWT Architecture**: Access tokens (short-lived) + Refresh tokens (long-lived, rotatable).
- **Phone Verification**: OTP-based phone number verification via Twilio.
- **Rich Profiles**: Manage user profiles with lifestyle preferences (smoking, pets, sleep schedule), interests, and languages.
- **Role-based Access**: Public vs. Protected routes.

### 🏠 Listing Management
- **CRUD Operations**: Create, read, update, and delete property listings.
- **Advanced Search**: Filter listings by location, price range, amenities, and more.
- **Media Support**: Handle multiple photos per listing.
- **User Listings**: Manage your own listings and view others'.

### 💬 Real-time Messaging
- **Direct Messaging**: secure, real-time chat between users.
- **Conversation Management**: List conversations, track unread counts.
- **Read Receipts**: Mark messages and entire conversations as read.

### 🛡️ Safety & Moderation
- **User Blocking**: Block unwanted users to prevent interaction.
- **Reporting System**: Report users or listings for moderation (Spam, Harassment, etc.).
- **Favorites/Wishlist**: Save listings for later.

## 🛠️ Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: PostgreSQL 15+ (Main data), Redis 7+ (Caching, OTPs, Rate limiting)
- **ORM**: Prisma
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting, BCrypt
- **Logging**: Winston
- **Testing**: Jest (Configured)

## 📋 Prerequisites

- **Node.js** v20 or higher
- **PostgreSQL** v15 or higher
- **Redis** v7 or higher
- **npm** or **yarn**

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd roommates-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

**Required Variables:**
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (postgresql://user:pass@host:5432/db) |
| `REDIS_URL` | Redis connection string (redis://localhost:6379) |
| `JWT_SECRET` | 32+ char secret for signing access tokens |
| `JWT_REFRESH_SECRET` | 32+ char secret for signing refresh tokens |

**Optional Variables:**
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `API_VERSION` | API version prefix | `v1` |
| `JWT_EXPIRES_IN` | Access token lifetime | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `30d` |
| `TWILIO_*` | Twilio credentials for SMS OTPs | - |

### 4. Setup Database
Run Prisma migrations to create tables:
```bash
npx prisma migrate dev --name init
```

### 5. Run Development Server
```bash
npm run dev
```
Server will start at `http://localhost:3000`.

## 📚 API Documentation

All routes are prefixed with `/api/v1`.

### Authentication (`/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register a new user | ❌ |
| POST | `/login` | Login with email/password | ❌ |
| POST | `/refresh-token` | specific refresh token to get new access token | ❌ |
| POST | `/logout` | Invalidate refresh token | ❌ |
| POST | `/send-phone-otp` | Send SMS OTP | ✅ |
| POST | `/verify-phone` | Verify phone with OTP | ✅ |
| GET | `/profile` | Get current user profile | ✅ |
| PUT | `/profile` | Update profile & preferences | ✅ |
| GET | `/profile/:userId` | Get public profile of another user | ❌ |

### Listings (`/listings`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/search` | Search listings with filters | ❌ |
| GET | `/:id` | Get detailed listing view | ❌ |
| GET | `/user/:userId` | Get listings by specific user | ❌ |
| POST | `/` | Create a new listing | ✅ |
| GET | `/my-listings` | Get current user's listings | ✅ |
| PUT | `/:id` | Update a listing | ✅ |
| DELETE | `/:id` | Delete a listing (soft delete) | ✅ |

### Messaging (`/messages`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/send` | Send a text message | ✅ |
| GET | `/conversations` | Get list of user conversations | ✅ |
| GET | `/conversation/:id` | Get messages in a conversation | ✅ |
| PUT | `/:id/read` | Mark single message as read | ✅ |
| PUT | `/conversation/:id/read` | Mark all messages in conversation as read | ✅ |
| GET | `/unread-count` | Get total count of unread messages | ✅ |

### Safety & Favorites (`/safety`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/block` | Block a user | ✅ |
| DELETE | `/block/:userId` | Unblock a user | ✅ |
| GET | `/blocked-users` | List blocked users | ✅ |
| POST | `/report` | Report a user or listing | ✅ |
| POST | `/favorites/add` | Add listing to favorites | ✅ |
| DELETE | `/favorites/:id` | Remove listing from favorites | ✅ |
| GET | `/favorites` | Get user's favorites | ✅ |

## 🧪 Running Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security
- **Rate Limiting**: Defends against brute-force and DDoS attacks.
- **Helmet**: Sets secure HTTP headers.
- **Zod Validation**: Ensures all incoming data matches expected schemas.
- **Password Hashing**: Uses bcryptjs for secure password storage.

## 🤝 Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
