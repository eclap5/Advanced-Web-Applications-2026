# Authentication and Authorization in Deno
In this week, we will learn how to implement authentication and authorization in Deno. We will use JSON Web Tokens (JWT) for authentication and browser local storage for storing the JWT on the client side.
We will use the `npm:jose` library for creating and verifying JWTs, and `jsr:@felix/bcrypt` for hashing passwords. We will also use `jsr:@db/postgres` for database interactions.

It is advisable to clarify that even though Deno's standard library provides extensive crypto functionality, it is not powerful enough to be used in password hashing and JWT signing. Therefore, we will use the `jose` library for JWT handling and `bcrypt` for password hashing.

Note that now the API is checking protected routes by checking if the userId is present. However, this could be also made with a similar middleware as the logger, which wraps the handler and checks for authentication before calling the handler. Another way to improve readability and maintainability is to create a mapper which directly maps the routes that needs authentication to the handlers, and then the router can check if the route needs authentication and call the appropriate handler.
These are common patterns in web frameworks, but for simplicity we will keep it as a function call inside the handler. Perhaps in later weeks we will introduce the middleware pattern and the route mapper pattern to improve the structure of our code.

For the record, there is also a Deno-native library for JWT handling called `gz/jwt`, but as it does not appear to be as stable and well-maintained as `jose`, we will stick with `jose` for this course. Additionally, Deno's own docs use `jose` for their JWT examples, which is another reason to use it in this course. Link: https://docs.deno.com/examples/creating_and_verifying_jwt/

In this week we will also introduce React Router in our client application, to create multiple pages and navigate between them. We will create a simple NavBar component to navigate between pages, and we will protect the notes page so that only authenticated users can access it.

# Week 7 Walkthrough

## Prerequisites

Before running the API:

1. Start PostgreSQL.
2. Run `secret-notes-api/sql/scema.sql` so `users` and `notes` tables exist.
3. Create `secret-notes-api/.env` with:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/secret-notes
JWT_SECRET=replace-with-a-long-random-secret
```

### Libraries used

API (`secret-notes-api`):

- `jsr:@db/postgres` for PostgreSQL access
- `jsr:@felix/bcrypt` for password hashing
- `npm:jose` for JWT signing and verification

Note: Deno installs/caches API dependencies from `deno.json` automatically when you run the app.

Client (`secret-notes-client`):

- `react`, `react-dom`, `react-router-dom`

Add React Router with:

```bash
cd secret-notes-client
Deno add react-router-dom
```

## 1) Implement the back-end first (`secret-notes-api`)

1. Configure DB pool in `src/db/pool.ts`:
	- Read `DATABASE_URL` from env
	- Create shared PostgreSQL pool

2. Implement repositories:
	- `src/repositories/user-repository.ts`: find/create user
	- `src/repositories/notes-repository.ts`: list notes

3. Implement auth service in `src/services/auth-service.ts`:
	- Register: check existing email + hash password
	- Login: verify password + issue JWT

4. Implement auth middleware in `src/middleware/auth-middleware.ts`:
	- `generateJWT(...)`
	- `requireAuth(...)` to validate Bearer token

5. Implement routes in `src/router.ts`:
	- `POST /api/auth/register`
	- `POST /api/auth/login`
	- `GET /api/notes` (protected)
	- Include CORS and route-level error handling

6. Wire server in `src/main.ts`:
	- Use `Deno.serve(...)`
	- Wrap router with logging middleware

### Start script and permissions

Current start script in `secret-notes-api/deno.json`:

```json
"dev": "deno run --watch --allow-net --allow-write --allow-read --allow-env --env-file=.env --allow-ffi src/main.ts"
```

Permissions used:

- `--allow-net`: API server and database network access
- `--allow-env`: read `DATABASE_URL` and `JWT_SECRET`
- `--env-file=.env`: load local env vars automatically
- `--allow-read`, `--allow-write`, `--allow-ffi`: kept to avoid runtime permission prompts in this setup

Run API:

```bash
cd secret-notes-api
deno task dev
```

## 2) Implement/update the front-end (`secret-notes-client`)

1. API wrapper in `src/api.ts`:
	- register/login requests
	- attach token for `GET /api/notes`

2. Token helpers in `src/auth.ts`:
	- store/remove token from `localStorage`

3. Router and pages in `src/App.tsx`:
	- `/login`, `/register`, `/notes`
	- protect `/notes` with `components/ProtectedRoute` component.

4. Pages:
	- `RegisterPage.tsx`: submit registration form
	- `LoginPage.tsx`: login and save JWT
	- `NotesPage.tsx`: fetch protected notes, redirect on 401

5. NavBar in `src/components/NavBar.tsx`:
	- show auth links and logout action

Run client:

```bash
cd secret-notes-client
deno task dev
```