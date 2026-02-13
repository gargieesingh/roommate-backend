# 🏠 Roommate Finder - Backend API

A comprehensive, production-ready RESTful API for a roommate finder platform. Built with modern technologies to connect people looking for roommates or housing, featuring team formation, user discovery, real-time messaging, and robust safety features.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Complete API Reference](#-complete-api-reference)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Deployment](#-deployment)

---

## 🌟 Overview

This backend powers a complete roommate finder ecosystem where users can:
- **Find Roommates**: Search for compatible people to live with based on lifestyle preferences
- **Find Housing**: Browse and post room listings
- **Form Teams**: Create groups to rent entire properties together
- **Communicate**: Real-time messaging with context (listings, teams)
- **Build Trust**: Review system for user reputation
- **Stay Safe**: Comprehensive blocking and reporting features

---

## 🚀 Key Features

### 1. 🔐 Authentication & User Management

**Complete user lifecycle management with secure authentication**

- **Email/Password Authentication**
  - Secure signup with bcrypt password hashing (10 rounds)
  - JWT-based authentication with access + refresh token rotation
  - Automatic token expiration and renewal

- **Phone Verification**
  - SMS OTP verification via Twilio
  - Redis-backed OTP storage with TTL
  - Rate limiting on OTP requests

- **Rich User Profiles**
  - Personal info: Name, age, gender, city, bio
  - Lifestyle preferences:
    - Smoking preference (YES/NO/OCCASIONALLY)
    - Drinking preference (YES/NO/OCCASIONALLY/SOCIALLY)
    - Pets preference (HAS_PETS/NO_PETS/OPEN_TO_PETS)
    - Sleep schedule (EARLY_BIRD/NIGHT_OWL/FLEXIBLE)
    - Cleanliness level (VERY_CLEAN/MODERATELY_CLEAN/RELAXED)
  - Budget range (min/max)
  - Interests and languages (arrays)
  - Multiple photos (profile + up to 5 additional)

- **Profile Visibility**
  - Private profile (full access for authenticated user)
  - Public profile (limited info for discovery)

**Endpoints:**
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Authenticate user
- `POST /api/v1/auth/refresh-token` - Renew access token
- `POST /api/v1/auth/logout` - Invalidate session
- `POST /api/v1/auth/send-phone-otp` - Request phone verification
- `POST /api/v1/auth/verify-phone` - Confirm phone number
- `GET /api/v1/auth/profile` - Get own profile
- `PUT /api/v1/auth/profile` - Update profile
- `GET /api/v1/auth/profile/:userId` - View public profile

---

### 2. 👥 User Discovery System

**Find compatible roommates based on detailed preferences**

- **Advanced Search Filters**
  - Budget range matching
  - Age range filtering
  - Gender preference
  - Location (city-based)
  - Occupation matching
  - Lifestyle compatibility:
    - Cleanliness tolerance
    - Smoking/drinking preferences
    - Pet compatibility
    - Sleep schedule alignment

- **Smart Matching**
  - Only shows verified users
  - Includes average rating in results
  - Review count for credibility
  - Pagination support (20 per page)

- **Public Profiles**
  - View detailed user information
  - See recent reviews (latest 10)
  - Average rating calculation
  - Lifestyle compatibility indicators

**Endpoints:**
- `GET /api/v1/users` - Search users with filters
- `GET /api/v1/users/:id` - View user profile

**Example Search:**
```
GET /api/v1/users?city=Mumbai&budgetMin=15000&budgetMax=30000&ageMin=25&ageMax=35&cleanliness=VERY_CLEAN&petsPreference=NO_PETS
```

---

### 3. 🏘️ Listing Management

**Post and discover room listings**

- **Listing Types**
  - `HAVE_ROOM`: Advertising available space
  - `NEED_ROOM`: Looking for accommodation

- **Property Details**
  - Property type (APARTMENT/HOUSE/STUDIO/SHARED_ROOM/PRIVATE_ROOM)
  - Furnished status (FULLY/SEMI/UNFURNISHED)
  - Financial info (rent, deposit, currency)
  - Location (city, area, coordinates)
  - Amenities (WiFi, Parking, Gym, AC, etc.)
  - Multiple photos

- **Preferences & Requirements**
  - Gender preference (MALE/FEMALE/ANY)
  - Occupation preferences
  - Smoking/pets allowed flags
  - Availability dates

- **Search & Discovery**
  - Location-based search
  - Price range filtering
  - Amenity filtering
  - Property type filtering
  - View count tracking

**Endpoints:**
- `GET /api/v1/listings/search` - Search listings
- `GET /api/v1/listings/:id` - Get listing details
- `GET /api/v1/listings/user/:userId` - User's listings
- `POST /api/v1/listings` - Create listing (auth)
- `GET /api/v1/listings/my-listings` - My listings (auth)
- `PUT /api/v1/listings/:id` - Update listing (auth)
- `DELETE /api/v1/listings/:id` - Soft delete (auth)

---

### 4. 🤝 Team Ups System

**Form groups to rent entire properties together**

- **Team Management**
  - Create teams with name, description, budget
  - Set maximum member limit (2-10)
  - Leader-based permissions
  - Soft delete (isActive flag)

- **Member Management**
  - Join requests with PENDING status
  - Leader can ACCEPT/REJECT members
  - Members can leave teams
  - Leaders cannot leave (must delete team)
  - Automatic member limit enforcement

- **Team Discovery**
  - Search by city and budget range
  - Filter by active status
  - View team members and details
  - Pagination support

- **Roles & Permissions**
  - **LEADER**: Full control (update, delete, accept/reject)
  - **MEMBER**: Can leave, view team info

**Endpoints:**
- `GET /api/v1/teams` - Browse teams
- `POST /api/v1/teams` - Create team (auth)
- `GET /api/v1/teams/:id` - Team details
- `PUT /api/v1/teams/:id` - Update team (auth, leader only)
- `DELETE /api/v1/teams/:id` - Delete team (auth, leader only)
- `POST /api/v1/teams/:id/join` - Request to join (auth)
- `POST /api/v1/teams/:id/members/:userId/accept` - Accept member (auth, leader)
- `POST /api/v1/teams/:id/members/:userId/reject` - Reject member (auth, leader)
- `POST /api/v1/teams/:id/leave` - Leave team (auth)
- `GET /api/v1/teams/my-teams` - My teams (auth)

**Use Case Example:**
```
1. Alice creates a team "Looking for 3BR in Mumbai" (budget: ₹20k-30k)
2. Bob searches teams in Mumbai and finds Alice's team
3. Bob requests to join
4. Alice (leader) reviews Bob's profile and accepts him
5. They now have 2/4 members and can search for properties together
```

---

### 5. ⭐ Reviews & Ratings System

**Build trust through peer reviews**

- **Rating System**
  - 1-5 star ratings
  - Optional comment (max 500 chars)
  - One review per user pair
  - Self-review prevention

- **Reputation Building**
  - Automatic average rating calculation
  - Review count tracking
  - Reviews visible on public profiles
  - Latest 10 reviews displayed

- **Review Integrity**
  - Cannot review yourself
  - Cannot review same user twice
  - User must exist to be reviewed
  - Rating validation (1-5 only)

**Endpoints:**
- `POST /api/v1/users/:id/reviews` - Create review (auth)
- `GET /api/v1/users/:id/reviews` - Get user reviews

**Integration:**
- Reviews automatically included in user search results
- Average rating shown on public profiles
- Review count indicates credibility

---

### 6. 💬 Messaging System

**Real-time communication with context**

- **Conversation Management**
  - Direct messaging between users
  - Context-aware conversations:
    - Linked to specific listings
    - Linked to team discussions
  - Conversation list with latest message
  - Unread message tracking

- **Message Features**
  - Text messages (max 1000 chars)
  - Read receipts
  - Read timestamps
  - Message history with pagination
  - Unread count per conversation

- **Privacy**
  - Only conversation participants can access
  - Blocked users cannot message
  - Soft delete support

**Endpoints:**
- `POST /api/v1/messages/send` - Send message (auth)
- `GET /api/v1/messages/conversations` - List conversations (auth)
- `GET /api/v1/messages/conversation/:id` - Get messages (auth)
- `PUT /api/v1/messages/:id/read` - Mark message read (auth)
- `PUT /api/v1/messages/conversation/:id/read` - Mark all read (auth)
- `GET /api/v1/messages/unread-count` - Unread count (auth)

---

### 7. 🔔 Notifications System

**Stay informed of important events**

- **Notification Types**
  - `TEAM_INVITE` - Invited to join a team
  - `TEAM_JOIN_REQUEST` - Someone wants to join your team
  - `TEAM_MEMBER_ACCEPTED` - Your join request approved
  - `NEW_MESSAGE` - New message received
  - `LISTING_INQUIRY` - Someone inquired about your listing
  - `REVIEW_RECEIVED` - Someone reviewed you

- **Notification Management**
  - Read/unread tracking
  - Unread count endpoint
  - Mark individual as read
  - Mark all as read
  - Pagination support
  - Filter by read status

- **Notification Data**
  - Title and message
  - Related user/team/listing IDs
  - Timestamp
  - Read status

**Endpoints:**
- `GET /api/v1/notifications` - Get notifications (auth)
- `GET /api/v1/notifications/unread-count` - Unread count (auth)
- `PUT /api/v1/notifications/:id/read` - Mark as read (auth)
- `PUT /api/v1/notifications/read-all` - Mark all read (auth)

---

### 8. 📤 File Upload System

**Secure image upload for profiles and listings**

- **Upload Features**
  - Single file upload
  - Multiple file upload (max 5)
  - File validation:
    - Max size: 5MB
    - Allowed types: JPEG, PNG, WebP
  - Folder organization (profiles, listings, etc.)

- **Storage Integration**
  - Currently: Mock URLs for development
  - Ready for: Cloudinary or AWS S3
  - Commented integration code provided

- **Security**
  - Authentication required
  - File type validation
  - Size limit enforcement
  - Multer middleware for multipart handling

**Endpoints:**
- `POST /api/v1/upload` - Upload single image (auth)
- `POST /api/v1/upload/multiple` - Upload multiple (auth, max 5)

**Production Setup:**
```env
UPLOAD_PROVIDER=cloudinary  # or 's3'
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

### 9. 🛡️ Safety & Moderation

**Comprehensive user safety features**

- **User Blocking**
  - Block unwanted users
  - Prevents all interactions:
    - No messaging
    - Hidden from search
    - No team interactions
  - Unblock functionality
  - View blocked users list

- **Reporting System**
  - Report users or listings
  - Report reasons:
    - SPAM
    - INAPPROPRIATE_CONTENT
    - FAKE_LISTING
    - SCAM
    - HARASSMENT
    - OTHER
  - Report status tracking:
    - PENDING
    - REVIEWED
    - RESOLVED
    - DISMISSED
  - Optional description (500 chars)

- **Favorites/Wishlist**
  - Save listings for later
  - Quick access to saved listings
  - Remove from favorites

**Endpoints:**
- `POST /api/v1/safety/block` - Block user (auth)
- `DELETE /api/v1/safety/block/:userId` - Unblock (auth)
- `GET /api/v1/safety/blocked-users` - List blocked (auth)
- `POST /api/v1/safety/report` - Report user/listing (auth)
- `POST /api/v1/safety/favorites/add` - Add favorite (auth)
- `DELETE /api/v1/safety/favorites/:id` - Remove favorite (auth)
- `GET /api/v1/safety/favorites` - Get favorites (auth)

---

## 🛠️ Tech Stack

### Core Technologies
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.x
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 15+
- **Cache/Queue**: Redis 7+
- **ORM**: Prisma 6.x

### Libraries & Tools
- **Validation**: Zod 4.x - Type-safe schema validation
- **Authentication**: jsonwebtoken - JWT token generation
- **Password**: bcryptjs - Secure password hashing
- **File Upload**: multer - Multipart form data handling
- **SMS**: Twilio - Phone verification OTPs
- **Email**: SendGrid/Nodemailer - Email notifications
- **Logging**: Winston - Structured logging
- **Security**: 
  - Helmet - Security headers
  - CORS - Cross-origin resource sharing
  - express-rate-limit - Rate limiting

### Development Tools
- **TypeScript**: Static typing
- **Nodemon**: Auto-restart on changes
- **Prisma Studio**: Database GUI
- **ts-node**: TypeScript execution

---

## 🏗️ Architecture

### Project Structure
```
roommates-backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/                # Configuration files
│   │   ├── database.ts        # Prisma client
│   │   ├── env.ts             # Environment variables
│   │   ├── logger.ts          # Winston logger
│   │   └── redis.ts           # Redis client
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── listing.controller.ts
│   │   ├── message.controller.ts
│   │   ├── team.controller.ts
│   │   ├── user.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── upload.controller.ts
│   │   └── safety.controller.ts
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── listing.service.ts
│   │   ├── message.service.ts
│   │   ├── team.service.ts
│   │   ├── user.service.ts
│   │   ├── review.service.ts
│   │   ├── notification.service.ts
│   │   ├── upload.service.ts
│   │   ├── safety.service.ts
│   │   └── otp.service.ts
│   ├── validators/            # Zod schemas
│   │   ├── auth.validator.ts
│   │   ├── listing.validator.ts
│   │   ├── message.validator.ts
│   │   ├── team.validator.ts
│   │   ├── user.validator.ts
│   │   ├── notification.validator.ts
│   │   └── safety.validator.ts
│   ├── routes/                # API routes
│   │   ├── index.ts           # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── listing.routes.ts
│   │   ├── message.routes.ts
│   │   ├── team.routes.ts
│   │   ├── user.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── upload.routes.ts
│   │   └── safety.routes.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── error.middleware.ts     # Error handling
│   │   ├── validate.middleware.ts  # Zod validation
│   │   └── rateLimit.middleware.ts # Rate limiting
│   ├── utils/                 # Utility functions
│   │   ├── errors.ts          # Custom error classes
│   │   ├── hash.util.ts       # Password hashing
│   │   ├── jwt.util.ts        # JWT generation
│   │   ├── otp.util.ts        # OTP generation
│   │   └── sms.util.ts        # SMS sending
│   ├── types/                 # TypeScript types
│   │   └── express.d.ts       # Express extensions
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env                       # Environment variables
├── .env.example               # Environment template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

### Design Patterns

**Service Layer Pattern**
- Controllers handle HTTP requests/responses
- Services contain business logic
- Clear separation of concerns

**Repository Pattern**
- Prisma ORM abstracts database access
- Services interact with Prisma models
- Easy to mock for testing

**Middleware Chain**
- Authentication → Validation → Controller → Service
- Error handling at each layer
- Consistent error responses

---

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** v20 or higher
- **PostgreSQL** v15 or higher
- **Redis** v7 or higher
- **npm** or **yarn**

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd roommates-backend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Configure the following variables in `.env`:

**Required:**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/roommate_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secrets (generate random 32+ character strings)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
```

**Optional:**
```env
# Server
PORT=5000
NODE_ENV=development
API_VERSION=v1

# JWT Expiration
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Twilio (for phone verification)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid (for emails)
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# File Upload
UPLOAD_PROVIDER=local  # or 'cloudinary' or 's3'
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### 4. Database Setup

Run Prisma migrations to create all tables:
```bash
npx prisma migrate dev --name init
```

Generate Prisma client:
```bash
npx prisma generate
```

(Optional) Seed database with sample data:
```bash
npx prisma db seed
```

#### 5. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000` (or your configured PORT).

### Available Scripts

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)

