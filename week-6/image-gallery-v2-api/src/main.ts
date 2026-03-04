import { withLogging } from "./middleware/logger.ts";
import { router } from "./router.ts";

const PORT = 8000;

Deno.serve({ port: PORT }, (req) => withLogging(router)(req));
