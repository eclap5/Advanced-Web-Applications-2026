import type { Pool, PoolClient, QueryObjectResult } from "@db/postgres";
import type { User } from "../types.ts";

export async function findUserByEmail(pool: Pool, email: string): Promise<User | null> {
    const client: PoolClient = await pool.connect();

    try {
        const result: QueryObjectResult<User> = await client.queryObject<User>`
            select id, email, password_hash as "passwordHash"
            from users
            where email = ${email}
        `;

        return result.rows[0] ?? null;
    } finally {
        client.release();
    }
}

export async function createUser(pool: Pool, user: User): Promise<void> {
    const client: PoolClient = await pool.connect();

    try {
    await client.queryObject`
        insert into users (id, email, password_hash)
        values (${user.id}::uuid, ${user.email}, ${user.passwordHash})
    `;
} catch (error: unknown) {
    if (error instanceof Error && error.message === "23505") {      // Unique violation error code from Postgres. Add this guard clause to handle race conditions.
        throw new Error("EMAIL_ALREADY_EXISTS");    // We can use predefined custom error message to handle this specific case in the service layer, and return appropriate response to the client.
    }
    throw error;
} finally {
        client.release();
    }
}