# Production
npm run build            # Compile TypeScript to JavaScript
npm start                # Run compiled code

# Database
npm run prisma:migrate   # Run migrations
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open Prisma Studio GUI

# Testing
npm test                 # Run tests (when configured)
```

---

## 📚 Complete API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Authentication Endpoints

All authenticated endpoints require the `Authorization` header:
```
Authorization: Bearer <access_token>
```

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### Complete Endpoint List

| Module | Method | Endpoint | Auth | Description |
|--------|--------|----------|------|-------------|
| **Auth** | POST | `/auth/register` | ❌ | Register new user |
| | POST | `/auth/login` | ❌ | Login user |
| | POST | `/auth/refresh-token` | ❌ | Refresh access token |
| | POST | `/auth/logout` | ❌ | Logout user |
| | POST | `/auth/send-phone-otp` | ✅ | Send phone OTP |
| | POST | `/auth/verify-phone` | ✅ | Verify phone |
| | GET | `/auth/profile` | ✅ | Get own profile |
| | PUT | `/auth/profile` | ✅ | Update profile |
| | GET | `/auth/profile/:userId` | ❌ | Get public profile |
| **Users** | GET | `/users` | ❌ | Search users |
| | GET | `/users/:id` | ❌ | Get user profile |
| | POST | `/users/:id/reviews` | ✅ | Create review |
| | GET | `/users/:id/reviews` | ❌ | Get user reviews |
| **Listings** | GET | `/listings/search` | ❌ | Search listings |
| | GET | `/listings/:id` | ❌ | Get listing details |
| | GET | `/listings/user/:userId` | ❌ | Get user's listings |
| | POST | `/listings` | ✅ | Create listing |
| | GET | `/listings/my-listings` | ✅ | Get my listings |
| | PUT | `/listings/:id` | ✅ | Update listing |
| | DELETE | `/listings/:id` | ✅ | Delete listing |
| **Teams** | GET | `/teams` | ❌ | Browse teams |
| | POST | `/teams` | ✅ | Create team |
| | GET | `/teams/:id` | ❌ | Get team details |
| | PUT | `/teams/:id` | ✅ | Update team |
| | DELETE | `/teams/:id` | ✅ | Delete team |
| | POST | `/teams/:id/join` | ✅ | Join team |
| | POST | `/teams/:id/members/:userId/accept` | ✅ | Accept member |
| | POST | `/teams/:id/members/:userId/reject` | ✅ | Reject member |
| | POST | `/teams/:id/leave` | ✅ | Leave team |
| | GET | `/teams/my-teams` | ✅ | Get my teams |
| **Messages** | POST | `/messages/send` | ✅ | Send message |
| | GET | `/messages/conversations` | ✅ | List conversations |
| | GET | `/messages/conversation/:id` | ✅ | Get messages |
| | PUT | `/messages/:id/read` | ✅ | Mark message read |
| | PUT | `/messages/conversation/:id/read` | ✅ | Mark conversation read |
| | GET | `/messages/unread-count` | ✅ | Get unread count |
| **Notifications** | GET | `/notifications` | ✅ | Get notifications |
| | GET | `/notifications/unread-count` | ✅ | Get unread count |
| | PUT | `/notifications/:id/read` | ✅ | Mark as read |
| | PUT | `/notifications/read-all` | ✅ | Mark all read |
| **Upload** | POST | `/upload` | ✅ | Upload single image |
| | POST | `/upload/multiple` | ✅ | Upload multiple images |
| **Safety** | POST | `/safety/block` | ✅ | Block user |
| | DELETE | `/safety/block/:userId` | ✅ | Unblock user |
| | GET | `/safety/blocked-users` | ✅ | List blocked users |
| | POST | `/safety/report` | ✅ | Report user/listing |
| | POST | `/safety/favorites/add` | ✅ | Add favorite |
| | DELETE | `/safety/favorites/:id` | ✅ | Remove favorite |
| | GET | `/safety/favorites` | ✅ | Get favorites |

---

## 🗄️ Database Schema

### Core Models

**User** - User accounts and profiles
- Authentication: email, password, phone
- Profile: name, age, gender, bio, photos
- Preferences: lifestyle, budget, interests
- Relations: listings, teams, messages, reviews

**Listing** - Room advertisements
- Type: HAVE_ROOM or NEED_ROOM
- Property: type, furnished status, amenities
- Financial: rent, deposit
- Location: city, coordinates
- Preferences: gender, occupation, pets/smoking

**Team** - Group formation
- Info: name, description, budget, city
- Settings: max members, active status
- Relations: members, conversations

**TeamMember** - Team membership
- Role: LEADER or MEMBER
- Status: PENDING, ACCEPTED, REJECTED
- Relations: team, user

**Review** - User ratings
- Rating: 1-5 stars
- Comment: optional text
- Relations: reviewer, reviewed user

**Conversation** - Message threads
- Participants: user1, user2
- Context: optional listing or team
- Relations: messages

**Message** - Chat messages
- Content: text (max 1000 chars)
- Status: read/unread, timestamp
- Relations: conversation, sender

**Notification** - System notifications
- Type: enum (team events, messages, reviews)
- Content: title, message
- References: optional user/team/listing
- Status: read/unread

**Block** - User blocking
- Relations: blocker, blocked user

**Report** - Safety reports
- Target: user or listing
- Reason: enum (spam, harassment, etc.)
- Status: pending, reviewed, resolved

**Favorite** - Saved listings
- Relations: user, listing

### Database Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │───────│   Listing    │───────│  Favorite   │
└─────────────┘       └──────────────┘       └─────────────┘
      │                      │
      │                      │
      ├──────────────────────┼───────────┐
      │                      │           │
┌─────▼──────┐       ┌───────▼────┐  ┌──▼──────────┐
│TeamMember  │───────│    Team    │  │Conversation │
└────────────┘       └────────────┘  └─────────────┘
                                            │
┌─────────────┐                      ┌──────▼──────┐
│   Review    │                      │   Message   │
└─────────────┘                      └─────────────┘

┌──────────────┐      ┌──────────────┐
│Notification  │      │    Block     │
└──────────────┘      └──────────────┘

┌──────────────┐
│    Report    │
└──────────────┘
```

