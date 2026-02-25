// Simple example of generic type for API response
// Additionally, demostrate optional properties
export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: string;
};

// Function to create a JSON response using the ApiResponse type
// Deno provides the standard Web API globally, so we can use the Response class directly
export function jsonResponse<T>(payload: ApiResponse<T>): Response {
  return new Response(JSON.stringify(payload), {
    status: payload.statusCode,
    headers: {
      "Content-Type": "application/json"
    },
  });
}