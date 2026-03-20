import type { Pool } from "@db/postgres";
import type { User } from "../types.ts";

export async function createUser(pool: Pool, user: User): Promise<void> {
    const client = await pool.connect();

    try {
        await client.queryObject`
            insert into users (id, email, password_hash, created_at)
            values (${user.id}::uuid, ${user.email}, ${user.passwordHash}, ${user.createdAt})
        `;
    } catch (e: unknown) {
        console.error("Error creating user:", e);
        throw e;
    } finally {
        client.release();
    }
}

export async function findUserByEmail(
    pool: Pool,
    email: string,
): Promise<User | null> {
    const client = await pool.connect();
    try {
        const result = await client.queryObject<User>`
            select
                id,
                email,
                encryption_key_fingerprint as "encryptionKeyFingerprint",
                password_hash as "passwordHash",
                created_at as "createdAt"
            from users
            where email = ${email}
        `;

        return result.rows[0] ?? null;
    } catch (e: unknown) {
        console.error("Error finding user by email:", e);
        throw e;
    } finally {
        client.release();
    }
}

export async function setEncryptionKeyFingerprint(
    pool: Pool,
    userId: string,
    fingerprint: string,
): Promise<void> {
    const client = await pool.connect();

    try {
        await client.queryObject`
            update users
            set encryption_key_fingerprint = ${fingerprint}
            where id = ${userId}::uuid
        `;
    } catch (e: unknown) {
        console.error("Error setting encryption key fingerprint:", e);
        throw e;
    } finally {
        client.release();
    }
}

export async function findUserById(pool: Pool, id: string): Promise<User | null> {
    const client = await pool.connect();

    try {
        const result = await client.queryObject<User>`
            select
                id,
                email,
                encryption_key_fingerprint as "encryptionKeyFingerprint",
                created_at as "createdAt"
            from users
            where id = ${id}::uuid
        `;
        return result.rows[0] ?? null;
    } catch (e: unknown) {
        console.error("Error finding user by ID:", e);
        throw e;
    } finally {
        client.release();
    }
}