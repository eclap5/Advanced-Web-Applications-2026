import type { Pool } from "@db/postgres";
import type { PublicUser, User } from "../types.ts";

type UserRow = {
    id: string;
    email: string;
    passwordHash: string;
    role: "user" | "admin";
};

export async function findUserByEmail(
    pool: Pool,
    email: string,
): Promise<User | null> {
    const client = await pool.connect();

    try {
        const result = await client.queryObject<UserRow>`
            select
                id,
                email,
                password_hash as "passwordHash",
                role
            from users
            where email = ${email}
        `;

        return result.rows[0] ?? null;
    } finally {
        client.release();
    }
}

export async function createUser(
    pool: Pool,
    user: User,
): Promise<void> {
    const client = await pool.connect();

    try {
        await client.queryObject`
            insert into users (id, email, password_hash, role)
            values (${user.id}::uuid, ${user.email}, ${user.passwordHash}, ${user.role})
        `;
    } finally {
        client.release();
    }
}

export async function listUsers(pool: Pool): Promise<PublicUser[]> {
    const client = await pool.connect();

    try {
        const result = await client.queryObject<PublicUser>`
            select id, email, role
            from users
            order by created_at desc
        `;

        return result.rows;
    } finally {
        client.release();
    }
}

export async function deleteUserById(
    pool: Pool,
    userId: string,
): Promise<boolean> {
    const client = await pool.connect();

    try {
        const result = await client.queryObject`
            delete from users
            where id = ${userId}::uuid
        `;

        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
}