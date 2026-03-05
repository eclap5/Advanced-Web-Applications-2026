/**
 * Database connection pool setup
 * 
 * This module could also be introduced as the infrastructure configuration layer, but in the sake of simplicity, this will be kept as a simple database configuration module.
 */

import { Pool } from "@db/postgres";

const DATABASE_URL = Deno.env.get("DATABASE_URL");
if (!DATABASE_URL) {
    throw new Error("Missing DATABASE_URL environment variable");
}

export const pool = new Pool(DATABASE_URL, 5, true);