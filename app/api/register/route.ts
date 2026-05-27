import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";


export async function POST(request: Request) {
    try {
        const { email, password, nombre, apellido } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email y contraseña son obligatorios." },
                { status: 400 }
            );
        }

        // Usamos prisma.user (singular) según el esquema
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

        const newUser = await prisma.$transaction(async (tx) => {
            const cliente = await tx.cliente.create({
                data: {
                    nombre: nombre || "Usuario",
                    apellido: apellido || "Nuevo",
                    email: email,
                },
            });

            return await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    cliente_id: cliente.id,
                    role: "ADMIN",
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
            { error: "Error en el servidor", detail: error.message },
            { status: 500 }
        );
    }
}
