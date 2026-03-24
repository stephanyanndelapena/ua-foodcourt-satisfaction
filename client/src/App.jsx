import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import LoginPage from "./pages/LoginPage";
import StudentHome from "./pages/StudentHome";
import AdminHome from "./pages/AdminHome";

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

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  if (!me.user) return <LoginPage onLogin={refreshMe} />;

  return (
    <div style={{ fontFamily: "system-ui, Arial", padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>UA Foodcourt Satisfaction</h2>
          <div style={{ opacity: 0.8, fontSize: 14 }}>
            Logged in as {me.user.name} ({me.user.role})
          </div>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      <hr />

      {me.user.role === "admin" ? <AdminHome /> : <StudentHome />}
    </div>
  );
}