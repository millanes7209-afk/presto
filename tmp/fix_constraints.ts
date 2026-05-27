import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Fixing constraints in 'users' table...");
        await prisma.$executeRawUnsafe(`ALTER TABLE users ALTER COLUMN cliente_id DROP NOT NULL;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'ADMIN';`);
        console.log("Success.");
    } catch (error) {
        console.error("Migration error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
