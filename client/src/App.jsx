import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import LoginPage from "./pages/LoginPage";
import StudentHome from "./pages/StudentHome";
import AdminHome from "./pages/AdminHome";

const UI = {
  colors: {
    bg: "#f7f3f3",
    text: "#0B1F3B", // dark blue
    muted: "rgba(11, 31, 59, 0.65)",
    border: "rgba(11, 31, 59, 0.12)",
    soft: "rgba(11, 31, 59, 0.04)",
    blue: "#0B1F3B",
    red: "#7A1020",
    mustard: "#C9A227"
  },
  radius: { card: 16, control: 12, pill: 999 },
  shadowSoft: "0 8px 20px rgba(11,31,59,0.06)"
};

export default function App() {
  const [me, setMe] = useState({ user: null });
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    const data = await apiFetch("/api/auth/me");
    setMe(data);
  }

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    await refreshMe();
  }

  if (loading)
    return (
      <div style={{ padding: 20, color: UI.colors.text, background: UI.colors.bg, fontFamily: "system-ui, Arial" }}>
        Loading...
      </div>
    );

  if (!me.user) return <LoginPage onLogin={refreshMe} />;

  return (
    <div
      style={{
        fontFamily: "system-ui, Arial",
        background: UI.colors.bg,
        color: UI.colors.text
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          
          gap: 14,
          padding: 14,
          borderRadius: UI.radius.card,
          border: `1px solid ${UI.colors.border}`,
          background: UI.colors.bg,
          boxShadow: UI.shadowSoft
        }}
      >
        {/* Logo (replace src with your actual logo path) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/images/logo2.png"
            alt="UA BiteCheck"
            style={{
              height: 40,
              width: "auto",
              display: "block",
              objectFit: "contain"
            }}
          />
        </div>

        <button
          onClick={logout}
          style={{
            border: `1px solid ${UI.colors.border}`,
            background: UI.colors.bg,
            color: UI.colors.text,
            borderRadius: UI.radius.control,
            padding: "10px 12px",
            fontWeight: 900,
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </header>

      <hr style={{ margin: "16px 0", border: "none", borderTop: `1px solid ${UI.colors.border}` }} />

      {/* Greeting AFTER the hr */}
      <div
        style={{
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: 0.2,
          margin: "0 0 16px 0",
          padding: 10,
          lineHeight: 1.1
        }}
      >
        Hello, <span style={{ fontStyle: "italic" }}>{me.user.role}</span>!
      </div>

      {me.user.role === "admin" ? <AdminHome /> : <StudentHome />}
    </div>
  );
}