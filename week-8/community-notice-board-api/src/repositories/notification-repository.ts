import type { Pool } from "@db/postgres";
import type { Notification } from "../types.ts";

type NotificationRow = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    createdBy: string;
};

export async function listNotifications(
    pool: Pool,
): Promise<Notification[]> {
    const client = await pool.connect();

    try {
        const result = await client.queryObject<NotificationRow>`
            select
                id,
                title,
                content,
                created_at as "createdAt",
                created_by as "createdBy"
            from notifications
            order by created_at desc
        `;

        return result.rows;
    } finally {
        client.release();
    }
}

export async function createNotification(
    pool: Pool,
    notification: Notification,
): Promise<void> {
    const client = await pool.connect();

    try {
        await client.queryObject`
            insert into notifications (id, title, content, created_at, created_by)
            values (
                ${notification.id}::uuid,
                ${notification.title},
                ${notification.content},
                ${notification.createdAt}::timestamptz,
                ${notification.createdBy}::uuid
            )
        `;
    } finally {
        client.release();
    }
}