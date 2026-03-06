# Community Notice Board
This week strengthens the concepts of authentication and authorization by adding RBAC (role-based access control) to the application and introducing input validation and sanitization within the context of authentication. The front-end introduces external libraries for UI components (Material UI), and implements protected routes based on authentication and user roles. In addition the layered architecture is fully implemented in the scope of what is intended to teach in this course.
In this week the router is taken a bit further by adding a route mapping and using wrapper functions such as `withAuth` and `withAdmin` to protect routes.

The point is that normal authenticated users are able to register, login and view notifications. Admin users are able to create notifications and manage users by deleting them. API implemnentation contains a script to seed an admin user to the database.

# Week 8 Walkthrough

## Prerequisites

Before running the API:

1. Start PostgreSQL.
2. Run `community-notice-board-api/sql/schema.sql` so `users` and `notifications` tables exist.
3. Create `community-notice-board-api/.env` with:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/community-notice-board
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
```

### Libraries used

API (`community-notice-board-api`):

- `jsr:@db/postgres` for PostgreSQL access
- `jsr:@felix/bcrypt` for password hashing
- `npm:jose` for JWT signing and verification

Client (`community-notice-board-client`):

- `react`, `react-dom`, `react-router-dom`
- `@mui/material`, `@emotion/react`, `@emotion/styled`

## 1) Implement the back-end first (`community-notice-board-api`)

1. Configure DB pool in `src/db/pool.ts`:

2. Implement repositories:
	- `src/repositories/user-repository.ts`: find user by email, create user, list users, delete user
	- `src/repositories/notification-repository.ts`: create and list notifications

3. Implement services:
	- `src/services/auth-service.ts`: register (hash password), login (verify + sign JWT)
	- `src/services/notification-service.ts`: create/list notifications
	- `src/services/user-service.ts`: list users and delete user by id

4. Add auth and RBAC middleware in `src/middleware/auth-middleware.ts`:
	- `withAuth(...)` validates Bearer token and injects authenticated user
	- `withAdmin(...)` enforces admin-only access on protected admin routes

5. Add validation and sanitization in `src/util/validation.ts`:
	- Parse JSON safely (`readJson`)
	- Normalize and validate auth payload (email + strong password)
	- Trim and validate notification fields (`title`, `content`)

6. Separate JWT operations in `src/util/jwt.ts`:
	- `signToken(...)` creates token with user id, email, role
	- `verifyToken(...)` verifies token and reads authenticated payload

7. Implement routes in `src/router.ts`:
	- `POST /api/auth/register`
	- `POST /api/auth/login`
	- `GET /api/notifications` (authenticated users)
	- `POST /api/admin/notifications` (admin only)
	- `GET /api/admin/users` (admin only)
	- `DELETE /api/admin/users/:id` (admin only)
	- Include CORS handling and route-level error responses

8. Wire server in `src/main.ts`:
	- Use `Deno.serve(...)`
	- Wrap router with logging middleware

10. Add admin seeding script in `scripts/seed-admin.ts`:
	- Reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env
	- Creates admin user if it does not already exist

### Start scripts and permissions

Current scripts in `community-notice-board-api/deno.json`:

```json
"dev": "deno run --watch --allow-net --allow-env --env-file=.env --allow-read --allow-ffi src/main.ts",
"seed-admin": "deno run --allow-net --allow-env --env-file=.env --allow-read --allow-ffi scripts/seed-admin.ts"
```

Run API:

```bash
cd community-notice-board-api
deno task seed-admin
deno task dev
```

## 2) Implement the front-end (`community-notice-board-client`)

1. Implement API wrapper in `src/api.ts`:
	- register/login requests
	- authenticated requests for notifications and admin operations
	- centralized unauthorized handling (clear token and redirect flow)

2. Add token helpers and role checks in `src/auth.ts`:
	- store/remove token from `localStorage`
	- decode JWT payload to check role
	- `isLoggedIn()` and `isAdmin()` helpers for route guards

3. Configure router in `src/App.tsx`:
	- Public routes: `/login`, `/register`
	- Authenticated route: `/notifications`
	- Admin routes: `/admin/notifications/new`, `/admin/users`
	- Default redirect and fallback handling

4. Add route guards in components:
	- `components/ProtectedRoute.tsx` for authenticated pages
	- `components/AdminRoute.tsx` for role-based admin-only pages

5. Build UI with Material UI:
	- `components/AppLayout.tsx` navigation with role-aware links
	- `pages/LoginPage.tsx` and `pages/RegisterPage.tsx`
	- `pages/NotificationsPage.tsx` for all authenticated users
	- `pages/AdminNewNotificationPage.tsx` and `pages/AdminUsersPage.tsx` for admins
	- `src/theme.ts` for app-level theme customization

6. Initialize app in `src/main.tsx`:
	- `BrowserRouter` for client-side routing
	- `ThemeProvider` and `CssBaseline` for Material UI setup

### Client dependencies and commands with Deno

Even though the client uses Vite internally, use Deno commands for operations.

If dependencies are missing, add them with Deno:

```bash
cd community-notice-board-client
deno add npm:react npm:react-dom npm:react-router-dom npm:@mui/material npm:@emotion/react npm:@emotion/styled
```

Run client:

```bash
cd community-notice-board-client
deno task dev
```
