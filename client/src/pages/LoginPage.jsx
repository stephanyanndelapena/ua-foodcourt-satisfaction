import { useState } from "react";
import { apiFetch } from "../api";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      await onLogin();
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 20, border: "1px solid #ddd", borderRadius: 10 }}>
      <h2>Login</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%" }} />
        </label>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <button type="submit">Login</button>
      </form>

      <hr />
      <div style={{ fontSize: 13, opacity: 0.85 }}>
        Seed accounts:
        <ul>
          <li>Admin: admin@ua.edu / Admin123!</li>
          <li>Student: student@ua.edu / Student123!</li>
        </ul>
      </div>
    </div>
  );
}