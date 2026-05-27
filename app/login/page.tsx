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

  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("INICIANDO FETCH - Si ves esto, el código nuevo está activo");
    setError("");
    setMessage("");
    if (!email || !password) {
      setError("Email y contraseña son obligatorios.");
      return;
    }
    try {
      const endpoint = isRegistering ? "/api/register" : "/api/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log("DEBUG LOGIN - Respuesta:", data);
      if (!res.ok) alert("DEBUG SERVER ERROR: " + JSON.stringify(data));
      if (res.ok) {
        if (isRegistering) {
          setMessage("Registro exitoso. Espere aprobación.");
          setIsRegistering(false);
        } else {
          setMessage("Login exitoso. Redirigiendo...");

          // Guardamos info básica en localStorage para saber quién es
          localStorage.setItem("user", JSON.stringify(data.user));

          setTimeout(() => {
            if (data.user.role === "CLIENTE") {
              router.push("/cliente");
            } else {
              router.push("/inicio");
            }
          }, 800);
        }
      } else {
        const msg = data.detail ? `${data.error}: ${data.detail}` : (data.error || "Error");
        setError(msg);
      }
    } catch (err: any) {
      setError("Error crítico: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <h1 className="brand-title">PRESTO</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}</h2>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Introduce tu email"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
        </label>
        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}
        <button type="submit" className="submit-btn">
          {isRegistering ? "Registrarse" : "ENTRAR (v2.0 DEBUG)"}
        </button>
        <p className="toggle-mode" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </p>
      </form>
    </div>
  );
}
