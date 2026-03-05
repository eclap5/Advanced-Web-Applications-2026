import type { Pool, PoolClient, QueryObjectResult } from "@db/postgres";
import type { Note } from "../types.ts";

// As this is fairly simple example, we can use same type for both, database and API layer. 
// In a more complex application, we would likely want to have separate types for database and API layer, and use mappers to convert between them.
export async function listNotes(pool: Pool): Promise<Note[]> {
    const client: PoolClient = await pool.connect();

    try {
        const result: QueryObjectResult<Note> = await client.queryObject<Note>`
            select id, content
            from notes
            order by id
        `;

        return result.rows;
    } finally {
        client.release();
    }
}