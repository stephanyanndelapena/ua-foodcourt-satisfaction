import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import EvaluationForm from "../ui/EvaluationForm";
import "./StudentHome.css";

function StallCard({ stall, onClick }) {
  return (
    <div onClick={onClick} className="stallCard">
      <div className="stallCard__media">
        {stall.image_path ? (
          <img src={stall.image_path} alt={stall.stall_name} className="stallCard__img" />
        ) : (
          <div className="stallCard__noimg">No image</div>
        )}

        {/* Hover-only overlay */}
        <div className="stallCard__overlay">
          <div className="stallCard__overlayInner">
            <div className="stallCard__name">{stall.stall_name}</div>
            <div className="stallCard__number">Stall #{stall.stall_number}</div>
          </div>
        </div>
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
    <div className="studentHome">
      {msg && <div className="studentHome__success">{msg}</div>}

      {!selected ? (
        <>
          <h3 className="studentHome__title">Select a stall to evaluate</h3>
          <div className="studentHome__grid">
            {stalls.map((s) => (
              <StallCard key={s.id} stall={s} onClick={() => setSelected(s)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setSelected(null)} className="studentHome__backBtn" style={{ marginBottom: 12 }}>
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