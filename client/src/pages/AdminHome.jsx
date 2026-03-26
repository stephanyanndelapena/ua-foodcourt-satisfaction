import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import AdminReports from "../ui/AdminReports";

const UI = {
  colors: {
    bg: "#FFFFFF",
    text: "#0B1F3B",
    muted: "rgba(11, 31, 59, 0.65)",
    border: "rgba(11, 31, 59, 0.12)",
    card: "#FFFFFF",
    soft: "rgba(11, 31, 59, 0.04)",
    blue: "#0B1F3B",
    red: "#7A1020",
    mustard: "#C9A227"
  },
  radius: {
    card: 16,
    control: 12,
    pill: 999
  },
  shadow: "0 10px 28px rgba(11,31,59,0.08)",
  shadowSoft: "0 8px 20px rgba(11,31,59,0.06)"
};

function Card({ title, children, right }) {
  return (
    <section
      style={{
        border: `1px solid ${UI.colors.border}`,
        borderRadius: UI.radius.card,
        background: UI.colors.card,
        overflow: "hidden",
        boxShadow: UI.shadowSoft
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${UI.colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          background: UI.colors.bg
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, letterSpacing: 0.2, color: UI.colors.text }}>{title}</h3>
        <div style={{ color: UI.colors.muted }}>{right}</div>
      </div>
      <div style={{ padding: 16, background: UI.colors.bg }}>{children}</div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        border: `1px solid ${UI.colors.border}`,
        borderRadius: UI.radius.card,
        padding: 14,
        background: UI.colors.card,
        boxShadow: UI.shadowSoft
      }}
    >
      <div style={{ fontSize: 12, color: UI.colors.muted }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: 22, color: UI.colors.text, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function StallRow({ stall, onEdit, onSetActive }) {
  const statusLabel = stall.is_active ? "Active" : "Inactive";

  return (
    <div
      style={{
        border: `1px solid ${UI.colors.border}`,
        borderRadius: UI.radius.card,
        padding: 14,
        background: UI.colors.card,
        display: "grid",
        gridTemplateColumns: "96px 1fr 240px",
        gap: 14,
        alignItems: "center",
        boxShadow: UI.shadowSoft
      }}
    >
      <div
        style={{
          width: 96,
          height: 76,
          background: UI.colors.soft,
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${UI.colors.border}`
        }}
      >
        {stall.image_path ? (
          <img src={stall.image_path} alt={stall.stall_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ fontSize: 12, color: UI.colors.muted, padding: 10 }}>No image</div>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 900, color: UI.colors.text }}>
            #{stall.stall_number} — {stall.stall_name}
          </div>
          <span
            style={{
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: UI.radius.pill,
              border: `1px solid ${UI.colors.border}`,
              background: stall.is_active ? "rgba(201,162,39,0.14)" : "rgba(122,16,32,0.10)",
              color: stall.is_active ? UI.colors.blue : UI.colors.red,
              fontWeight: 700
            }}
          >
            {statusLabel}
          </span>
        </div>
        <div style={{ fontSize: 12, color: UI.colors.muted, overflow: "hidden", textOverflow: "ellipsis" }}>
          {stall.id}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
        <button
          onClick={() => onEdit(stall)}
          style={{
            border: `1px solid ${UI.colors.border}`,
            background: UI.colors.bg,
            color: UI.colors.text,
            borderRadius: UI.radius.control,
            padding: "10px 12px",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          Edit
        </button>

        <select
          value={stall.is_active ? "active" : "inactive"}
          onChange={(e) => onSetActive(stall, e.target.value === "active")}
          style={{
            border: `1px solid ${UI.colors.border}`,
            background: UI.colors.bg,
            color: UI.colors.text,
            borderRadius: UI.radius.control,
            padding: "10px 12px",
            fontWeight: 800,
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}

export default function AdminHome() {
  const [stalls, setStalls] = useState([]);
  const [filter, setFilter] = useState("all"); // all | active | inactive
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Create form
  const [create, setCreate] = useState({
    stall_number: "",
    stall_name: "",
    image: null
  });

  // Edit form
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    stall_number: "",
    stall_name: "",
    image: null
  });

  // Key rotation
  const [rotatePassword, setRotatePassword] = useState("");

  const stats = useMemo(() => {
    const total = stalls.length;
    const active = stalls.filter((s) => s.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [stalls]);

  const filteredStalls = useMemo(() => {
    if (filter === "active") return stalls.filter((s) => s.is_active);
    if (filter === "inactive") return stalls.filter((s) => !s.is_active);
    return stalls;
  }, [stalls, filter]);

  async function loadStalls() {
    const data = await apiFetch("/api/admin/stalls"); // returns active + inactive
    setStalls(data.stalls);
  }

  useEffect(() => {
    loadStalls();
  }, []);

  async function createStall(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      const fd = new FormData();
      fd.append("stall_number", create.stall_number);
      fd.append("stall_name", create.stall_name);
      // default active
      fd.append("is_active", "true");
      if (create.image) fd.append("image", create.image);

      await apiFetch("/api/admin/stalls", { method: "POST", body: fd });
      setMsg("Created stall (active).");
      setCreate({ stall_number: "", stall_name: "", image: null });
      await loadStalls();
    } catch (e2) {
      setErr(e2.message);
    }
  }

  function startEdit(stall) {
    setMsg("");
    setErr("");
    setEditing(stall);
    setEditForm({
      stall_number: String(stall.stall_number),
      stall_name: stall.stall_name,
      image: null
    });
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing) return;

    setErr("");
    setMsg("");

    try {
      const fd = new FormData();
      fd.append("stall_number", editForm.stall_number);
      fd.append("stall_name", editForm.stall_name);
      // keep current active status; use dropdown to change status
      fd.append("is_active", String(!!editing.is_active));
      if (editForm.image) fd.append("image", editForm.image);

      await apiFetch(`/api/admin/stalls/${editing.id}`, { method: "PUT", body: fd });
      setMsg("Updated stall.");
      setEditing(null);
      await loadStalls();
    } catch (e2) {
      setErr(e2.message);
    }
  }

  async function setActive(stall, isActive) {
    setErr("");
    setMsg("");

    try {
      // Optional confirm (recommended)
      const actionWord = isActive ? "activate" : "deactivate";
      if (!window.confirm(`Are you sure you want to ${actionWord} #${stall.stall_number} — ${stall.stall_name}?`)) {
        return;
      }

      await apiFetch(`/api/admin/stalls/${stall.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive })
      });

      setMsg(isActive ? "Stall set to Active." : "Stall set to Inactive.");
      await loadStalls();

      // Keep editing panel consistent if currently editing this stall
      if (editing?.id === stall.id) {
        setEditing((prev) => (prev ? { ...prev, is_active: isActive } : prev));
      }
    } catch (e2) {
      setErr(e2.message);
    }
  }

  async function rotateKey(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      const data = await apiFetch("/api/admin/keys/rotate", {
        method: "POST",
        body: JSON.stringify({ admin_password: rotatePassword })
      });
      setMsg(`Key rotated successfully. Active key version: ${data.active_version}`);
      setRotatePassword("");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
        background: UI.colors.bg,
        color: UI.colors.text
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Stat label="Total stalls" value={stats.total} />
        <Stat label="Active stalls" value={stats.active} />
        <Stat label="Inactive stalls" value={stats.inactive} />
      </div>

      {err ? (
        <div
          style={{
            padding: 12,
            borderRadius: UI.radius.card,
            border: `1px solid rgba(122,16,32,0.35)`,
            background: "rgba(122,16,32,0.08)",
            color: UI.colors.red,
            boxShadow: UI.shadowSoft
          }}
        >
          {err}
        </div>
      ) : null}

      {msg ? (
        <div
          style={{
            padding: 12,
            borderRadius: UI.radius.card,
            border: `1px solid rgba(201,162,39,0.45)`,
            background: "rgba(201,162,39,0.14)",
            color: UI.colors.text,
            boxShadow: UI.shadowSoft
          }}
        >
          {msg}
        </div>
      ) : null}

      <Card title="Key Rotation (Ed25519)" right={<div style={{ fontSize: 12 }}>Requires admin password</div>}>
        <form onSubmit={rotateKey} style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="password"
            placeholder="Confirm admin password"
            value={rotatePassword}
            onChange={(e) => setRotatePassword(e.target.value)}
            style={{
              flex: 1,
              border: `1px solid ${UI.colors.border}`,
              background: UI.colors.bg,
              color: UI.colors.text,
              borderRadius: UI.radius.control,
              padding: "10px 12px",
              outline: "none"
            }}
          />
          <button
            type="submit"
            style={{
              border: `1px solid ${UI.colors.blue}`,
              background: UI.colors.blue,
              color: "#fff",
              borderRadius: UI.radius.control,
              padding: "10px 12px",
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            Rotate Key
          </button>
        </form>
      </Card>

      <AdminReports />

      <Card title="Create Stall" right={<div style={{ fontSize: 12 }}>New stalls are Active by default</div>}>
        <form onSubmit={createStall} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
            <label style={{ display: "grid", gap: 6, color: UI.colors.text }}>
              <span style={{ fontSize: 12, color: UI.colors.muted }}>Stall Number</span>
              <input
                value={create.stall_number}
                onChange={(e) => setCreate((p) => ({ ...p, stall_number: e.target.value }))}
                placeholder="e.g. 10"
                style={{
                  border: `1px solid ${UI.colors.border}`,
                  background: UI.colors.bg,
                  color: UI.colors.text,
                  borderRadius: UI.radius.control,
                  padding: "10px 12px",
                  outline: "none"
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6, color: UI.colors.text }}>
              <span style={{ fontSize: 12, color: UI.colors.muted }}>Stall Name</span>
              <input
                value={create.stall_name}
                onChange={(e) => setCreate((p) => ({ ...p, stall_name: e.target.value }))}
                placeholder="e.g. Rice Meals Corner"
                style={{
                  border: `1px solid ${UI.colors.border}`,
                  background: UI.colors.bg,
                  color: UI.colors.text,
                  borderRadius: UI.radius.control,
                  padding: "10px 12px",
                  outline: "none"
                }}
              />
            </label>
          </div>

          <label style={{ display: "grid", gap: 6, color: UI.colors.text }}>
            <span style={{ fontSize: 12, color: UI.colors.muted }}>Stall Image (optional)</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setCreate((p) => ({ ...p, image: e.target.files?.[0] || null }))}
              style={{
                border: `1px solid ${UI.colors.border}`,
                background: UI.colors.bg,
                color: UI.colors.text,
                borderRadius: UI.radius.control,
                padding: "10px 12px",
                outline: "none"
              }}
            />
          </label>

          <div>
            <button
              type="submit"
              style={{
                border: `1px solid ${UI.colors.mustard}`,
                background: UI.colors.mustard,
                color: UI.colors.text,
                borderRadius: UI.radius.control,
                padding: "10px 12px",
                fontWeight: 900,
                cursor: "pointer"
              }}
            >
              Create Stall
            </button>
          </div>

          <div style={{ fontSize: 12, color: UI.colors.muted }}>
            To deactivate/reactivate, use the status dropdown in “Manage Stalls”.
          </div>
        </form>
      </Card>

      <Card
        title="Manage Stalls"
        right={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: UI.colors.text }}>
              Show:
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  border: `1px solid ${UI.colors.border}`,
                  background: UI.colors.bg,
                  color: UI.colors.text,
                  borderRadius: UI.radius.control,
                  padding: "8px 10px",
                  fontWeight: 800,
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="all">All</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </label>
            <button
              onClick={loadStalls}
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
              Refresh
            </button>
          </div>
        }
      >
        {editing ? (
          <form
            onSubmit={saveEdit}
            style={{
              padding: 14,
              border: `1px solid ${UI.colors.border}`,
              borderRadius: UI.radius.card,
              marginBottom: 12,
              background: UI.colors.soft
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 900, color: UI.colors.text }}>
                Editing: #{editing.stall_number} — {editing.stall_name}
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
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
                Cancel
              </button>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, color: UI.colors.muted }}>Stall Number</span>
                  <input
                    value={editForm.stall_number}
                    onChange={(e) => setEditForm((p) => ({ ...p, stall_number: e.target.value }))}
                    style={{
                      border: `1px solid ${UI.colors.border}`,
                      background: UI.colors.bg,
                      color: UI.colors.text,
                      borderRadius: UI.radius.control,
                      padding: "10px 12px",
                      outline: "none"
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, color: UI.colors.muted }}>Stall Name</span>
                  <input
                    value={editForm.stall_name}
                    onChange={(e) => setEditForm((p) => ({ ...p, stall_name: e.target.value }))}
                    style={{
                      border: `1px solid ${UI.colors.border}`,
                      background: UI.colors.bg,
                      color: UI.colors.text,
                      borderRadius: UI.radius.control,
                      padding: "10px 12px",
                      outline: "none"
                    }}
                  />
                </label>
              </div>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, color: UI.colors.muted }}>Replace Image (optional)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setEditForm((p) => ({ ...p, image: e.target.files?.[0] || null }))}
                  style={{
                    border: `1px solid ${UI.colors.border}`,
                    background: UI.colors.bg,
                    color: UI.colors.text,
                    borderRadius: UI.radius.control,
                    padding: "10px 12px",
                    outline: "none"
                  }}
                />
              </label>

              <div>
                <button
                  type="submit"
                  style={{
                    border: `1px solid ${UI.colors.blue}`,
                    background: UI.colors.blue,
                    color: "#fff",
                    borderRadius: UI.radius.control,
                    padding: "10px 12px",
                    fontWeight: 900,
                    cursor: "pointer"
                  }}
                >
                  Save Changes
                </button>
              </div>

              <div style={{ fontSize: 12, color: UI.colors.muted }}>
                Status is controlled by the dropdown on each stall row.
              </div>
            </div>
          </form>
        ) : null}

        <div style={{ display: "grid", gap: 10 }}>
          {filteredStalls.map((s) => (
            <StallRow key={s.id} stall={s} onEdit={startEdit} onSetActive={setActive} />
          ))}
          {filteredStalls.length === 0 ? <div style={{ color: UI.colors.muted }}>No stalls for this filter.</div> : null}
        </div>
      </Card>
    </div>
  );
}