---

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: Access (short-lived) + Refresh (long-lived)
- **Password Security**: bcrypt hashing with 10 rounds
- **Token Rotation**: Refresh tokens are rotatable
- **Protected Routes**: Middleware-based authentication

### Input Validation
- **Zod Schemas**: Type-safe validation on all inputs
- **SQL Injection**: Prevented by Prisma ORM
- **XSS Protection**: Input sanitization

### Rate Limiting
- **Auth Endpoints**: 5 requests per 15 minutes
- **OTP Endpoints**: 3 requests per 15 minutes
- **General API**: 100 requests per 15 minutes

### Security Headers
- **Helmet**: Sets secure HTTP headers
- **CORS**: Configured for specific origins
- **Content Security Policy**: Prevents XSS attacks

### Data Privacy
- **Password Hashing**: Never store plain passwords
- **Sensitive Data**: Excluded from public profiles
- **Soft Deletes**: Data retention for compliance

---

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
```env
NODE_ENV=production
DATABASE_URL=<production_postgres_url>
REDIS_URL=<production_redis_url>
JWT_SECRET=<strong_secret>
JWT_REFRESH_SECRET=<strong_secret>
CORS_ORIGIN=https://yourdomain.com
```

2. **Build Application**
```bash
npm run build
```

3. **Run Migrations**
```bash
npx prisma migrate deploy
```

4. **Start Server**
```bash
npm start
```

### Deployment Platforms

**Recommended:**
- **Railway**: Easy PostgreSQL + Redis + Node.js
- **Render**: Free tier available
- **Heroku**: Classic PaaS
- **AWS**: EC2 + RDS + ElastiCache
- **DigitalOcean**: App Platform

### Health Check

```http
GET /health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2026-02-13T14:30:00.000Z",
  "environment": "production"
}
```

---

## 📊 Performance

- **Database Indexing**: Optimized queries on frequently searched fields
- **Redis Caching**: OTPs, rate limiting, session data
- **Pagination**: All list endpoints support pagination
- **Connection Pooling**: Prisma connection management

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

---

## 📖 Additional Documentation

- **NEW_FEATURES.md** - Detailed guide for newly added features
- **Prisma Schema** - `prisma/schema.prisma` for database structure
- **API Examples** - Postman collection (coming soon)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review the codebase comments

---

**Built with ❤️ for finding the perfect roommate**
