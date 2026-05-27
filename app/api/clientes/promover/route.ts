import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const { clienteId, password } = await request.json();

        if (!clienteId || !password) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteId }
        });

        if (!cliente) {
            return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
        }

        if (!cliente.email) {
            return NextResponse.json({ error: "El cliente debe tener un email para crear un usuario" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: cliente.email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Este cliente ya tiene una cuenta activa" }, { status: 400 });
        }

        // Creamos el usuario vinculado SIN guardar el nombre redundante
        const newUser = await prisma.user.create({
            data: {
                email: cliente.email,
                password: password,
                role: "CLIENTE",
                cliente_id: cliente.id
            }
        });

        return NextResponse.json({ msg: "Acceso habilitado correctamente", user: { email: newUser.email } }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: "Error al habilitar acceso", detail: error.message }, { status: 500 });
    }
}
