import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const clients = await prisma.cliente.findMany({
            include: {
                prestamos: {
                    select: {
                        id: true,
                        monto_capital: true,
                        monto_interes: true,
                        valor_interes: true,
                        saldo_pendiente: true,
                        estado: true,
                        fecha_creacion: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        const clientsWithSummary = clients.map(c => {
            const prestamosActivos = c.prestamos.filter(p => p.estado === 'APROBADO');
            const totalDeuda = prestamosActivos.reduce((acc: number, p: any) => acc + Number(p.saldo_pendiente), 0);

            return {
                ...c,
                resumen: {
                    prestamos_activos: prestamosActivos.length,
                    deuda_total: totalDeuda
                }
            };
        });

        return NextResponse.json(clientsWithSummary);
    } catch (error: any) {
        return NextResponse.json({ error: "Error al listar clientes", msg: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { nombre, apellido, email, telefono, cedula } = data;

        if (!nombre || !apellido) {
            return NextResponse.json({ error: "Nombre y apellido son obligatorios" }, { status: 400 });
        }

        const newClient = await prisma.cliente.create({
            data: {
                nombre: nombre.toUpperCase(),
                apellido: apellido.toUpperCase(),
                email: email || null,
                telefono: telefono || null,
                cedula: cedula || null,
            }
        });

        return NextResponse.json(newClient, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
    }
}
