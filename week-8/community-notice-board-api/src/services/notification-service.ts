import type { Pool } from "@db/postgres";
import type { Notification } from "../types.ts";
import {
    createNotification as createNotificationInRepo,
    listNotifications as listNotificationsFromRepo,
} from "../repositories/notification-repository.ts";

export async function listNotifications(
    pool: Pool,
): Promise<Notification[]> {
    return await listNotificationsFromRepo(pool);
}

export async function createNotification(
    pool: Pool,
    input: { title: string; content: string; createdBy: string },
): Promise<Notification> {
    const notification: Notification = {
        id: crypto.randomUUID(),
        title: input.title,
        content: input.content,
        createdAt: new Date().toISOString(),
        createdBy: input.createdBy,
    };

    await createNotificationInRepo(pool, notification);

    return notification;
}