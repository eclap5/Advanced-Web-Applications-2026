# Building Secure Web Applications & OWASP Top 10
This week we will discuss the OWASP Top 10, which is a list of the most common security vulnerabilities in web applications. We will also discuss how to build secure web applications and how to avoid these vulnerabilities.
This week's code example includes a simple API that has several intentional security vulnerabilities. We will go through the code and identify the vulnerabilities, and then we will discuss how to fix them.
Front-end code includes a very simple React application that intentionally promotes the security issues visually. In normal application this kind of issues wouldn't be shown this clearly, but we want to demonstrate these issues visually.
In this week the code does not need to be written during the lecture, as the purpose is to demonstrate the vulnerabilities and show how to fix them.

## Note
While front-end code may indicate that user is only searching data from the application, it is important to notice that the application logic relies on using URL query parameters for access control and role management. So even if the front-end only shows a search box, the back-end is actually using the query parameters to determine what data to return and what actions to allow. This is a common security vulnerability, as it allows attackers to manipulate the query parameters to gain unauthorized access or perform actions they should not be able to.
This can also be demonstrated with curl to show that the front-end is just a facade and the real logic is in the back-end, which is vulnerable to attacks.

## OWASP Top 10
It is advisable to introduce all OWASP Top 10 vulnerabilities before the demo, either in detail or at least at a high level.

This demo application includes the following items from OWASP Top 10:
- A01 - Broken Access Control
- A02 - Security Misconfiguration
- A04 - Cryptographic Failures
- A05 - Injection
- A07 - Authentication Failures

## Demo Setup (Do Once)
1. Ensure PostgreSQL is running and create database `secure-application`.
2. Confirm API `.env` in `secure-application-api` points to your DB (default already provided):
	- `DATABASE_URL=postgres://postgres:postgres@localhost:5432/secure-application`
3. Initialize schema and seed data from `secure-application-api`:
	- `psql -U postgres -d secure-application -f sql/schema.sql`
	- `psql -U postgres -d secure-application -f sql/seed.sql`
4. Start API:
	- `cd secure-application-api`
	- `deno task dev`
5. Start client:
	- `cd ../secure-application-client`
	- `npm install`
	- `npm run dev`

Seeded users:
- Admin: `admin@example.com` / `Admin123!` / `11111111-1111-1111-1111-111111111111`
- Alice: `alice@example.com` / `alice123` / `22222222-2222-2222-2222-222222222222`
- Bob: `bob@example.com` / `bob123` / `33333333-3333-3333-3333-333333333333`

Seeded notes:
- Admin note: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
- Alice note: `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`
- Bob note: `cccccccc-cccc-cccc-cccc-cccccccccccc`

## A01 - Broken Access Control

### Vulnerable behavior
The API trusts client-controlled values and does not enforce proper authorization checks.

Relevant vulnerable endpoints:
- `GET /api/admin/audit?role=...`
- `GET /api/notes/:id`
- `DELETE /api/users/:id`

### Demonstration steps
1. Role parameter bypass for admin data.
	- In UI, set role to `user`, click **Get Admin Audit** -> receives `403`.
	- Change role to `admin`, click again -> receives secret admin logs.
	- curl:
	  - `curl "http://localhost:8000/api/admin/audit?role=user"`
	  - `curl "http://localhost:8000/api/admin/audit?role=admin"`

2. Read another user's private note.
	- Login as Alice (`alice@example.com` / `alice123`) and copy token.
	- Request Bob's note (`cccccccc-cccc-cccc-cccc-cccccccccccc`) with Alice token.
	- Response still returns Bob's private note.
	- curl:
	  - `curl -H "Authorization: Bearer <alice_token>" "http://localhost:8000/api/notes/cccccccc-cccc-cccc-cccc-cccccccccccc"`

3. Delete user without admin privileges.
	- In UI default delete field, click **Delete User** for Bob id.
	- Request succeeds even without any token.
	- Optional check: login as Bob now fails because account was deleted.

### How to fix (already commented in code)
In `secure-application-api/src/router.ts`:
1. For `/api/admin/audit`, stop trusting `role` query param.
	- Use authenticated user from token and verify admin role.
2. For `/api/notes/:id`, enforce ownership/admin checks.
	- Allow only owner or admin.
3. For `DELETE /api/users/:id`, require authentication and admin role.

## A02 - Security Misconfiguration

### Vulnerable behavior
Sensitive debug data and internal errors are exposed. CORS is configured too broadly.

Relevant vulnerable pieces:
- `GET /api/debug/config`
- Global error handling in `secure-application-api/src/router.ts`
- CORS headers in `secure-application-api/src/util/response.ts`

