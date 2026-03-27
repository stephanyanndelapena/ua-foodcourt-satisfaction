import { useState } from "react";
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

function Rating({ label, value, onChange, name }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: 12,
        alignItems: "center",
        padding: "10px 0",
        borderBottom: `1px solid ${UI.colors.border}`
      }}
    >
      <div style={{ color: UI.colors.text, fontWeight: 400 }}>{label}</div>

      <div
        role="radiogroup"
        aria-label={label}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
          alignItems: "center"
        }}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const checked = value === n;

          return (
            <label
              key={n}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                userSelect: "none",
                border: `1px solid ${checked ? UI.colors.mustard : UI.colors.border}`,
                background: checked ? "rgba(201,162,39,0.18)" : UI.colors.bg,
                color: UI.colors.text,
                borderRadius: UI.radius.control,
                padding: "10px 0",
                lineHeight: 1
              }}
              title={n === 1 ? "Poor" : n === 5 ? "Excellent" : String(n)}
            >
              <input
                type="radio"
                name={name}
                value={n}
                checked={checked}
                onChange={() => onChange(n)}
                style={{
                  accentColor: UI.colors.mustard,
                  margin: 0
                }}
              />
              <span style={{ fontWeight: 700 }}>{n}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function EvaluationForm({ stall, onSubmitted }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Remove default "5" selection: start all ratings as null (unselected)
  const [form, setForm] = useState({
    friendliness_of_staff: null,
    speed_of_service: null,
    accuracy_of_order: null,

    taste_of_food: null,
    food_freshness: null,
    food_presentation: null,
    portion_size: null,

    cleanliness_of_stall: null,
    overall_comfort: null,

    affordability_of_food: null,
    value_for_money: null,

    liked_most: "",
    can_be_improved: "",
    suggestions: ""
  });

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);

    try {
      const data = await apiFetch("/api/evaluations", {
        method: "POST",
        body: JSON.stringify({ stall_id: stall.id, ...form })
      });
      onSubmitted(data);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setSaving(false);
    }
  }

  const textareaStyle = {
    border: `1px solid ${UI.colors.border}`,
    background: UI.colors.bg,
    color: UI.colors.text,
    borderRadius: UI.radius.control,
    padding: "10px 12px",
    outline: "none",
    resize: "vertical"
  };

  const sectionTitleStyle = {
    margin: "0 0 10px 0",
    color: UI.colors.text,
    letterSpacing: 0.2,
    fontWeight: 900 // only categories are bold
  };

  return (
    <form
      onSubmit={submit}
      style={{
        border: `1px solid ${UI.colors.border}`,
        borderRadius: UI.radius.card,
        padding: 16,
        background: UI.colors.bg,
        boxShadow: UI.shadowSoft
      }}
    >
      <h4 style={sectionTitleStyle}>Service Evaluation</h4>
      <Rating
        name="friendliness_of_staff"
        label="Friendliness of Staff"
        value={form.friendliness_of_staff}
        onChange={(v) => setField("friendliness_of_staff", v)}
      />
      <Rating
        name="speed_of_service"
        label="Speed of Service"
        value={form.speed_of_service}
        onChange={(v) => setField("speed_of_service", v)}
      />
      <Rating
        name="accuracy_of_order"
        label="Accuracy of order"
        value={form.accuracy_of_order}
        onChange={(v) => setField("accuracy_of_order", v)}
      />

      <h4 style={{ ...sectionTitleStyle, margin: "14px 0 10px 0" }}>Food Quality</h4>
      <Rating
        name="taste_of_food"
        label="Taste of food"
        value={form.taste_of_food}
        onChange={(v) => setField("taste_of_food", v)}
      />
      <Rating
        name="food_freshness"
        label="Food freshness"
        value={form.food_freshness}
        onChange={(v) => setField("food_freshness", v)}
      />
      <Rating
        name="food_presentation"
        label="Food presentation"
        value={form.food_presentation}
        onChange={(v) => setField("food_presentation", v)}
      />
      <Rating
        name="portion_size"
        label="Portion size"
        value={form.portion_size}
        onChange={(v) => setField("portion_size", v)}
      />

      <h4 style={{ ...sectionTitleStyle, margin: "14px 0 10px 0" }}>Cleanliness & Environment</h4>
      <Rating
        name="cleanliness_of_stall"
        label="Cleanliness of food stall"
        value={form.cleanliness_of_stall}
        onChange={(v) => setField("cleanliness_of_stall", v)}
      />
      <Rating
        name="overall_comfort"
        label="Overall comfort of the canteen"
        value={form.overall_comfort}
        onChange={(v) => setField("overall_comfort", v)}
      />

      <h4 style={{ ...sectionTitleStyle, margin: "14px 0 10px 0" }}>Price & Value</h4>
      <Rating
        name="affordability_of_food"
        label="Affordability of food"
        value={form.affordability_of_food}
        onChange={(v) => setField("affordability_of_food", v)}
      />
      <Rating
        name="value_for_money"
        label="Value for money"
        value={form.value_for_money}
        onChange={(v) => setField("value_for_money", v)}
      />

      <h4 style={{ ...sectionTitleStyle, margin: "14px 0 10px 0" }}>Additional Feedback (optional)</h4>

      <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: UI.colors.muted, fontWeight: 400 }}>What did you like most?</span>
        <textarea
          value={form.liked_most}
          onChange={(e) => setField("liked_most", e.target.value)}
          rows={2}
          style={textareaStyle}
        />
      </label>

      <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: UI.colors.muted, fontWeight: 400 }}>What can be improved?</span>
        <textarea
          value={form.can_be_improved}
          onChange={(e) => setField("can_be_improved", e.target.value)}
          rows={2}
          style={textareaStyle}
        />
      </label>

      <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: UI.colors.muted, fontWeight: 400 }}>Suggestions for the canteen</span>
        <textarea
          value={form.suggestions}
          onChange={(e) => setField("suggestions", e.target.value)}
          rows={2}
          style={textareaStyle}
        />
      </label>

      {err && (
        <div
          style={{
            color: UI.colors.red,
            background: "rgba(122,16,32,0.08)",
            border: `1px solid rgba(122,16,32,0.35)`,
            padding: 10,
            borderRadius: UI.radius.control,
            marginBottom: 12,
            fontWeight: 400
          }}
        >
          {err}
        </div>
      )}

      <button
        disabled={saving}
        type="submit"
        style={{
          border: `1px solid ${UI.colors.mustard}`,
          background: saving ? "rgba(201,162,39,0.65)" : UI.colors.mustard,
          color: UI.colors.text,
          borderRadius: UI.radius.control,
          padding: "10px 12px",
          fontWeight: 900,
          cursor: saving ? "not-allowed" : "pointer"
        }}
      >
        {saving ? "Submitting..." : "Submit Evaluation"}
      </button>

      <div style={{ fontSize: 12, color: UI.colors.muted, marginTop: 10, fontWeight: 400 }}>
        Evaluation date is forced to the server’s today (no manual input).
      </div>
    </form>
  );
}