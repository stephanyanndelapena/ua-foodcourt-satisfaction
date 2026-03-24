import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";

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
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 18 }}>{value ?? "-"}</div>
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
      const data = await apiFetch(
        `/api/admin/reports/stall/${stall.stall_id}/comments?date=${encodeURIComponent(date)}`
      );
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
    <section style={{ padding: 14, border: "1px solid #ddd", borderRadius: 12, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h3 style={{ margin: 0 }}>Admin Reports</h3>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Date:
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <button onClick={loadDaily} disabled={loadingDaily}>
            {loadingDaily ? "Loading..." : "Load"}
          </button>
        </div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
        Shows totals for the selected date. Click a stall row to view student comments.
      </div>

      {err ? (
        <div style={{ marginTop: 10, padding: 10, borderRadius: 10, border: "1px solid #ffb3b3", background: "#ffe9e9", color: "#8a0000" }}>
          {err}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 12 }}>
        <Stat label="Stalls with responses" value={summary.stallsWithResponses} />
        <Stat label="Total responses" value={summary.totalResponses} />
      </div>

      <hr style={{ margin: "14px 0" }} />

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
              <th style={{ padding: 8 }}>Stall</th>
              <th style={{ padding: 8 }}>Responses</th>
              <th style={{ padding: 8 }}>Service Avg</th>
              <th style={{ padding: 8 }}>Food Avg</th>
              <th style={{ padding: 8 }}>Cleanliness Avg</th>
              <th style={{ padding: 8 }}>Price Avg</th>
              <th style={{ padding: 8 }}>Overall Avg</th>
            </tr>
          </thead>
          <tbody>
            {daily.map((r) => (
              <tr
                key={r.stall_id}
                onClick={() => loadComments(r)}
                style={{
                  cursor: "pointer",
                  background: selectedStall?.stall_id === r.stall_id ? "#f3f7ff" : "transparent",
                  borderBottom: "1px solid #f2f2f2"
                }}
              >
                <td style={{ padding: 8 }}>
                  <div style={{ fontWeight: 800 }}>
                    #{r.stall_number} — {r.stall_name}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{r.eval_date}</div>
                </td>
                <td style={{ padding: 8 }}>{r.responses}</td>
                <td style={{ padding: 8 }}>{r.service_avg}</td>
                <td style={{ padding: 8 }}>{r.food_avg}</td>
                <td style={{ padding: 8 }}>{r.cleanliness_avg}</td>
                <td style={{ padding: 8 }}>{r.price_avg}</td>
                <td style={{ padding: 8, fontWeight: 800 }}>{r.overall_avg}</td>
              </tr>
            ))}
            {daily.length === 0 && !loadingDaily ? (
              <tr>
                <td colSpan={7} style={{ padding: 12, opacity: 0.7 }}>
                  No evaluations found for {date}.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <hr style={{ margin: "14px 0" }} />

      <div>
        <h4 style={{ margin: "0 0 10px 0" }}>
          {selectedStall ? `Comments — #${selectedStall.stall_number} ${selectedStall.stall_name}` : "Comments"}
        </h4>

        {loadingComments ? <div>Loading comments...</div> : null}

        {!selectedStall ? (
          <div style={{ opacity: 0.7 }}>Click a stall row above to view comments.</div>
        ) : comments.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No comments for this stall on {date}.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {comments.map((c) => (
              <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fafafa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>
                    {c.student_name} <span style={{ fontWeight: 400, opacity: 0.7 }}>({c.student_email})</span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>What did you like most?</div>
                    <div>{c.liked_most || <span style={{ opacity: 0.6 }}>(empty)</span>}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>What can be improved?</div>
                    <div>{c.can_be_improved || <span style={{ opacity: 0.6 }}>(empty)</span>}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>Suggestions</div>
                    <div>{c.suggestions || <span style={{ opacity: 0.6 }}>(empty)</span>}</div>
                  </div>
                </div>

                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
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