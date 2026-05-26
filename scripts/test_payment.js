async function testPayment() {
    try {
        const resL = await fetch("http://localhost:3000/api/prestamos");
        const loans = await resL.json();
        if (!loans || loans.length === 0) {
            console.log("No hay préstamos para probar.");
            return;
        }

        const target = loans.find(l => l.estado === 'activo') || loans[0];
        console.log(`Probando pago para préstamo ID: ${target.id}`);

        const paymentData = {
            prestamo_id: target.id,
            monto_pagado: "10.00",
            monto_capital_pagado: "5.00",
            monto_interes_pagado: "5.00",
            monto_mora_pagado: "0.00",
            notas: "PAGO DE PRUEBA DEBUG"
        };

        const resP = await fetch("http://localhost:3000/api/pagos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentData)
        });

        const result = await resP.json();
        console.log("Resultado del pago:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("Error en la prueba:", err);
    }
}

testPayment();
