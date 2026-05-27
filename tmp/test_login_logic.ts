import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testLogin(email: string, pass: string) {
    try {
        const cleanEmail = email.trim().toLowerCase();
        console.log(`Testing login for: ${cleanEmail}`);

        const user = await prisma.user.findUnique({
            where: { email: cleanEmail },
            include: {
                cliente: {
                    select: {
                        nombre: true,
                        apellido: true
                    }
                }
            }
        });

        if (!user) {
            console.log("User not found");
            return;
        }

        console.log("User found, checking password...");
        const passwordMatch = (pass === user.password) || (await bcrypt.compare(pass, user.password).catch((e) => {
            console.error("Bcrypt error:", e);
            return false;
        }));

        console.log("Password match:", passwordMatch);

        const nombreUsuario = user.cliente ? `${user.cliente.nombre} ${user.cliente.apellido}` : "Administrador";
        console.log("Nombre usuario:", nombreUsuario);

        const response = {
            id: user.id,
            email: user.email,
            role: user.role,
            cliente_id: user.cliente_id,
            nombre: nombreUsuario
        };
        console.log("Success result:", response);

    } catch (error) {
        console.error("CRASH in login logic:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Reemplaza con los datos reales del usuario si los conoces, o usa uno de prueba
testLogin("millanes7209@gmail.com", "cualquier_cosa"); 