### Demonstration steps
1. Public debug/config endpoint exposure.
	- Click **Get Debug Config** in UI or run:
	  - `curl "http://localhost:8000/api/debug/config"`
	- Show returned database URL and secret-like values.

2. Internal error leakage.
	- Trigger duplicate-user database error:
	  - `curl -X POST "http://localhost:8000/api/register" -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"test1"}'`
	- Response leaks DB details.
	- Explain how this helps attackers map schema/constraints.

3. Overly permissive CORS.
	- Open `secure-application-client/CORS-test.html` through a different local origin (for example VS Code Live Server).
	- Page can read `http://localhost:8000/api/debug/config` because API responds with `Access-Control-Allow-Origin: *`.

### How to fix (already commented in code)
1. Restrict or remove debug endpoint from production.
2. Replace detailed error responses with generic ones; log details only server-side.
3. In `secure-application-api/src/util/response.ts`, use the commented secure CORS policy:
	- specific origin
	- restricted methods
	- restricted headers

## A04 - Cryptographic Failures

### Vulnerable behavior
Passwords are stored and compared in plaintext. Session token is only base64-encoded JSON, not signed.

Relevant vulnerable endpoints:
- `POST /api/register`
- `POST /api/login`

### Demonstration steps
1. Plaintext password handling.
	- Register a new user and explain password is stored directly in DB without hashing.
	- Optional DB proof: query `users` table and show readable passwords.

2. Reversible token.
	- Login as Alice and copy token from UI output.
	- Decode in browser console:
	  - `JSON.parse(atob("<token>"))`
	- Show that userId/email/role are visible and easy to tamper with.

### How to fix
In `secure-application-api/src/router.ts` (and auth logic):
1. Uncomment the bcrypt secure import and secure auth blocks.
	- `import { hash, verify } from "@felix/bcrypt"`
	- in register: `const passwordHash = await hash(password)` and store `passwordHash`
	- in login: `const isValidPassword = await verify(password, user.password)`
2. Use generic login error message for both unknown user and wrong password.
3. Replace custom base64 token with signed token/session and validate server-side.

Note: Seeded users in `sql/seed.sql` are intentionally plaintext for vulnerable demo mode, so if you switch to bcrypt secure mode, demonstrate login using a newly registered user (or reseed with bcrypt hashes).

## A05 - Injection

### Vulnerable behavior
User search endpoint concatenates input directly into SQL query.

Relevant vulnerable endpoint:
- `GET /api/users/search?email=...`

### Demonstration steps
1. In UI, under **A05 Injection**, input:
	- `' OR '1'='1`
2. Click **Search Users**.
3. Response returns multiple users and reveals query text via `executedQuery`.
4. curl equivalent:
	- `curl "http://localhost:8000/api/users/search?email=%27%20OR%20%271%27=%271"`

### How to fix (already commented in code)
In `secure-application-api/src/router.ts`:
1. Replace string concatenation with parameterized query.
2. Do not select password column in search result.
3. Remove `executedQuery` from response.

## A07 - Authentication Failures

### Vulnerable behavior
Weak password policy, user enumeration, no rate limiting, plaintext password checks, and insecure token design.

Relevant vulnerable endpoints:
- `POST /api/register`
- `POST /api/login`

### Demonstration steps
1. Weak password policy.
	- Register with weak password, for example `abcd`.
	- API accepts due to minimal length-only validation.

2. User enumeration.
	- Non-existing user login -> `404 User does not exist`.
	- Existing user + wrong password -> `401 Wrong password`.
	- Explain attacker can enumerate valid accounts.

3. No brute-force protection.
	- Repeat wrong password attempts with no lockout or delay.
    - It would be ideal to at least mention tools such as `hydra` that can automate this process.
    - While rate limiting/lockout is not implemented in the code, it can be discussed as a mitigation strategy.
    - Many cloud providers offer built-in solutions for rate limiting and bot protection that can be easily integrated.

4. Insecure token trust.
	- Decode token with `atob` as in A04 and explain it is trusted by protected routes.

### How to fix (already commented in code)
1. Enable strong password rules in `isStrongPassword` secure block.
2. Use generic login error message (same message for unknown user and wrong password).
3. Hash/verify passwords properly.
4. Add rate limiting or lockout for repeated login failures.
5. Use signed token/session and validate on every protected route.

## Suggested Lecture Flow
1. Show normal app usage in UI.
2. Repeat each action with curl/manual parameter edits to emphasize API-level vulnerability.
3. For each OWASP item, demonstrate:
	- vulnerable request
	- attacker impact
	- uncomment secure version
	- rerun same request and show secure behavior