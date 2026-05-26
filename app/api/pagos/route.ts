import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const pagos = await prisma.pago.findMany({
            include: { prestamos: { include: { clientes: true } } },
            orderBy: { fecha_pago: 'desc' }
        });
        return NextResponse.json(pagos);
    } catch (error: any) {
        console.error("API GET ERROR:", error);
        return NextResponse.json({ error: "Error al listar pagos", msg: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            prestamo_id,
            monto_pagado,
            monto_capital_pagado,
            monto_interes_pagado,
            monto_mora_pagado,
            notas
        } = body;

        const totalRecibido = parseFloat(Number(monto_pagado || 0).toFixed(2));
        const mora = parseFloat(Number(monto_mora_pagado || 0).toFixed(2));
        const descuentoDeuda = parseFloat((totalRecibido - mora).toFixed(2));

        const result = await prisma.$transaction(async (tx) => {
            console.log("Transacción iniciada...");

            const prestamo = await tx.prestamo.findUnique({ where: { id: prestamo_id } });
            if (!prestamo) throw new Error("Préstamo no encontrado");

            const saldoAntes = Number(prestamo.saldo_pendiente);
            const nuevoSaldo = Math.max(0, saldoAntes - descuentoDeuda);
            const saldoDespues = parseFloat(nuevoSaldo.toFixed(2));

            console.log(`Cálculos: Antes=${saldoAntes}, Menos=${descuentoDeuda}, Después=${saldoDespues}`);

            const newPago = await tx.pago.create({
                data: {
                    prestamo_id,
                    monto_pagado: totalRecibido,
                    monto_capital_pagado: parseFloat(Number(monto_capital_pagado || 0).toFixed(2)),
                    monto_interes_pagado: parseFloat(Number(monto_interes_pagado || 0).toFixed(2)),
                    monto_mora_pagado: mora,
                    saldo_antes: parseFloat(saldoAntes.toFixed(2)),
                    saldo_despues: saldoDespues,
                    fecha_pago: new Date(),
                    notas: (notas || '').toUpperCase()
                }
            });

            console.log("Registro de pago creado ID:", newPago.id);

            await tx.prestamo.update({
                where: { id: prestamo_id },
                data: {
                    saldo_pendiente: saldoDespues,
                    estado: saldoDespues <= 0 ? 'PAGADO' : 'APROBADO'
                }
            });

            console.log("Préstamo actualizado a estado:", saldoDespues <= 0 ? 'PAGADO' : 'APROBADO');
            return newPago;
        });

        console.log("--- FINAL PROCESO EXITOSO ---");
        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({
            error: "Error interno del servidor",
            detail: error.message,
            dbCode: error.code
        }, { status: 500 });
    }
}
