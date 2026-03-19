import { router } from "./router.ts";

const PORT = 8000;

console.log(`Server running on http://localhost:${PORT}`);

Deno.serve({ port: PORT }, (req) => router(req));