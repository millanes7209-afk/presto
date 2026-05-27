// app/api/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";


export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      console.error("Login Error: Request body is missing or malformed");
      return NextResponse.json({ error: "Estructura de petición inválida." }, { status: 400 });
    }

    const { email, password } = body;
    const cleanEmail = email?.trim().toLowerCase();

    console.log(`Intentando login para: ${cleanEmail}`);

    if (!cleanEmail || !password) {
      return NextResponse.json({ error: "Campos obligatorios faltantes." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        clientes: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    console.log("Database result:", user ? "User found" : "User NOT found");

    if (!user) {
      console.log(`Login Fallido: Usuario ${cleanEmail} no encontrado`);
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    console.log(`Usuario encontrado. Rol: ${user.role}. Verificando contraseña...`);

    const passwordMatch = (password === user.password) || (await bcrypt.compare(password, user.password).catch((e) => {
      console.error("Bcrypt Error:", e);
      return false;
    }));

    if (!passwordMatch) {
      console.log(`Login Fallido: Contraseña incorrecta para ${cleanEmail}`);
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const nombreUsuario = user.nombre || (user.clientes ? `${user.clientes.nombre} ${user.clientes.apellido}` : "Administrador");
    console.log(`Login Exitoso: ${cleanEmail} (${nombreUsuario})`);

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
    console.error("CRASH EN LOGIN:", error);
    return NextResponse.json({ error: "Error en el servidor", detail: error.message }, { status: 500 });
  }
}
