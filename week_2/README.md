# Week 2: REST API with Static File front-end
1. We can take week 1 codes as starting point.
2. We will implement a REST API for the same functionality as week 1, but with a static file front-end.
3. Introduce GET POST PUT DELETE methods in REST API.

# Walkthrough:
1. Create new files `src/router.ts` and `src/types.ts`.
2. Move the `Task` interface and `TaskStatus` type to `src/types.ts`.
3. Move the `ApiResponse` type to `src/types.ts`.
4. Add couple new types to `src/types.ts` for request bodies.
5. In `router.ts`, implement a function `handleApiRoute` that will route API requests to the appropriate handlers based on the request method and URL path.
6. Implement handler functions for each API endpoint (GET /api/tasks, POST /api/tasks, PUT /api/tasks/:id, DELETE /api/tasks/:id).
7. Configure static file serving in the router to serve the front-end files from `src/static`.
8. Implement simple front-end in `src/static/index.html` that can interact with the API to display tasks and allow creating, updating, and deleting tasks.