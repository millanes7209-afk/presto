"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../inicio/inicio.css";
import "../clientes/clientes.css";

export default function PagosPage() {
    const router = useRouter();
    const [pagos, setPagos] = useState([]);
    const [prestamosActivos, setPrestamosActivos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        prestamo_id: "",
        monto_pagado: "",
        monto_capital_pagado: "",
        monto_interes_pagado: "",
        monto_mora_pagado: "",
        notas: ""
    });

    const fetchData = async () => {
        try {
            const [resPagos, resPrestamos] = await Promise.all([
                fetch("/api/pagos"),
                fetch("/api/prestamos")
            ]);
            const dataPagos = await resPagos.json();
            const dataPrestamos = await resPrestamos.json();
            setPagos(dataPagos || []);
            setPrestamosActivos(dataPrestamos.filter((p: any) => p.estado === 'APROBADO') || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Lógica de autocalculado
    useEffect(() => {
        const total = Number(formData.monto_pagado) || 0;
        const mora = Number(formData.monto_mora_pagado) || 0;
        const prestamo = prestamosActivos.find((p: any) => p.id === formData.prestamo_id);

        if (prestamo && total > 0) {
            const liquido = total - mora;
            const interesOriginal = Number(prestamo.monto_interes);
            let sugeridoInteres = Math.min(liquido, interesOriginal);
            let sugeridoCapital = Math.max(0, liquido - sugeridoInteres);

            setFormData(prev => ({
                ...prev,
                monto_interes_pagado: sugeridoInteres > 0 ? sugeridoInteres.toFixed(2) : "",
                monto_capital_pagado: sugeridoCapital > 0 ? sugeridoCapital.toFixed(2) : ""
            }));
        }
    }, [formData.monto_pagado, formData.monto_mora_pagado, formData.prestamo_id]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") setShowModal(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/pagos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok) {
                setShowModal(false);
                setFormData({ prestamo_id: "", monto_pagado: "", monto_capital_pagado: "", monto_interes_pagado: "", monto_mora_pagado: "", notas: "" });
                fetchData();
            } else {
                alert(`Error al registrar: ${result.error || result.detail || "Error desconocido"}`);
            }
        } catch (err: any) {
            alert("Error crítico de red o servidor: " + err.message);
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-logo">PRESTO</div>
                <ul className="nav-links">
                    <li className="nav-item" onClick={() => router.push("/inicio")}>Dashboard</li>
                    <li className="nav-item" onClick={() => router.push("/prestamos")}>Préstamos</li>
                    <li className="nav-item active">Pagos</li>
                    <li className="nav-item" onClick={() => router.push("/clientes")}>Clientes</li>
                    <li className="nav-item">Reportes</li>
                </ul>
                <button className="logout-btn" onClick={() => router.push("/login")}>Cerrar Sesión</button>
            </aside>

            <main className="main-content">
                <div className="action-bar">
                    <h1>Gestión de Pagos</h1>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>+ Registrar Nuevo Pago</button>
                </div>

                <section className="data-section">
                    <h2 className="section-title">Historial de Ingresos</h2>
                    {loading ? <p>Cargando...</p> : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Total Cobrado</th>
                                    <th>Saldo Antes</th>
                                    <th>Saldo Después</th>
                                    <th>Notas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagos.map((p: any) => (
                                    <tr key={p.id}>
                                        <td>{new Date(p.fecha_pago).toLocaleDateString()}</td>
                                        <td>{p.prestamos?.clientes?.nombre} {p.prestamos?.clientes?.apellido}</td>
                                        <td>
                                            <strong style={{ color: '#0f9d58' }}>Bs. {Number(p.monto_pagado).toLocaleString()}</strong>
                                            {Number(p.monto_mora_pagado) > 0 && (
                                                <span style={{ fontSize: '0.75rem', color: '#e53e3e', display: 'block' }}>
                                                    (+Mora: {Number(p.monto_mora_pagado)})
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ color: '#64748b' }}>Bs. {Number(p.saldo_antes).toLocaleString()}</td>
                                        <td>
                                            <strong style={{ color: Number(p.saldo_despues) <= 0 ? '#0f9d58' : '#e53e3e' }}>
                                                Bs. {Number(p.saldo_despues).toLocaleString()}
                                                {Number(p.saldo_despues) <= 0 && ' ✅'}
                                            </strong>
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>{p.notas || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" style={{ width: '600px' }} onClick={e => e.stopPropagation()}>
                            <h2>Registrar Cobro</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Seleccionar Préstamo</label>
                                    <select className="form-input" required value={formData.prestamo_id} onChange={e => setFormData({ ...formData, prestamo_id: e.target.value })}>
                                        <option value="">-- Seleccione un préstamo --</option>
                                        {prestamosActivos.map((p: any) => (
                                            <option key={p.id} value={p.id}>
                                                {p.clientes?.nombre} {p.clientes?.apellido} - Saldo: Bs. {Number(p.saldo_pendiente).toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', background: '#f0fff4', padding: '1rem', borderRadius: '15px', marginBottom: '1rem', border: '2px solid #0f9d58' }}>
                                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                        <label>Monto RECIBIDO (Bs.)</label>
                                        <input type="number" className="form-input" required value={formData.monto_pagado} onChange={e => setFormData({ ...formData, monto_pagado: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                        <label>MORA Cobrada (Bs.)</label>
                                        <input type="number" className="form-input" value={formData.monto_mora_pagado} onChange={e => setFormData({ ...formData, monto_mora_pagado: e.target.value })} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Abono Capital</label>
                                        <input type="number" className="form-input" value={formData.monto_capital_pagado} onChange={e => setFormData({ ...formData, monto_capital_pagado: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Cobro Interés</label>
                                        <input type="number" className="form-input" value={formData.monto_interes_pagado} onChange={e => setFormData({ ...formData, monto_interes_pagado: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Notas</label>
                                    <input type="text" className="form-input" value={formData.notas} onChange={e => setFormData({ ...formData, notas: e.target.value.toUpperCase() })} />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar (ESC)</button>
                                    <button type="submit" className="btn-primary" style={{ background: '#0f9d58' }}>Registrar Pago</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
