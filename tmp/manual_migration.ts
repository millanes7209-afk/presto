import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Adding 'role' column if not exists...");
        await prisma.$executeRawUnsafe(`
            ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS role varchar(255) DEFAULT 'ADMIN';
        `);
        console.log("Relation column 'cliente_id' check...");
        await prisma.$executeRawUnsafe(`
            ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS cliente_id uuid UNIQUE;
        `);
        console.log("Success.");
    } catch (error) {
        console.error("Migration error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
