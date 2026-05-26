import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { email, password, nombre, apellido } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email y contraseña son obligatorios." },
                { status: 400 }
            );
        }

        // Corregido: Prisma usa el nombre del modelo en singular
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "El email ya está registrado." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Creamos cliente y usuario en una transacción con los nombres de modelo correctos
        const newUser = await prisma.$transaction(async (tx) => {
            const cliente = await tx.cliente.create({
                data: {
                    nombre: nombre || "Nuevo",
                    apellido: apellido || "Usuario",
                    email: email,
                },
            });

            return await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    cliente_id: cliente.id,
                    role: "ADMIN", // Por defecto ADMIN para registros externos, o ajustar según lógica
                },
            });
        });

        return NextResponse.json(
            { message: "Registro exitoso.", user: { email: newUser.email } },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("error en registro:", error);
        return NextResponse.json(
            { error: "Error en el servidor durante el registro.", detail: error.message },
            { status: 500 }
        );
    }
}
