import type { Pool, PoolClient, QueryObjectResult } from "@db/postgres";
import type { Note } from "../types.ts";

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