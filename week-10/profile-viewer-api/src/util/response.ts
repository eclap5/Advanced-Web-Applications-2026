const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";

// Allow only front-end origin as we are using credentials for authentication (cookies)
export function corsHeaders() {
    return {
        "access-control-allow-origin": FRONTEND_URL,
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-allow-credentials": "true",
    };
}

export function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data, null, 4), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
            ...corsHeaders(),
        },
    });
}

export function redirect(url: string): Response {
    return new Response(null, {
        status: 302,
        headers: {
            location: url,
        },
    });
}