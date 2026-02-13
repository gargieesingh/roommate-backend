# Backend Implementation - New Features Added

## 🎉 What's New

This backend now includes all features from the Master Implementation Spec:

### ✅ Completed Features

1. **Team Ups System** - Group formation for renting together
   - Create/update/delete teams
   - Join teams, accept/reject members
   - Team search and discovery
   
2. **User Discovery** - Search for roommates independent of listings
   - Advanced filters (budget, age, gender, lifestyle)
   - Public profile viewing with ratings
   
3. **Reviews & Ratings** - User reputation system
   - Rate users 1-5 stars with comments
   - Average rating calculation
   - Review history
   
4. **Notifications** - System notifications for events
   - Team invites and join requests
   - New messages
   - Review notifications
   - Read/unread tracking
   
5. **File Upload** - Secure image upload
   - Single and multiple file upload
   - Ready for Cloudinary/S3 integration
   - File validation (type, size)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (for OTP and rate limiting)

### Installation Steps

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Database Migration

**IMPORTANT:** You must run the Prisma migration to create the new database tables.

```bash
# Create and apply migration
npx prisma migrate dev --name add_teams_reviews_notifications

# Generate Prisma client
npx prisma generate
```

This will create the following new tables:
- `teams`
- `team_members`
- `reviews`
- `notifications`

And update:
- `conversations` (added optional `team_id` field)

#### 3. Environment Variables

Add these optional variables to your `.env` file:

```env
# File Upload Configuration
UPLOAD_PROVIDER=local  # Options: 'local', 'cloudinary', 's3'
UPLOAD_MAX_SIZE=5242880  # 5MB in bytes

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

#### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

---

## 📡 New API Endpoints

### Team Ups

```
GET    /api/v1/teams                          - Browse teams
POST   /api/v1/teams                          - Create team (auth)
GET    /api/v1/teams/:id                      - Get team details
PUT    /api/v1/teams/:id                      - Update team (auth, leader only)
DELETE /api/v1/teams/:id                      - Delete team (auth, leader only)
POST   /api/v1/teams/:id/join                 - Request to join (auth)
POST   /api/v1/teams/:id/members/:userId/accept - Accept member (auth, leader)
POST   /api/v1/teams/:id/members/:userId/reject - Reject member (auth, leader)
POST   /api/v1/teams/:id/leave                - Leave team (auth)
GET    /api/v1/teams/my-teams                 - Get my teams (auth)
```

### User Discovery

```
GET    /api/v1/users                          - Search users
GET    /api/v1/users/:id                      - Get public profile
```

### Reviews

```
POST   /api/v1/users/:id/reviews              - Create review (auth)
GET    /api/v1/users/:id/reviews              - Get user reviews
```

### Notifications

```
GET    /api/v1/notifications                  - Get notifications (auth)
GET    /api/v1/notifications/unread-count     - Get unread count (auth)
PUT    /api/v1/notifications/:id/read         - Mark as read (auth)
PUT    /api/v1/notifications/read-all         - Mark all as read (auth)
```

### File Upload

```
POST   /api/v1/upload                         - Upload single image (auth)
POST   /api/v1/upload/multiple                - Upload multiple images (auth, max 5)
```

---

## 🔧 File Upload Integration

The upload service currently returns mock URLs for development. To integrate with a real storage provider:

### Option 1: Cloudinary

1. Install Cloudinary SDK:
```bash
npm install cloudinary
```

2. Uncomment the Cloudinary code in `src/services/upload.service.ts`

3. Add Cloudinary credentials to `.env`

### Option 2: AWS S3

1. Install AWS SDK:
```bash
npm install @aws-sdk/client-s3
```

2. Implement S3 upload logic in `src/services/upload.service.ts`

3. Add AWS credentials to `.env`

---

## 📁 New Files Created

### Services
- `src/services/team.service.ts` - Team CRUD and member management
- `src/services/user.service.ts` - User search and discovery
- `src/services/review.service.ts` - Review/rating system
- `src/services/notification.service.ts` - Notification management
- `src/services/upload.service.ts` - File upload handling

### Controllers
- `src/controllers/team.controller.ts`
- `src/controllers/user.controller.ts`
- `src/controllers/notification.controller.ts`
- `src/controllers/upload.controller.ts`

### Validators
- `src/validators/team.validator.ts`
- `src/validators/user.validator.ts`
- `src/validators/notification.validator.ts`

### Routes
- `src/routes/team.routes.ts`
- `src/routes/user.routes.ts`
- `src/routes/notification.routes.ts`
- `src/routes/upload.routes.ts`

### Utilities
- `src/utils/errors.ts` - AppError class for consistent error handling

---

## 🧪 Testing

### Example: Create a Team

```bash
curl -X POST http://localhost:5000/api/v1/teams \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Looking for 2BR in Mumbai",
    "description": "Working professionals seeking apartment",
    "budgetMin": 15000,
    "budgetMax": 25000,
    "city": "Mumbai",
    "maxMembers": 3
  }'
```

### Example: Search Users

```bash
curl "http://localhost:5000/api/v1/users?city=Mumbai&budgetMin=10000&budgetMax=30000&ageMin=25&ageMax=35"
```

### Example: Upload Image

```bash
curl -X POST http://localhost:5000/api/v1/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=profiles"
```

---

## ⚠️ Important Notes

1. **Database Migration Required**: The new features will NOT work until you run the Prisma migration.

2. **TypeScript Errors**: If you see TypeScript errors about missing Prisma models, run `npx prisma generate` to regenerate the Prisma client.

3. **File Upload**: Currently returns mock URLs. Integrate with Cloudinary or S3 for production use.

4. **Notifications**: Notification triggers are set up in the service layer but can be enhanced with real-time WebSocket support.

---

## 🔄 Migration Checklist

- [ ] Run `npx prisma migrate dev --name add_teams_reviews_notifications`
- [ ] Run `npx prisma generate`
- [ ] Add upload provider credentials to `.env` (if using Cloudinary/S3)
- [ ] Restart the development server
- [ ] Test new endpoints with Postman/curl
- [ ] Update frontend to use new endpoints

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [AWS S3 SDK](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html)

---

## 🐛 Troubleshooting

### "Module '@prisma/client' has no exported member 'Team'"

**Solution**: Run `npx prisma generate` to regenerate the Prisma client after schema changes.

### "Table 'teams' doesn't exist"

**Solution**: Run the database migration: `npx prisma migrate dev`

### File upload returns mock URLs

**Solution**: This is expected in development. Integrate with Cloudinary or S3 for real uploads.

---

## 📞 Support

For issues or questions, please refer to the implementation plan document or check the inline code comments in the service files.
