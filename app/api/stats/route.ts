import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const [
            capitalCalle,
            interesTotalActivo,
            interesPagadoActivo,
            interesCobradoHistorico,
            saldoPendiente,
            morasRecaudadas,
            proximosVencimientos,
            ultimosMovimientos
        ] = await Promise.all([
            // 1. Capital en la Calle (Suma de capital de préstamos APROBADO)
            prisma.prestamo.aggregate({
                _sum: { monto_capital: true },
                where: { estado: 'APROBADO' }
            }),
            // 2. Intereses TOTALES de préstamos APROBADO (para el proyectado)
            prisma.prestamo.aggregate({
                _sum: { monto_interes: true },
                where: { estado: 'APROBADO' }
            }),
            // 3. Intereses ya COBRADOS de préstamos APROBADO (para el proyectado)
            prisma.pago.aggregate({
                _sum: { monto_interes_pagado: true },
                where: { prestamos: { estado: 'APROBADO' } }
            }),
            // 4. Intereses COBRADOS TOTALES (Histórico de todos los préstamos incluso los ya pagados)
            prisma.pago.aggregate({
                _sum: { monto_interes_pagado: true }
            }),
            // 5. Saldo Total Pendiente (Capital + Interés restante de APROBADO)
            prisma.prestamo.aggregate({
                _sum: { saldo_pendiente: true },
                where: { estado: 'APROBADO' }
            }),
            // 6. Moras Recaudadas (Suma total de moras pagadas históricamente)
            prisma.pago.aggregate({
                _sum: { monto_mora_pagado: true }
            }),
            // 7. Próximos Vencimientos
            prisma.prestamo.findMany({
                where: {
                    estado: 'APROBADO',
                    fecha_vencimiento: { not: null }
                },
                orderBy: { fecha_vencimiento: 'asc' },
                take: 5,
                include: { clientes: true }
            }),
            // 8. Últimos Movimientos (Pagos)
            prisma.pago.findMany({
                orderBy: { fecha_pago: 'desc' },
                take: 5,
                include: { prestamos: { include: { clientes: true } } }
            })
        ]);

        // Interés Proyectado (pendiente por cobrar de los activos)
        const interesProyectado = Number(interesTotalActivo._sum.monto_interes || 0) - Number(interesPagadoActivo._sum.monto_interes_pagado || 0);

        return NextResponse.json({
            capitalCalle: capitalCalle._sum.monto_capital || 0,
            interesProyectado: Math.max(0, interesProyectado),
            interesCobradoTotal: interesCobradoHistorico._sum.monto_interes_pagado || 0,
            saldoPendiente: saldoPendiente._sum.saldo_pendiente || 0,
            morasRecaudadas: morasRecaudadas._sum.monto_mora_pagado || 0,
            proximosVencimientos,
            ultimosMovimientos
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Error en el cálculo de estadísticas" }, { status: 500 });
    }
}
