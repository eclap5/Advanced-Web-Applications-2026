// VULNERABLE VERSION
export function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    };
}

// SECURE VERSION
// export function corsHeaders() {
//     return {
//         "Access-Control-Allow-Origin": "http://localhost:5173",
//         "Access-Control-Allow-Methods": "GET, POST, DELETE",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     };
// }

export function json(data: unknown, status: number = 200): Response {
    return new Response(JSON.stringify(data, null, 4), {
        status,
        headers: {
            "Content-Type": "application/json charset=utf-8",
            ...corsHeaders(),
        },
    });
}