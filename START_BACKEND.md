# Starting the Backend Server

## Prerequisites
1. Make sure you've run the database migration:
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

## Start the Backend Server

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   ```

4. You should see:
   ```
   🚀 Backend running on http://localhost:3001/api
   ```

## Backend API Endpoints

The backend runs on `http://localhost:3001/api`

All admin endpoints are prefixed with `/api/admin`:
- Dashboard stats: `GET /api/admin/dashboard/stats`
- Users: `GET /api/admin/users`
- Submissions: `GET /api/admin/submissions`
- Journal Shortcodes: `GET /api/admin/journal-shortcodes`
- Notifications: `GET /api/admin/notifications`
- Global Search: `GET /api/admin/search?query=...`

## Troubleshooting

### Network Error
If you see "Network Error" in the frontend:
1. Make sure the backend server is running (check terminal)
2. Verify the backend is accessible at `http://localhost:3001/api`
3. Check CORS settings in `backend/src/config/app.config.ts`
4. Make sure the frontend API URL is correct in `frontend/src/lib/api.ts`

### Database Connection Error
If you see database errors:
1. Make sure PostgreSQL is running
2. Check the connection string in `backend/prisma/schema.prisma`
3. Verify the database exists
4. Run migrations: `npx prisma migrate dev`





