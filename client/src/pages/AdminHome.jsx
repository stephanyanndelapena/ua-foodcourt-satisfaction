import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import AdminReports from "../ui/AdminReports";

function Card({ title, children, right }) {
  return (
    <section style={{ border: "1px solid #e6e6e6", borderRadius: 14, background: "#fff", overflow: "hidden" }}>
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
        {right}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fafafa" }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: 20 }}>{value}</div>
    </div>
  );
}

function StallRow({ stall, onEdit, onSetActive }) {
  const statusLabel = stall.is_active ? "Active" : "Inactive";

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 12,
        background: "#fff",
        display: "grid",
        gridTemplateColumns: "90px 1fr 220px",
        gap: 12,
        alignItems: "center"
      }}
    >
      <div style={{ width: 90, height: 70, background: "#f3f3f3", borderRadius: 10, overflow: "hidden" }}>
        {stall.image_path ? (
          <img src={stall.image_path} alt={stall.stall_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ fontSize: 12, opacity: 0.6, padding: 8 }}>No image</div>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 900 }}>
            #{stall.stall_number} — {stall.stall_name}
          </div>
          <span
            style={{
              fontSize: 12,
              padding: "2px 8px",
              borderRadius: 999,
              border: "1px solid #eee",
              background: stall.is_active ? "#e9fff0" : "#fff1f1",
              color: stall.is_active ? "#0a6b2b" : "#a10000"
            }}
          >
            {statusLabel}
          </span>
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis" }}>
          {stall.id}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
        <button onClick={() => onEdit(stall)}>Edit</button>

        {/* Status dropdown: Active/Inactive */}
        <select
          value={stall.is_active ? "active" : "inactive"}
          onChange={(e) => onSetActive(stall, e.target.value === "active")}
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
    <div style={{ display: "grid", gap: 14 }}>
      {/* Dashboard stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Stat label="Total stalls" value={stats.total} />
        <Stat label="Active stalls" value={stats.active} />
        <Stat label="Inactive stalls" value={stats.inactive} />
      </div>

      {err ? (
        <div style={{ padding: 10, borderRadius: 12, border: "1px solid #ffb3b3", background: "#ffe9e9", color: "#8a0000" }}>
          {err}
        </div>
      ) : null}

      {msg ? (
        <div style={{ padding: 10, borderRadius: 12, border: "1px solid #9be59b", background: "#e7ffe7" }}>
          {msg}
        </div>
      ) : null}

      <Card title="Key Rotation (Ed25519)" right={<div style={{ fontSize: 12, opacity: 0.7 }}>Requires admin password</div>}>
        <form onSubmit={rotateKey} style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="password"
            placeholder="Confirm admin password"
            value={rotatePassword}
            onChange={(e) => setRotatePassword(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit">Rotate Key</button>
        </form>
      </Card>

      {/* Reports */}
      <AdminReports />

      <Card title="Create Stall" right={<div style={{ fontSize: 12, opacity: 0.7 }}>New stalls are Active by default</div>}>
        <form onSubmit={createStall} style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              Stall Number
              <input
                value={create.stall_number}
                onChange={(e) => setCreate((p) => ({ ...p, stall_number: e.target.value }))}
                placeholder="e.g. 10"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              Stall Name
              <input
                value={create.stall_name}
                onChange={(e) => setCreate((p) => ({ ...p, stall_name: e.target.value }))}
                placeholder="e.g. Rice Meals Corner"
              />
            </label>
          </div>

          <label style={{ display: "grid", gap: 6 }}>
            Stall Image (optional)
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setCreate((p) => ({ ...p, image: e.target.files?.[0] || null }))}
            />
          </label>

          <div>
            <button type="submit">Create Stall</button>
          </div>

          <div style={{ fontSize: 12, opacity: 0.7 }}>
            To deactivate/reactivate, use the status dropdown in “Manage Stalls”.
          </div>
        </form>
      </Card>

      <Card
        title="Manage Stalls"
        right={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
              Show:
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </label>
            <button onClick={loadStalls}>Refresh</button>
          </div>
        }
      >
        {editing ? (
          <form
            onSubmit={saveEdit}
            style={{ padding: 12, border: "1px solid #eee", borderRadius: 14, marginBottom: 12, background: "#fafafa" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>
                Editing: #{editing.stall_number} — {editing.stall_name}
              </div>
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  Stall Number
                  <input value={editForm.stall_number} onChange={(e) => setEditForm((p) => ({ ...p, stall_number: e.target.value }))} />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  Stall Name
                  <input value={editForm.stall_name} onChange={(e) => setEditForm((p) => ({ ...p, stall_name: e.target.value }))} />
                </label>
              </div>

              <label style={{ display: "grid", gap: 6 }}>
                Replace Image (optional)
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setEditForm((p) => ({ ...p, image: e.target.files?.[0] || null }))}
                />
              </label>

              <div>
                <button type="submit">Save Changes</button>
              </div>

              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Status is controlled by the dropdown on each stall row.
              </div>
            </div>
          </form>
        ) : null}

        <div style={{ display: "grid", gap: 10 }}>
          {filteredStalls.map((s) => (
            <StallRow key={s.id} stall={s} onEdit={startEdit} onSetActive={setActive} />
          ))}
          {filteredStalls.length === 0 ? <div style={{ opacity: 0.7 }}>No stalls for this filter.</div> : null}
        </div>
      </Card>
    </div>
  );
}