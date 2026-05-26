const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").then(r => {
    console.log('Real Tables:', r);
}).catch(e => console.error(e)).finally(() => p.$disconnect());
