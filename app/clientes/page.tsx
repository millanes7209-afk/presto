"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./clientes.css";
import "../inicio/inicio.css";

export default function ClientesPage() {
    const router = useRouter();
    const [clientes, setClientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        cedula: ""
    });

    const fetchClientes = async () => {
        try {
            const res = await fetch("/api/clientes");
            const data = await res.json();
            setClientes(data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowModal(false);
                setShowDetailModal(false);
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/clientes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ nombre: "", apellido: "", email: "", telefono: "", cedula: "" });
                fetchClientes();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePromoteToUser = async (cliente: any) => {
        const pass = prompt(`Establezca una contraseña estándar para ${cliente.nombre} (email: ${cliente.email}):`, "presto123");
        if (!pass) return;

        try {
            const res = await fetch("/api/clientes/promover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clienteId: cliente.id, password: pass }),
            });
            const data = await res.json();
            if (res.ok) {
                alert(`¡Éxito! El cliente ahora puede entrar con su email y la contraseña asignada.`);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            alert("Error de conexión");
        }
    };

    const openDetail = (cliente: any) => {
        setSelectedClient(cliente);
        setShowDetailModal(true);
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-logo">PRESTO</div>
                <ul className="nav-links">
                    <li className="nav-item">
                        <Link href="/inicio">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                        <Link href="/prestamos">Préstamos</Link>
                    </li>
                    <li className="nav-item">
                        <Link href="/pagos">Pagos</Link>
                    </li>
                    <li className="nav-item active">
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
                    <h1>Gestión de Clientes</h1>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Cliente</button>
                </div>

                <section className="data-section">
                    <h2 className="section-title">Lista de Clientes Recientes</h2>
                    {loading ? <p>Cargando clientes...</p> : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Cédula</th>
                                    <th>Teléfono</th>
                                    <th>Email</th>
                                    <th>Deuda Actual</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientes.map((c: any) => (
                                    <tr key={c.id}>
                                        <td>{c.nombre} {c.apellido}</td>
                                        <td>{c.cedula || "N/A"}</td>
                                        <td>{c.telefono || "N/A"}</td>
                                        <td>{c.email || "N/A"}</td>
                                        <td>
                                            <strong style={{ color: (c.resumen?.deuda_total || 0) > 0 ? '#e53e3e' : '#0f9d58' }}>
                                                Bs. {(c.resumen?.deuda_total || 0).toLocaleString()}
                                            </strong>
                                        </td>
                                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="text-btn" onClick={() => openDetail(c)}>Ver Detalle</button>
                                            <button className="text-btn" style={{ color: '#d97706' }} title="Dar acceso al sistema" onClick={() => handlePromoteToUser(c)}>🔑 Acceso</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Modal Nuevo Cliente */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h2>Nuevo Cliente</h2>
                            <form onSubmit={handleCreate}>
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input type="text" className="form-input" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Apellido</label>
                                    <input type="text" className="form-input" required value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email (Necesario para que pueda entrar)</label>
                                    <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Cédula (C.I.)</label>
                                    <input type="text" className="form-input" value={formData.cedula} onChange={e => setFormData({ ...formData, cedula: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input type="text" className="form-input" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary">Guardar Cliente</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal DETALLE DE PRÉSTAMOS POR CLIENTE */}
                {showDetailModal && selectedClient && (
                    <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                        <div className="modal-content" style={{ width: '800px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>Estado de Cuenta: {selectedClient.nombre} {selectedClient.apellido}</h2>
                                <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>X</button>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '15px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>HISTORIAL DE PRÉSTAMOS</h3>
                                <table className="detail-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Capital</th>
                                            <th>Interés (Bs.)</th>
                                            <th>Tasa (%)</th>
                                            <th>Saldo Actual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedClient.prestamos?.filter((p: any) => p.estado === 'APROBADO').map((p: any) => (
                                            <tr key={p.id}>
                                                <td>{new Date(p.fecha_creacion || Date.now()).toLocaleDateString()}</td>
                                                <td>Bs. {Number(p.monto_capital || 0).toLocaleString()}</td>
                                                <td>Bs. {Number(p.monto_interes || 0).toLocaleString()}</td>
                                                <td>{Number(p.valor_interes || 0).toFixed(2)}%</td>
                                                <td>
                                                    <strong style={{ color: Number(p.saldo_pendiente) > 0 ? '#e53e3e' : '#64748b' }}>
                                                        Bs. {Number(p.saldo_pendiente || 0).toLocaleString()}
                                                    </strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem', display: 'block' }}>DEUDA TOTAL DEL CLIENTE</span>
                                    <span style={{ fontSize: '2rem', fontWeight: '800', color: (selectedClient.resumen?.deuda_total || 0) > 0 ? '#e53e3e' : '#0f9d58' }}>
                                        Bs. {(selectedClient.resumen?.deuda_total || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
