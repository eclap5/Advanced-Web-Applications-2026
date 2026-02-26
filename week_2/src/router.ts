import type { CreateTaskBody, Task, TaskStatus } from "./types.ts";


// In-memory "database" for tasks.
// Increment task id based on last used id.
let nextId = 1;
const todos: Task[] = [];

/**
 * Helper functions for API responses.
 * This is a good place to introduce http status codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
 */
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {      // pretty print with 2 spaces
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function badRequest(message: string): Response {
  return json({ ok: false, error: { message } }, 400);
}

function notFound(message = "Not found"): Response {
  return json({ ok: false, error: { message } }, 404);
}

function ok<T>(data: T, status = 200): Response {
  return json({ ok: true, data }, status);
}

async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}


/**
 * 
 * Validation functions for request bodies.
 * These functions will check if the request body has the expected structure and types, and return a typed object if valid, or null if invalid.
 * This is a good place to introduce the concept of type guards in TypeScript.
 */
function validateCreateTask(body: unknown): CreateTaskBody | null {
  if (!body || typeof body !== "object") return null;

  const { title, description } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim() === "") return null;
  if (typeof description !== "string" || description.trim() === "") return null;

  const parsedTask: CreateTaskBody = {
    title: title.trim(),
    description: description.trim(),
  };
  return parsedTask;
}

function parseTaskId(path: string): number | null {
    const parts = path.split("/");
    const idStr = parts.at(-1);
    if (Number.isNaN(Number(idStr))) return null;
    return Number(idStr);
}

function validateUpdateStatus(body: unknown): { status: TaskStatus } | null {
    if (!body || typeof body !== "object") return null;
    const { status } = body as Record<string, unknown>;
    if (status !== "open" && status !== "in progress" && status !== "done") return null;
    return { status };
}


/**
 * Static file serving for frontend files.
 * Serve static files from the "static" directory. For example, a request to "/" will serve "static/index.html".
 */
const staticRoot = new URL("./static/", import.meta.url);

function contentType(path: string): string {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  return "application/octet-stream";
}

async function serveStatic(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname === "/" ? "/index.html" : url.pathname;

  try {
    const fileUrl = new URL("." + path, staticRoot);
    const bytes = await Deno.readFile(fileUrl);
    return new Response(bytes, {
      status: 200,
      headers: { "content-type": contentType(path) },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

/**
 * Main router function to handle incoming requests.
 * This function will route API requests to the appropriate handlers and serve static files for frontend requests.
 * This will introduce REST API concepts and HTTP methods (GET, POST, PUT, DELETE).
 */
export async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // GET route for fetching all tasks
  if (url.pathname === "/api/tasks" && req.method === "GET") {
    return ok(todos, 200);
  }

  // POST route for creating a new task
  if (url.pathname === "/api/tasks" && req.method === "POST") {
    const body = await readJson(req);

    const parsed = validateCreateTask(body);
    if (!parsed) {
      return badRequest("Invalid body. Expected: { title: string, description: string }");
    }

    const newTask: Task = { id: nextId++, title: parsed.title, description: parsed.description, status: "open" };
    todos.push(newTask);
    return ok(newTask, 201);
  }

  // PUT route for updating task status
  // Also demonstrates how to extract path parameters (task id) from the URL.
  if (url.pathname.startsWith("/api/tasks/") && req.method === "PUT") {
    const id = parseTaskId(url.pathname);
    if (!id) return badRequest("Invalid task id in URL");

    const body = await readJson(req);
    const parsed = validateUpdateStatus(body);
    if (!parsed) return badRequest("Invalid body. Expected: { status: 'open' | 'in progress' | 'done' }");

    const task = todos.find((t) => t.id === id);
    if (!task) return notFound("Task not found");

    task.status = parsed.status;
    return ok(task, 200);
  }

  // DELETE /api/tasks/:id
  if (url.pathname.startsWith("/api/tasks/") && req.method === "DELETE") {
    const id = parseTaskId(url.pathname);
    if (!id) return badRequest("Invalid id in URL");

    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return notFound("Task not found");

    todos.splice(index, 1);
    return new Response(null, { status: 204 });
  }

  // Lastly, if the route doesn't match any of the above API routes, we return notFound
  if (url.pathname.startsWith("/api/")) {
    return notFound("API route not found");
  }

  // For any non-API routes we will serve the static files for the frontend
  return await serveStatic(req);
}