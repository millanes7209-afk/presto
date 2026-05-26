"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import "./inicio.css";

export default function InicioPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/stats");
            const data = await res.json();
            setStats(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="dashboard-container">
            {/* Sidebar con Link para navegación instantánea */}
            <aside className="sidebar">
                <div className="sidebar-logo">PRESTO</div>
                <ul className="nav-links">
                    <li className="nav-item active">
                        <Link href="/inicio">Dashboard</Link>
                    </li>
                    <li className="nav-item">
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
                <header className="header">
                    <h1>Tablero de Control</h1>
                    <div className="user-profile">
                        <span>Administrador</span>
                        <div className="avatar">A</div>
                    </div>
                </header>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '1.2rem', color: '#64748b' }}>
                        Actualizando cifras...
                    </div>
                ) : (
                    <>
                        {/* KPIs SUPERIORES */}
                        <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                            <div className="stat-card">
                                <span className="stat-label">Capital en la Calle</span>
                                <span className="stat-value">Bs. {Number(stats?.capitalCalle).toLocaleString()}</span>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>Dinero circulando</p>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Intereses Cobrados</span>
                                <span className="stat-value" style={{ color: '#0f9d58' }}>Bs. {Number(stats?.interesCobradoTotal).toLocaleString()}</span>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>Ganancia real acumulada</p>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Intereses Proyectados</span>
                                <span className="stat-value" style={{ color: '#2563eb' }}>Bs. {Number(stats?.interesProyectado).toLocaleString()}</span>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>Por cobrar aún</p>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Saldo por Cobrar</span>
                                <span className="stat-value" style={{ color: '#e53e3e' }}>Bs. {Number(stats?.saldoPendiente).toLocaleString()}</span>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>Capital + Interés restante</p>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Moras Cobradas</span>
                                <span className="stat-value" style={{ color: '#d97706' }}>Bs. {Number(stats?.morasRecaudadas).toLocaleString()}</span>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>Ingresos extra</p>
                            </div>
                        </section>

                        <div className="dashboard-grid-sections" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                            {/* PRÓXIMOS VENCIMIENTOS */}
                            <section className="data-section" style={{ margin: 0 }}>
                                <h2 className="section-title">Próximos Vencimientos ⏰</h2>
                                <table style={{ fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Cliente</th>
                                            <th>Vence</th>
                                            <th>Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats?.proximosVencimientos?.map((p: any) => (
                                            <tr key={p.id}>
                                                <td>{p.clientes?.nombre} {p.clientes?.apellido}</td>
                                                <td style={{ color: '#e53e3e', fontWeight: 'bold' }}>
                                                    {new Date(p.fecha_vencimiento).toLocaleDateString()}
                                                </td>
                                                <td>Bs. {Number(p.saldo_pendiente).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {stats?.proximosVencimientos?.length === 0 && (
                                            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>Sin vencimientos próximos</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </section>

                            {/* ÚLTIMOS PAGOS RECIBIDOS */}
                            <section className="data-section" style={{ margin: 0 }}>
                                <h2 className="section-title">Últimos Pagos ✅</h2>
                                <table style={{ fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Cliente</th>
                                            <th>Monto</th>
                                            <th>Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats?.ultimosMovimientos?.map((p: any) => (
                                            <tr key={p.id}>
                                                <td>{p.prestamos?.clientes?.nombre} {p.prestamos?.clientes?.apellido}</td>
                                                <td style={{ color: '#0f9d58', fontWeight: 'bold' }}>Bs. {Number(p.monto_pagado).toLocaleString()}</td>
                                                <td>{new Date(p.fecha_pago).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                        {stats?.ultimosMovimientos?.length === 0 && (
                                            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>No hay pagos registrados</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </section>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
