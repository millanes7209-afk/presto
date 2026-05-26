const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$queryRawUnsafe("SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'prestamos_tipo_interes_check'").then(r => {
    console.log('Constraint definition:', r);
}).catch(e => console.error(e)).finally(() => p.$disconnect());
