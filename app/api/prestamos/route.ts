import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const prestamos = await prisma.prestamo.findMany({
            include: { cliente: true },
            orderBy: { fecha_creacion: 'desc' }
        });
        return NextResponse.json(prestamos);
    } catch (error) {
        return NextResponse.json({ error: "Error al listar préstamos" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            cliente_id,
            monto_capital,
            tipo_calculo,
            valor_interes,
            monto_interes,
            total_adeudado,
            fecha_vencimiento,
            descripcion
        } = body;

        const db_tipo_interes = tipo_calculo === 'tasa' ? 'porcentaje' : 'monto_fijo';

        const newPrestamo = await prisma.prestamo.create({
            data: {
                cliente_id: cliente_id,
                monto_capital: parseFloat(Number(monto_capital || 0).toFixed(2)),
                tipo_interes: db_tipo_interes,
                valor_interes: parseFloat(Number(valor_interes || 0).toFixed(2)),
                monto_interes: parseFloat(Number(monto_interes || 0).toFixed(2)),
                total_adeudado: parseFloat(Number(total_adeudado || 0).toFixed(2)),
                saldo_pendiente: parseFloat(Number(total_adeudado || 0).toFixed(2)),
                estado: 'APROBADO',
                fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null,
                descripcion: (descripcion || '').toUpperCase(),
            }
        });

        return NextResponse.json(newPrestamo, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error en base de datos", dev_msg: error.message }, { status: 500 });
    }
}
