"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../inicio/inicio.css";
import "../clientes/clientes.css";

export default function PrestamosPage() {
    const router = useRouter();
    const [prestamos, setPrestamos] = useState<any[]>([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("APROBADO"); // Pestaña por defecto

    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);

    const [loanFormData, setLoanFormData] = useState<any>({
        cliente_id: "",
        monto_capital: "",
        tipo_calculo: "tasa",
        valor_interes: "",
        monto_interes: "",
        total_adeudado: 0,
        fecha_vencimiento: "",
        descripcion: ""
    });

    const [payFormData, setPayFormData] = useState({
        monto_pagado: "",
        monto_capital_pagado: "",
        monto_interes_pagado: "",
        monto_mora_pagado: "",
        notas: ""
    });

    const fetchData = async () => {
        try {
            const [resP, resC] = await Promise.all([
                fetch("/api/prestamos"),
                fetch("/api/clientes")
            ]);
            const dataP = await resP.json();
            const dataC = await resC.json();
            setPrestamos(dataP || []);
            setClientes(dataC || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowLoanModal(false);
                setShowPayModal(false);
                setLoanFormData({ cliente_id: "", monto_capital: "", tipo_calculo: "tasa", valor_interes: "", monto_interes: "", total_adeudado: 0, fecha_vencimiento: "", descripcion: "" });
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const closeLoanModal = () => {
        setShowLoanModal(false);
        setLoanFormData({ cliente_id: "", monto_capital: "", tipo_calculo: "tasa", valor_interes: "", monto_interes: "", total_adeudado: 0, fecha_vencimiento: "", descripcion: "" });
    };

    // Autocalculado Préstamo
    useEffect(() => {
        const capital = Number(loanFormData.monto_capital) || 0;
        let interestMonto = 0;

        if (loanFormData.tipo_calculo === "tasa") {
            const tasa = Number(loanFormData.valor_interes) || 0;
            interestMonto = (capital * tasa) / 100;
            setLoanFormData((prev: any) => ({
                ...prev,
                monto_interes: interestMonto > 0 ? interestMonto.toFixed(2) : "",
                total_adeudado: Number((capital + interestMonto).toFixed(2))
            }));
        } else {
            const monto = Number(loanFormData.monto_interes) || 0;
            const tasa = capital > 0 ? (monto / capital) * 100 : 0;
            setLoanFormData((prev: any) => ({
                ...prev,
                valor_interes: tasa > 0 ? tasa.toFixed(2) : "",
                total_adeudado: Number((capital + monto).toFixed(2))
            }));
        }
    }, [loanFormData.monto_capital, loanFormData.valor_interes, loanFormData.monto_interes, loanFormData.tipo_calculo]);

    const handleLoanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/prestamos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loanFormData),
        });
        if (res.ok) {
            setShowLoanModal(false);
            setLoanFormData({ cliente_id: "", monto_capital: "", tipo_calculo: "tasa", valor_interes: "", monto_interes: "", total_adeudado: 0, fecha_vencimiento: "", descripcion: "" });
            fetchData();
        }
    };

    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/pagos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payFormData, prestamo_id: selectedLoan.id }),
        });
        if (res.ok) {
            setShowPayModal(false);
            setPayFormData({ monto_pagado: "", monto_capital_pagado: "", monto_interes_pagado: "", monto_mora_pagado: "", notas: "" });
            fetchData();
        }
    };

    const prestamosFiltrados = prestamos.filter(p => p.estado === activeTab);

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-logo">PRESTO</div>
                <ul className="nav-links">
                    <li className="nav-item">
                        <Link href="/inicio">Dashboard</Link>
                    </li>
                    <li className="nav-item active">
                        <Link href="/prestamos">Préstamos</Link>
                    </li>
                    <li className="nav-item">
                        <Link href="/pagos">Pagos</Link>
                    </li>
                    <li className="nav-item">
                        <Link href="/clientes">Clientes</Link>
                    </li>
                    <li className="nav-item">
                        <Link href="#">Reportes</Link>
                    </li>
                </ul>
                <Link href="/login" className="logout-btn" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                    Cerrar Sesión
                </Link>
            </aside>

            <main className="main-content">
                <div className="action-bar">
                    <h1>Préstamos {activeTab}</h1>
                    <button className="btn-primary" onClick={() => setShowLoanModal(true)}>+ Nuevo Préstamo</button>
                </div>

                {/* SISTEMA DE PESTAÑAS (TABS) */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    {['PENDIENTE', 'APROBADO', 'PAGADO', 'RECHAZADO'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.5rem 1rem',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab ? '700' : '500',
                                color: activeTab === tab ? '#0f172a' : '#64748b',
                                borderBottom: activeTab === tab ? '3px solid #0f9d58' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <section className="data-section">
                    {loading ? <p>Cargando datos...</p> : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Capital</th>
                                    <th>Interés</th>
                                    <th>Saldo Pendiente</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prestamosFiltrados.length > 0 ? prestamosFiltrados.map((p: any) => (
                                    <tr key={p.id}>
                                        <td>{p.clientes?.nombre} {p.clientes?.apellido}</td>
                                        <td>Bs. {Number(p.monto_capital).toLocaleString()}</td>
                                        <td>Bs. {Number(p.monto_interes).toLocaleString()} ({p.valor_interes}%)</td>
                                        <td><strong style={{ color: Number(p.saldo_pendiente) > 0 ? '#e53e3e' : '#0f9d58' }}>Bs. {Number(p.saldo_pendiente).toLocaleString()}</strong></td>
                                        <td><span className={`status-badge status-${p.estado}`}>{p.estado}</span></td>
                                        <td>
                                            {p.estado === 'APROBADO' && <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => { setSelectedLoan(p); setShowPayModal(true); }}>Pagar</button>}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No hay préstamos en este estado</td></tr>
                                )}
                            </tbody>
                            {prestamosFiltrados.length > 0 && (
                                <tfoot style={{ background: '#f8fafc', fontWeight: '800', borderTop: '2px solid #cbd5e1' }}>
                                    <tr>
                                        <td style={{ textAlign: 'right' }}>TOTALES:</td>
                                        <td>Bs. {prestamosFiltrados.reduce((acc, p) => acc + Number(p.monto_capital), 0).toLocaleString()}</td>
                                        <td>Bs. {prestamosFiltrados.reduce((acc, p) => acc + Number(p.monto_interes), 0).toLocaleString()}</td>
                                        <td style={{ color: '#e53e3e' }}>Bs. {prestamosFiltrados.reduce((acc, p) => acc + Number(p.saldo_pendiente), 0).toLocaleString()}</td>
                                        <td colSpan={2}></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    )}
                </section>

                {/* Modal Nuevo Préstamo RESTAURADO */}
                {showLoanModal && (
                    <div className="modal-overlay" onClick={closeLoanModal}>
                        <div className="modal-content" style={{ width: '700px' }} onClick={e => e.stopPropagation()}>
                            <h2>Registrar Nueva Solicitud</h2>
                            <form onSubmit={handleLoanSubmit}>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div className="form-group" style={{ flex: 2 }}>
                                        <label>Seleccionar Cliente</label>
                                        <select className="form-input" required value={loanFormData.cliente_id} onChange={e => setLoanFormData({ ...loanFormData, cliente_id: e.target.value })}>
                                            <option value="">-- Seleccione un cliente --</option>
                                            {clientes.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.nombre} {c.apellido} - {c.cedula}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Capital Solicitado (Bs.)</label>
                                        <input type="number" className="form-input" required value={loanFormData.monto_capital} onChange={e => setLoanFormData({ ...loanFormData, monto_capital: e.target.value })} />
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '15px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                                        <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                            <label>Tipo de Cálculo</label>
                                            <select className="form-input" value={loanFormData.tipo_calculo} onChange={e => setLoanFormData({ ...loanFormData, tipo_calculo: e.target.value, valor_interes: "", monto_interes: "" })}>
                                                <option value="tasa">TASA DE INTERÉS (%)</option>
                                                <option value="monto">MONTO FIJO (Bs.)</option>
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                            <label>{loanFormData.tipo_calculo === "tasa" ? "Tasa de Interés (%)" : "Monto de Interés (Bs.)"}</label>
                                            {loanFormData.tipo_calculo === "tasa" ? (
                                                <input type="number" className="form-input" value={loanFormData.valor_interes} onChange={e => setLoanFormData({ ...loanFormData, valor_interes: e.target.value })} />
                                            ) : (
                                                <input type="number" className="form-input" value={loanFormData.monto_interes} onChange={e => setLoanFormData({ ...loanFormData, monto_interes: e.target.value })} />
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <div className="total-adeudado-box" style={{ flex: 1, margin: 0, padding: '0.8rem' }}>
                                            <label className="total-adeudado-label" style={{ fontSize: '0.75rem' }}>DEUDA TOTAL SUGERIDA</label>
                                            <div className="total-adeudado-value" style={{ fontSize: '1.5rem' }}>Bs. {loanFormData.total_adeudado.toLocaleString()}</div>
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Fecha de Vencimiento (Opcional)</label>
                                            <input type="date" className="form-input" value={loanFormData.fecha_vencimiento} onChange={e => setLoanFormData({ ...loanFormData, fecha_vencimiento: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Notas / Descripción</label>
                                    <input type="text" className="form-input" placeholder="EJ. PRÉSTAMO POR EMERGENCIA MÉDICA" value={loanFormData.descripcion} onChange={e => setLoanFormData({ ...loanFormData, descripcion: e.target.value.toUpperCase() })} />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={closeLoanModal}>Cancelar (ESC)</button>
                                    <button type="submit" className="btn-primary">Registrar Solicitud</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Registrar Pago */}
                {showPayModal && selectedLoan && (
                    <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
                        <div className="modal-content" style={{ width: '550px' }} onClick={e => e.stopPropagation()}>
                            <h2>Registrar Pago</h2>
                            <p style={{ marginBottom: '1rem' }}>
                                Abonando al préstamo de <strong>{selectedLoan.clientes?.nombre}</strong><br />
                                Saldo actual: <strong>Bs. {Number(selectedLoan.saldo_pendiente).toLocaleString()}</strong>
                            </p>
                            <form onSubmit={handlePaySubmit}>
                                <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                        <label>Monto RECIBIDO (Bs.)</label>
                                        <input type="number" className="form-input" style={{ fontSize: '1.2rem', fontWeight: '800' }} required value={payFormData.monto_pagado} onChange={e => setPayFormData({ ...payFormData, monto_pagado: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                        <label>MORA (Bs.)</label>
                                        <input type="number" className="form-input" value={payFormData.monto_mora_pagado} onChange={e => setPayFormData({ ...payFormData, monto_mora_pagado: e.target.value })} />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowPayModal(false)}>Cancelar (ESC)</button>
                                    <button type="submit" className="btn-primary" style={{ background: '#0f9d58' }}>Confirmar Pago</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
