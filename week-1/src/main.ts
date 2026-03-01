import { jsonResponse, ApiResponse } from "./response.ts";
import { Task } from "./task.ts";

const APP_NAME: string = "Todo App";
const PORT: number = 8000;

const tasks: Task[] = [
  { id: 1, title: "Learn TypeScript", description: "Learn TypeScript basics", status: "in progress"},
  { id: 2, title: "Build a Todo App", description: "Build a simple todo app using Deno", status: "open"},
];

// Handler function to process incoming requests and return appropriate responses using the generic ApiResponse type
const handler = (req: Request): Response => {
  const url = new URL(req.url);

  if (req.method === "GET" && url.pathname === "/tasks") {
    const response: ApiResponse<Task[]> = {
      success: true,
      statusCode: 200,
      data: tasks,
    };
    return jsonResponse(response);
  } else {
    const response: ApiResponse<null> = {
      success: false,
      statusCode: 404,
      error: "Not Found",
    };
    return jsonResponse(response);
  }
};

console.log(`${APP_NAME} running on port ${PORT}`);

Deno.serve(
  { port: PORT },
  (req) => {
    return handler(req)
  }
);
