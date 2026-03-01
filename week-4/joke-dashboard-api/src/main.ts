import { router } from "./router.ts";

const PORT = 8000;

Deno.serve({ port: PORT }, (req) => {
    return router(req);
});
