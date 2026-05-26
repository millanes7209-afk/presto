const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkConstraint() {
    const res = await p.$queryRawUnsafe("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'prestamos_estado_check'");
    console.log("DEFINICION DE RESTRICCION:");
    console.log(res);
}

checkConstraint().finally(() => p.$disconnect());
