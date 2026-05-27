import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("--- Inspeccionando restricciones de 'users' ---");
        const constraints = await prisma.$queryRaw`
            SELECT column_name, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `;
        console.log(JSON.stringify(constraints, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
