// Logging for development environment. In production, consider using a more robust logging solution.
export function withLogging(
    handler: (req: Request) => Promise<Response>,
) {
    return async (req: Request): Promise<Response> => {
        const start = Date.now();
        const url = new URL(req.url);

        console.log(`[${new Date().toISOString()}] → ${req.method} ${url.pathname}`);

        const res = await handler(req);

        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ← ${res.status} ${req.method} ${url.pathname} (${duration}ms)`);

        return res;
    };
}