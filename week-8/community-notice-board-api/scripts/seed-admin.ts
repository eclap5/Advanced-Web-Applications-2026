import { Pool } from "@db/postgres";
import { hash } from "@felix/bcrypt";

const DATABASE_URL = Deno.env.get("DATABASE_URL");

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const pool = new Pool(DATABASE_URL, 3, true);

async function seedAdmin() {
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminEmail || !adminPassword) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
    }

    const client = await pool.connect();

    try {
        const existing = await client.queryObject<{ id: string }>`
            select id
            from users
            where email = ${adminEmail}
        `;

        if (existing.rows.length > 0) {
            console.log(`Admin user already exists: ${adminEmail}`);
            return;
        }

        const passwordHash = await hash(adminPassword);

        await client.queryObject`
            insert into users (id, email, password_hash, role)
            values (
                ${crypto.randomUUID()}::uuid,
                ${adminEmail},
                ${passwordHash},
                ${"admin"}
            )
        `;

        console.log("Admin user created successfully.");
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
    } finally {
        client.release();
    }
}

try {
    await seedAdmin();
} finally {
    await pool.end();
}