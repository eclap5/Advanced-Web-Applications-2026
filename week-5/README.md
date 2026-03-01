# Image Gallery Application
In this week we will build a simple image gallery application, that will demonstrate on how to handle multipart form data from the client to the server. This week will also introduce the usage of filesystem in Deno.
Additionally, custom middleware will be implemented to provide custom logging for requests to the server. Front-end will not introduce any new concepts, but strenghten the knowledge of previous weeks.

## Note about handling files in this demo
In modern web development it is rare to store files such as images directly to database system but more common to use a dedicated file storage such as AWS S3, or Azure Blob Storage. Therefore, this demo will comply with this common practice and store only the metadata of the uploaded files to the "database" (in our case, a JSON file) and the files themselves will be stored in a dedicated folder in the filesystem. When user requests the list of files in the application, the API will provide the URLs to access the files, and the client will use these URLs to display the images in the gallery.

# Week 5 Walkthrough

## Important demo note about Deno permissions

Deno requires explicit filesystem permissions in this week.  
Start once **without** `--allow-read` / `--allow-write` to show the permission error. 
Afterwards modify `deno.json` to include the necessary permissions and restart with correct permissions.

## 1) Implement the back-end first (`image-gallery-api`)

1. Start from types in `src/types.ts`:
   - Define upload metadata shape (what is stored in `data/uploads.json`).

2. Implement file + metadata service in `src/services/upload-service.ts`:
   - Save uploaded file to `uploads/`.
   - Generate unique filename/id.
   - Persist metadata to `data/uploads.json`.
   - Return public file URL + metadata for client use.
   - Implement reading existing upload metadata for gallery listing.

3. Implement helper responses in `src/util/response.ts`:
   - Reusable JSON and bytes responses.

4. Implement request logging middleware in `src/middleware/logger.ts`:
   - Log method, path, status, and request duration.

5. Implement routing in `src/router.ts`:
   - Route for uploading image (multipart form data).
   - Route for fetching uploaded image metadata list.
   - Route/static handling for serving files from `uploads/`.
   - Add CORS headers and `OPTIONS` handling for browser requests.

6. Wire server in `src/main.ts`:
   - Register logger middleware.
   - Register router and start server.

7. Quick API checks before front-end:
   - Upload endpoint accepts `multipart/form-data` image.
   - File appears under `uploads/`.
   - Metadata is added to `data/uploads.json`.
   - List endpoint returns uploaded items with file URLs.
   - Direct file URL can be opened in browser.

## 2) Implement the front-end after API is working (`image-gallery-client`)

1. Define front-end types in `src/types.ts`:
   - Upload item type and API payload types.

2. Implement API wrapper in `src/api.ts`:
   - Upload image request (`FormData`).
   - Fetch gallery items request.

3. Build UI components in `src/components/`:
   - `UploadForm.tsx`: file picker + submit.
   - `Gallery.tsx`: renders image grid/list from API items.
   - `StatusBanner.tsx`: success/error/loading messages.

4. Compose app state in `src/App.tsx`:
   - Initial gallery load on mount.
   - Upload flow, then refresh gallery.
   - Loading/error/success handling.

5. Styling:
   - Add/update gallery and form styles in `src/styles/index.css`.

6. Run front-end:
   - `deno task dev`