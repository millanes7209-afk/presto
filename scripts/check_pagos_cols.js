const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const cols = await p.$queryRawUnsafe(
        `SELECT column_name, data_type 
     FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'pagos'
     ORDER BY ordinal_position`
    );
    console.log("COLUMNAS DE pagos:");
    console.table(cols);
}

main().finally(() => p.$disconnect());
