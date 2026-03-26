import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";

const UI = {
  colors: {
    bg: "#FFFFFF",
    text: "#0B1F3B", // dark blue
    muted: "rgba(11, 31, 59, 0.65)",
    border: "rgba(11, 31, 59, 0.12)",
    soft: "rgba(11, 31, 59, 0.04)",
    blue: "#0B1F3B",
    red: "#7A1020", // dark red
    mustard: "#C9A227" // mustard yellow
  },
  radius: {
    card: 16,
    control: 12
  },
  shadowSoft: "0 8px 20px rgba(11,31,59,0.06)"
};

function todayLocalYYYYMMDD() {
  // For UI only. Server still enforces eval_date on insert.
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        border: `1px solid ${UI.colors.border}`,
        borderRadius: UI.radius.card,
        padding: 12,
        background: UI.colors.bg,
        boxShadow: UI.shadowSoft
      }}
    >
      <div style={{ fontSize: 12, color: UI.colors.muted }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: 18, color: UI.colors.text, marginTop: 4 }}>{value ?? "-"}</div>
    </div>
  );
}

export default function AdminReports() {
  const [date, setDate] = useState(todayLocalYYYYMMDD());
  const [daily, setDaily] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [comments, setComments] = useState([]);
  const [err, setErr] = useState("");
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const summary = useMemo(() => {
    const totalResponses = daily.reduce((a, r) => a + Number(r.responses || 0), 0);
    const stallsWithResponses = daily.length;
    return { totalResponses, stallsWithResponses };
  }, [daily]);

  async function loadDaily() {
    setErr("");
    setLoadingDaily(true);
    setSelectedStall(null);
    setComments([]);
    try {
      const data = await apiFetch(`/api/admin/reports/daily?date=${encodeURIComponent(date)}`);
      setDaily(data.daily);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoadingDaily(false);
    }
  }

  async function loadComments(stall) {
    setErr("");
    setLoadingComments(true);
    setSelectedStall(stall);
    try {
      const data = await apiFetch(`/api/admin/reports/stall/${stall.stall_id}/comments?date=${encodeURIComponent(date)}`);
      setComments(data.comments);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoadingComments(false);
    }
  }

  useEffect(() => {
    loadDaily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      style={{
        padding: 16,
        border: `1px solid ${UI.colors.border}`,
        borderRadius: UI.radius.card,
        background: UI.colors.bg,
        boxShadow: UI.shadowSoft
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h3 style={{ margin: 0, color: UI.colors.text, letterSpacing: 0.2 }}>Admin Reports</h3>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", color: UI.colors.text }}>
            <span style={{ fontSize: 12, color: UI.colors.muted }}>Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                border: `1px solid ${UI.colors.border}`,
                background: UI.colors.bg,
                color: UI.colors.text,
                borderRadius: UI.radius.control,
                padding: "8px 10px",
                outline: "none"
              }}
            />
          </label>
          <button
            onClick={loadDaily}
            disabled={loadingDaily}
            style={{
              border: `1px solid ${UI.colors.blue}`,
              background: loadingDaily ? "rgba(11,31,59,0.65)" : UI.colors.blue,
              color: "#fff",
              borderRadius: UI.radius.control,
              padding: "10px 12px",
              fontWeight: 900,
              cursor: loadingDaily ? "not-allowed" : "pointer"
            }}
          >
            {loadingDaily ? "Loading..." : "Load"}
          </button>
        </div>
      </div>

      <div style={{ fontSize: 12, color: UI.colors.muted, marginTop: 6 }}>
        Shows totals for the selected date. Click a stall row to view student comments.
      </div>

      {err ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: UI.radius.card,
            border: `1px solid rgba(122,16,32,0.35)`,
            background: "rgba(122,16,32,0.08)",
            color: UI.colors.red
          }}
        >
          {err}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 14 }}>
        <Stat label="Stalls with responses" value={summary.stallsWithResponses} />
        <Stat label="Total responses" value={summary.totalResponses} />
      </div>

      <hr style={{ margin: "16px 0", border: "none", borderTop: `1px solid ${UI.colors.border}` }} />

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              {[
                "Stall",
                "Responses",
                "Service Avg",
                "Food Avg",
                "Cleanliness Avg",
                "Price Avg",
                "Overall Avg"
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: 10,
                    fontSize: 12,
                    color: UI.colors.muted,
                    borderBottom: `1px solid ${UI.colors.border}`,
                    background: UI.colors.bg,
                    position: "sticky",
                    top: 0
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daily.map((r) => (
              <tr
                key={r.stall_id}
                onClick={() => loadComments(r)}
                style={{
                  cursor: "pointer",
                  background: selectedStall?.stall_id === r.stall_id ? "rgba(201,162,39,0.14)" : "transparent"
                }}
              >
                <td style={{ padding: 10, borderBottom: `1px solid ${UI.colors.border}` }}>
                  <div style={{ fontWeight: 900, color: UI.colors.text }}>
                    #{r.stall_number} — {r.stall_name}
                  </div>
                  <div style={{ fontSize: 12, color: UI.colors.muted }}>{r.eval_date}</div>
                </td>
                <td style={{ padding: 10, borderBottom: `1px solid ${UI.colors.border}`, color: UI.colors.text }}>{r.responses}</td>
                <td style={{ padding: 10, borderBottom: `1px solid ${UI.colors.border}`, color: UI.colors.text }}>{r.service_avg}</td>
                <td style={{ padding: 10, borderBottom: `1px solid ${UI.colors.border}`, color: UI.colors.text }}>{r.food_avg}</td>
                <td style={{ padding: 10, borderBottom: `1px solid ${UI.colors.border}`, color: UI.colors.text }}>{r.cleanliness_avg}</td>
                <td style={{ padding: 10, borderBottom: `1px solid ${UI.colors.border}`, color: UI.colors.text }}>{r.price_avg}</td>
                <td style={{ padding: 10, borderBottom: `1px solid ${UI.colors.border}`, color: UI.colors.text, fontWeight: 900 }}>
                  {r.overall_avg}
                </td>
              </tr>
            ))}
            {daily.length === 0 && !loadingDaily ? (
              <tr>
                <td colSpan={7} style={{ padding: 12, color: UI.colors.muted }}>
                  No evaluations found for {date}.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <hr style={{ margin: "16px 0", border: "none", borderTop: `1px solid ${UI.colors.border}` }} />

      <div>
        <h4 style={{ margin: "0 0 10px 0", color: UI.colors.text }}>
          {selectedStall ? `Comments — #${selectedStall.stall_number} ${selectedStall.stall_name}` : "Comments"}
        </h4>

        {loadingComments ? <div style={{ color: UI.colors.muted }}>Loading comments...</div> : null}

        {!selectedStall ? (
          <div style={{ color: UI.colors.muted }}>Click a stall row above to view comments.</div>
        ) : comments.length === 0 ? (
          <div style={{ color: UI.colors.muted }}>No comments for this stall on {date}.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  border: `1px solid ${UI.colors.border}`,
                  borderRadius: UI.radius.card,
                  padding: 14,
                  background: UI.colors.bg,
                  boxShadow: UI.shadowSoft
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 900, color: UI.colors.text }}>
                    {c.student_name}{" "}
                    <span style={{ fontWeight: 400, color: UI.colors.muted }}>({c.student_email})</span>
                  </div>
                  <div style={{ fontSize: 12, color: UI.colors.muted }}>{new Date(c.created_at).toLocaleString()}</div>
                </div>

                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, color: UI.colors.muted, marginBottom: 4 }}>What did you like most?</div>
                    <div style={{ color: UI.colors.text }}>{c.liked_most || <span style={{ color: UI.colors.muted }}>(empty)</span>}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: UI.colors.muted, marginBottom: 4 }}>What can be improved?</div>
                    <div style={{ color: UI.colors.text }}>
                      {c.can_be_improved || <span style={{ color: UI.colors.muted }}>(empty)</span>}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: UI.colors.muted, marginBottom: 4 }}>Suggestions</div>
                    <div style={{ color: UI.colors.text }}>
                      {c.suggestions || <span style={{ color: UI.colors.muted }}>(empty)</span>}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, fontSize: 12, color: UI.colors.muted }}>
                  Evaluation ID: {c.id} | Key version: {c.key_version}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}