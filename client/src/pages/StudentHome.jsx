import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import EvaluationForm from "../ui/EvaluationForm";

function StallCard({ stall, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        background: "#fff"
      }}
    >
      <div style={{ height: 140, background: "#f3f3f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {stall.image_path ? (
          <img
            src={stall.image_path}
            alt={stall.stall_name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ opacity: 0.6 }}>No image</div>
        )}
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 700 }}>{stall.stall_name}</div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>Stall #{stall.stall_number}</div>
      </div>
    </div>
  );
}

export default function StudentHome() {
  const [stalls, setStalls] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");

  async function loadStalls() {
    const data = await apiFetch("/api/stalls");
    setStalls(data.stalls);
  }

  useEffect(() => {
    loadStalls();
  }, []);

  return (
    <div>
      {msg && <div style={{ background: "#e7ffe7", border: "1px solid #9be59b", padding: 10, borderRadius: 8 }}>{msg}</div>}

      {!selected ? (
        <>
          <h3>Select a stall to evaluate</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {stalls.map((s) => (
              <StallCard key={s.id} stall={s} onClick={() => setSelected(s)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setSelected(null)} style={{ marginBottom: 12 }}>
            ← Back to stalls
          </button>
          <h3>
            Evaluate: {selected.stall_name} (#{selected.stall_number})
          </h3>

          <EvaluationForm
            stall={selected}
            onSubmitted={(info) => {
              setMsg(`Submitted! Evaluation date forced to server today: ${info.eval_date}`);
              setSelected(null);
            }}
          />
        </>
      )}
    </div>
  );
}