const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkStatuses() {
    const res = await p.$queryRawUnsafe("SELECT DISTINCT estado FROM prestamos");
    console.log("ESTADOS ACTUALES EN DB:");
    console.log(res);
}

checkStatuses().finally(() => p.$disconnect());
