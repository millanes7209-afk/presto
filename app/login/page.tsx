// app/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email || !password) {
      setError("Campos obligatorios faltantes.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("¡Ingreso exitoso!");
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => {
          router.push(data.user.role === "CLIENTE" ? "/cliente" : "/inicio");
        }, 800);
      } else {
        setError(data.error || "Error al ingresar");
      }
    } catch (err: any) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="brand-title">PRESTO</h1>

      <div className="login-form">
        {/* Toggle mejorado */}
        <div className="mode-selector">
          <button
            className={!isRegistering ? "active" : ""}
            onClick={() => setIsRegistering(false)}
          >
            LOGIN
          </button>
          <button
            className={isRegistering ? "active" : ""}
            onClick={() => setIsRegistering(true)}
          >
            REGISTRO
          </button>
        </div>

        <h2>{isRegistering ? "Crea tu cuenta" : "Bienvenido"}</h2>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <label>
                Nombre
                <input type="text" placeholder="Tu nombre" />
              </label>
              <label>
                Apellido
                <input type="text" placeholder="Tu apellido" />
              </label>
            </>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </label>

          <label className="password-label">
            Contraseña
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          {error && <p className="error">{error}</p>}
          {message && <p className="message">{message}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Procesando..." : (isRegistering ? "Registrarse" : "INGRESAR")}
          </button>
        </form>
      </div>
    </div>
  );
}
