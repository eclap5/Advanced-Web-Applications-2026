import { router } from "./router.ts";
import { withLogging } from "./middleware/logger-middleware.ts";

const PORT: number = Number.parseInt(Deno.env.get("PORT") || "8000");

Deno.serve({ port: PORT }, (req) => withLogging(router)(req));