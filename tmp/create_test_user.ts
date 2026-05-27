import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    try {
        const email = "admin_test@presto.com";
        const password = "admin123";
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Creating test admin user...");
        const user = await prisma.user.upsert({
            where: { email },
            update: { password: hashedPassword, role: "ADMIN" },
            create: {
                email,
                password: hashedPassword,
                role: "ADMIN"
            }
        });
        console.log("User created/updated:", user.email);
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
