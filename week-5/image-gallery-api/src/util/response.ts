/**
 * For this week we can take the application structure one step further by separating the response creation logic to a dedicated utility module.
 */

export function corsHeaders() {
    return {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "content-type",
        "access-control-allow-methods": "GET, POST, OPTIONS",
    };
}

export function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
            ...corsHeaders(),
        },
    });
}

export function bytes(data: Uint8Array, status = 200, contentType = "application/octet-stream"): Response {
    const body: ArrayBuffer = data.slice().buffer;    // Create a copy of the data to ensure the underlying buffer is not modified after the response is created. Also this way we can avoid direct type casting.
    return new Response(body, {
        status,
        headers: {
            "content-type": contentType,
            ...corsHeaders(),
        },
    });
}