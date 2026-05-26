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

        const existingUser = await prisma.users.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "El email ya está registrado." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Creamos cliente y usuario en una transacción
        const newUser = await prisma.$transaction(async (tx) => {
            const cliente = await tx.clientes.create({
                data: {
                    nombre: nombre || "Usuario",
                    apellido: apellido || "Nuevo",
                    email: email,
                },
            });

            return await tx.users.create({
                data: {
                    email,
                    password: hashedPassword,
                    cliente_id: cliente.id,
                    es_gerente: false,
                },
            });
        });

        return NextResponse.json(
            { message: "Registro exitoso.", user: { email: newUser.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error("error en registro:", error);
        return NextResponse.json(
            { error: "Error en el servidor durante el registro." },
            { status: 500 }
        );
    }
}
