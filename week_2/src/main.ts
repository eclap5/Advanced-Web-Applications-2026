import { router } from "./router.ts";

const PORT: number = 8000;
const APP_NAME = "Todo App Part 2";

console.log(`${APP_NAME} is running on port ${PORT}`);

Deno.serve(
  { port: PORT },
  (req) => {
    return router(req)
  }
);
