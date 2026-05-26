"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../inicio/inicio.css";

export default function ClienteDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [prestamos, setPrestamos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== "CLIENTE" || !parsedUser.cliente_id) {
                router.push("/login");
                return;
            }
            setUser(parsedUser);
            fetchData(parsedUser.cliente_id);
        } else {
            router.push("/login");
        }
    }, []);

    const fetchData = async (clienteId: string) => {
        try {
            const res = await fetch(`/api/clientes?id=${clienteId}`); // Necesitaremos que el API acepte filtro por ID
            const data = await res.json();
            // Como el API de clientes ahora devuelve array, buscamos el nuestro
            const miInfo = data.find((c: any) => c.id === clienteId);
            if (miInfo) {
                setPrestamos(miInfo.prestamos?.filter((p: any) => p.estado === 'APROBADO') || []);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    const totalDeuda = prestamos.reduce((acc, p) => acc + Number(p.saldo_pendiente), 0);

    return (
        <div className="dashboard-container" style={{ gridTemplateColumns: '1fr' }}>
            <main className="main-content" style={{ marginLeft: 0, padding: '2rem' }}>
                <header className="header" style={{ justifyContent: 'space-between' }}>
                    <div>
                        <h1>Hola, {user?.nombre || 'Cliente'} 👋</h1>
                        <p style={{ color: '#64748b' }}>Aquí puedes ver el estado de tus préstamos</p>
                    </div>
                    <button className="logout-btn" onClick={handleLogout} style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>Cerrar Sesión</button>
                </header>

                {loading ? <p>Cargando tus datos...</p> : (
                    <>
                        <section className="stats-grid" style={{ marginBottom: '2rem' }}>
                            <div className="stat-card" style={{ background: '#f0fff4', border: '2px solid #0f9d58' }}>
                                <span className="stat-label">Tu Deuda Total Actual</span>
                                <span className="stat-value" style={{ color: '#0f9d58' }}>Bs. {totalDeuda.toLocaleString()}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Préstamos Activos</span>
                                <span className="stat-value">{prestamos.length}</span>
                            </div>
                        </section>

                        <section className="data-section">
                            <h2 className="section-title">Detalle de mis Préstamos</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Fecha Inicio</th>
                                        <th>Capital Prestado</th>
                                        <th>Interés (Bs.)</th>
                                        <th>Tasa</th>
                                        <th>Saldo Pendiente</th>
                                        <th>Vencimiento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prestamos.map((p: any) => (
                                        <tr key={p.id}>
                                            <td>{new Date(p.fecha_creacion).toLocaleDateString()}</td>
                                            <td>Bs. {Number(p.monto_capital).toLocaleString()}</td>
                                            <td>Bs. {Number(p.monto_interes).toLocaleString()}</td>
                                            <td>{p.valor_interes}%</td>
                                            <td>
                                                <strong style={{ color: Number(p.saldo_pendiente) > 0 ? '#e53e3e' : '#0f9d58' }}>
                                                    Bs. {Number(p.saldo_pendiente).toLocaleString()}
                                                </strong>
                                            </td>
                                            <td>{p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString() : 'Sin fecha'}</td>
                                        </tr>
                                    ))}
                                    {prestamos.length === 0 && (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No tienes préstamos activos en este momento.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </section>

                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fffbeb', borderRadius: '15px', border: '1px solid #fef3c7' }}>
                            <h3 style={{ color: '#d97706', marginBottom: '0.5rem' }}>ℹ️ Nota para el cliente</h3>
                            <p style={{ fontSize: '0.9rem', color: '#92400e' }}>
                                Para realizar pagos o renovaciones, por favor contacta directamente con tu asesor o ven a nuestras oficinas.
                            </p>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
