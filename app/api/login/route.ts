// app/api/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";


export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json({ error: "Campos obligatorios faltantes." }, { status: 400 });
    }

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
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const passwordMatch = (password === user.password) || (await bcrypt.compare(password, user.password).catch(() => false));

    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // El nombre lo tomamos del cliente vinculado si existe, sino del registro de usuario
    // El nombre lo tomamos del cliente vinculado si existe, sino es el administrador
    const nombreUsuario = user.cliente ? `${user.cliente.nombre} ${user.cliente.apellido}` : "Administrador";

    return NextResponse.json({
      message: `¡Bienvenido!`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        cliente_id: user.cliente_id,
        nombre: nombreUsuario
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Error en el servidor", detail: error.message }, { status: 500 });
  }
}
