# Image Gallery V2
This week's project continues to improve previous week's image gallery application. This week will introduce database usage with Deno application. 
The project structure is also improved while adding database layer to the application. We will be using PostgreSQL as the database and `deno-postgres` library as the database driver to connect to PostgreSQL from the application.
It is advisable to intall `pgadmin4` or at least `psql` command line tool to be able to interact with the database more easily.

# Notes:
1. Determine if we want to introduce environment variables also in this week. If so, we can add a `.env` file to the project and instead of hardcoding the database connection string, we can use `Deno.env.get("DATABASE_URL")` to read the connection string from environment variables.
2. While we are introducing the "low-level" way of implementing datbase practices now with hardcoded SQL queries, it is worth mentioning that there are also highler-level librearies that provides ORM (Object-Relational Mapping) features. This is also a viable and common way to implement database operations in Node.js and Deno applications. Additionally, migration tools are also commonly used to manage database schema changes over time. These tools are also worth mentioning as they are commonly used in real-world applications. In the sake of simplicity, these topics are out of this course's scope.
3. While this week is the first one to properly introduce the use of external libraries, it would be good to mention a few words about `jsr` which is equivalent to `npm` in Node.js.

# Week 6 Walkthrough:

## Prerequisites

Week 6 is a continuation of Week 5. 
Before running the API, ensure PostgreSQL is running and execute `sql/schema.sql` so the `uploads` table exists.

Deno also needs explicit permissions in this week (`--allow-net --allow-read --allow-write --allow-env`).

## 1) Implement the back-end first (`image-gallery-v2-api`)

1. Start from shared types in `src/types.ts`:
	- Keep upload metadata shape compatible with Week 5 (`UploadRecord`).

2. Add SQL schema in `sql/schema.sql`:
	- Create `uploads` table for metadata.
	- Add index for `uploaded_at` sorting.

3. Configure DB pool in `src/db/pool.ts`:
	- Use `deno-postgres` (`jsr:@db/postgres`) and create a reusable connection pool.

4. Implement repository layer in `src/repositories/upload-repository.ts`:
	- `insertUpload` for insert.
	- `listUploads` for gallery listing.
	- `findUploadById` and `deleteUploadById` for deletion.

5. Implement service layer in `src/services/upload-service.ts`:
	- Keep filesystem write logic for images (`uploads/`).
	- Replace JSON metadata persistence with repository calls.
	- Add `deleteUploadedImage` for removing file + DB metadata.

6. Implement routes in `src/router.ts`:
	- `GET /api/uploads` (list uploads)
	- `POST /api/uploads` (upload image)
	- `DELETE /api/uploads/:id` (new feature)
	- `GET /uploads/:filename` (serve uploaded image bytes)
	- Keep `OPTIONS` + CORS handling, including `DELETE`.

7. Wire server in `src/main.ts`:
	- Keep request logger middleware and router wiring as in Week 5 structure.

8. Quick API checks before front-end:
	- Upload writes file to `uploads/` and row to PostgreSQL.
	- List endpoint returns rows from DB.
	- Delete endpoint removes file + metadata row.

## 2) Implement/update the front-end (`image-gallery-v2-client`)

1. Keep front-end types in `src/types.ts`:
	- `UploadRecord` remains compatible.

2. Update API wrapper in `src/api.ts`:
	- Keep upload + fetch list.
	- Add delete request (`DELETE /api/uploads/:id`).

3. Update components in `src/components/`:
	- `Gallery.tsx`: add delete button per image card.
	- Keep disabled state while one delete is in progress.

4. Compose app state in `src/App.tsx`:
	- Keep initial load and upload flow.
	- Add delete flow (`deletingId` + `handleDelete`).
	- Update UI state immediately after successful delete.

5. Styling:
	- Add/adjust delete button styles in `src/styles/index.css` (including hover state).

6. Run front-end and verify:
	- Upload still works as before.
	- Delete removes card from UI.
	- Refresh confirms deletion is persistent (DB + filesystem).
