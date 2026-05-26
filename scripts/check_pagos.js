const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$queryRawUnsafe("SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname LIKE 'pagos%'").then(r => {
    console.log('Pagos Constraints:', r);
}).catch(e => console.error(e)).finally(() => p.$disconnect());
