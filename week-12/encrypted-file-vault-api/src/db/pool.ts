import { Pool } from "@db/postgres";

const DATABASE_URL = Deno.env.get("DATABASE_URL");

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

export const pool: Pool = new Pool(DATABASE_URL, 5, true);