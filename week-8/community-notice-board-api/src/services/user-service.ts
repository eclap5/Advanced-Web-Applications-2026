import type { Pool } from "@db/postgres";
import type { PublicUser } from "../types.ts";
import {
    deleteUserById,
    listUsers as listUsersFromRepo,
} from "../repositories/user-repository.ts";

export async function listUsers(pool: Pool): Promise<PublicUser[]> {
    return await listUsersFromRepo(pool);
}

export async function deleteUser(
    pool: Pool,
    userId: string,
): Promise<boolean> {
    return await deleteUserById(pool, userId);
}