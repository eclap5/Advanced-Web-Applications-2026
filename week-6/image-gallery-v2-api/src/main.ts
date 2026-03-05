import { withLogging } from "./middleware/logger-middleware.ts";
import { router } from "./router.ts";

const PORT = 8000;

Deno.serve({ port: PORT }, (req) => withLogging(router)(req));
