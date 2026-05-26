const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function inspect() {
    const tables = await p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("TABLAS ENCONTRADAS:");
    console.table(tables);

    for (const t of tables) {
        const cols = await p.$queryRawUnsafe(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t.table_name}' AND table_schema = 'public'`);
        console.log(`COLUMNAS DE ${t.table_name}:`);
        console.table(cols);
    }
}

inspect().finally(() => p.$disconnect());
