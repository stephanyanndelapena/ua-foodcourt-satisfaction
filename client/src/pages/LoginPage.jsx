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

  const UI = {
    colors: {
      // Sky-blue overlay tints
      sky1: "rgba(125, 211, 252, 0.92)",
      sky2: "rgba(56, 189, 248, 0.78)",
      sky3: "rgba(14, 165, 233, 0.62)",
      skyDeep: "rgba(3, 105, 161, 0.55)",

      bg: "#FFFFFF",
      text: "#0B1F3B",
      muted: "rgba(11, 31, 59, 0.65)",
      border: "rgba(11, 31, 59, 0.14)",
      soft: "rgba(11, 31, 59, 0.04)",
      red: "#7A1020"
    },
    radius: { card: 18, control: 12 },
    shadowSoft: "0 10px 28px rgba(11,31,59,0.10)"
  };

  return (
    <div
      className="__loginRoot"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        fontFamily: "system-ui, Arial",
        background: UI.colors.bg
      }}
    >
      {/* LEFT: Image background + sky-blue gradient overlay */}
      <div
        className="__loginLeft"
        style={{
          position: "relative",
          display: "grid",
          placeItems: "center",
          padding: 24,
          overflow: "hidden"
        }}
      >
        {/* Background image (replace with your image path) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("/src/images/bg.png")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transform: "scale(1.03)"
          }}
        />

        {/* Logo */}
        <img
          src="/src/images/logo1.png"
          alt="UA BiteCheck"
          style={{
            position: "relative",
            width: 350,
            height: "auto",
            objectFit: "contain",
            display: "block",
            filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.22))"
          }}
        />
      </div>

      {/* RIGHT: Form panel */}
      <div
        className="__loginRight"
        style={{
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: UI.colors.bg
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h2
            style={{
              margin: "0 0 18px 0",
              color: UI.colors.text,
              fontWeight: 900,
              letterSpacing: 0.2
            }}
          >
            Login to UA BiteCheck
          </h2>

          <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, color: UI.colors.text }}>
              <span style={{ fontSize: 12, color: UI.colors.muted }}>Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: UI.radius.control,
                  border: `1px solid ${UI.colors.border}`,
                  padding: "11px 12px",
                  background: UI.colors.bg,
                  color: UI.colors.text,
                  outline: "none"
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6, color: UI.colors.text }}>
              <span style={{ fontSize: 12, color: UI.colors.muted }}>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: UI.radius.control,
                  border: `1px solid ${UI.colors.border}`,
                  padding: "11px 12px",
                  background: UI.colors.bg,
                  color: UI.colors.text,
                  outline: "none"
                }}
              />
            </label>

            {err && (
              <div
                style={{
                  color: UI.colors.red,
                  background: "rgba(122,16,32,0.08)",
                  border: "1px solid rgba(122,16,32,0.30)",
                  padding: 10,
                  borderRadius: UI.radius.control
                }}
              >
                {err}
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: 6,
                borderRadius: UI.radius.control,
                border: `1px solid ${UI.colors.text}`,
                background: UI.colors.text,
                color: "#fff",
                padding: "11px 12px",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: UI.shadowSoft
              }}
            >
              Login
            </button>
          </form>

          <div style={{ marginTop: 18, fontSize: 13, color: UI.colors.muted }}>
            <div style={{ fontWeight: 900, color: UI.colors.text, marginBottom: 6 }}>Seed accs:</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
              <li>
                <span style={{ fontWeight: 900, color: UI.colors.text }}>Admin:</span> admin@ua.edu / Admin123!
              </li>
              <li>
                <span style={{ fontWeight: 900, color: UI.colors.text }}>Student:</span> student@ua.edu / Student123!
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>
        {`
          @media (max-width: 860px) {
            .__loginRoot {
              grid-template-columns: 1fr !important;
            }

            .__loginLeft {
              min-height: 240px;
            }

            .__loginRight {
              place-items: start center;
              padding-top: 18px;
            }
          }

          @media (max-width: 420px) {
            .__loginLeft {
              min-height: 210px;
            }
          }
        `}
      </style>
    </div>
  );
}