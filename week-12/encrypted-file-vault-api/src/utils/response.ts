const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

export function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Key-Fingerprint",
        "Access-Control-Expose-Headers": "X-Original-Filename, X-Content-Type, X-Encryption-Iv",
    };
}

export function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data, null, 4), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
        },
    });
}