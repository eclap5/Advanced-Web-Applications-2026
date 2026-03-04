/**
 * Response utilities for the image gallery API.
*/

export function corsHeaders() {
    return {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "content-type",
        "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
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
    const body: ArrayBuffer = data.slice().buffer;
    return new Response(body, {
        status,
        headers: {
            "content-type": contentType,
            ...corsHeaders(),
        },
    });
}