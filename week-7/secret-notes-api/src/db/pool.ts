/**
 * Database connection pool setup.
 * Initialize a connection pool to the PostgreSQL database using the connection string from the environment variable.
 * 
*/

import { Pool } from "@db/postgres";

const DATABASE_URL = Deno.env.get("DATABASE_URL");
if (!DATABASE_URL) {
    throw new Error("Missing DATABASE_URL environment variable");
}

export const pool = new Pool(DATABASE_URL, 5, true);