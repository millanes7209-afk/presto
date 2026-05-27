import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("--- Inspeccionando tabla 'users' ---");
        const usersColumns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `;
        console.log("Columnas en 'users':", JSON.stringify(usersColumns, null, 2));

        console.log("\n--- Contenido de 'users' (solo roles e IDs) ---");
        const users = await prisma.$queryRaw`SELECT id, email, role FROM users LIMIT 5;`;
        console.log("Usuarios:", JSON.stringify(users, null, 2));

    } catch (error) {
        console.error("Error explorando la DB:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
