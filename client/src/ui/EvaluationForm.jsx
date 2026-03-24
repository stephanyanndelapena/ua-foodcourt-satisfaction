import { useState } from "react";
import { apiFetch } from "../api";

function Rating({ label, value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 10, alignItems: "center", padding: "6px 0" }}>
      <div>{label}</div>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        <option value={1}>1 - Poor</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>5 - Excellent</option>
      </select>
    </div>
  );
}

export default function EvaluationForm({ stall, onSubmitted }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    friendliness_of_staff: 5,
    speed_of_service: 5,
    accuracy_of_order: 5,

    taste_of_food: 5,
    food_freshness: 5,
    food_presentation: 5,
    portion_size: 5,

    cleanliness_of_stall: 5,
    overall_comfort: 5,

    affordability_of_food: 5,
    value_for_money: 5,

    liked_most: "",
    can_be_improved: "",
    suggestions: ""
  });

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
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

  return (
    <form onSubmit={submit} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, background: "#fff" }}>
      <h4>Service Evaluation</h4>
      <Rating label="Friendliness of Staff" value={form.friendliness_of_staff} onChange={(v) => setField("friendliness_of_staff", v)} />
      <Rating label="Speed of Service" value={form.speed_of_service} onChange={(v) => setField("speed_of_service", v)} />
      <Rating label="Accuracy of order" value={form.accuracy_of_order} onChange={(v) => setField("accuracy_of_order", v)} />

      <h4>Food Quality</h4>
      <Rating label="Taste of food" value={form.taste_of_food} onChange={(v) => setField("taste_of_food", v)} />
      <Rating label="Food freshness" value={form.food_freshness} onChange={(v) => setField("food_freshness", v)} />
      <Rating label="Food presentation" value={form.food_presentation} onChange={(v) => setField("food_presentation", v)} />
      <Rating label="Portion size" value={form.portion_size} onChange={(v) => setField("portion_size", v)} />

      <h4>Cleanliness & Environment</h4>
      <Rating label="Cleanliness of food stall" value={form.cleanliness_of_stall} onChange={(v) => setField("cleanliness_of_stall", v)} />
      <Rating label="Overall comfort of the canteen" value={form.overall_comfort} onChange={(v) => setField("overall_comfort", v)} />

      <h4>Price & Value</h4>
      <Rating label="Affordability of food" value={form.affordability_of_food} onChange={(v) => setField("affordability_of_food", v)} />
      <Rating label="Value for money" value={form.value_for_money} onChange={(v) => setField("value_for_money", v)} />

      <h4>Additional Feedback (optional)</h4>
      <label style={{ display: "grid", gap: 6, marginBottom: 10 }}>
        What did you like most?
        <textarea value={form.liked_most} onChange={(e) => setField("liked_most", e.target.value)} rows={2} />
      </label>
      <label style={{ display: "grid", gap: 6, marginBottom: 10 }}>
        What can be improved?
        <textarea value={form.can_be_improved} onChange={(e) => setField("can_be_improved", e.target.value)} rows={2} />
      </label>
      <label style={{ display: "grid", gap: 6, marginBottom: 10 }}>
        Suggestions for the canteen
        <textarea value={form.suggestions} onChange={(e) => setField("suggestions", e.target.value)} rows={2} />
      </label>

      {err && <div style={{ color: "crimson", marginBottom: 10 }}>{err}</div>}

      <button disabled={saving} type="submit">
        {saving ? "Submitting..." : "Submit Evaluation"}
      </button>

      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 10 }}>
        Evaluation date is forced to the server’s today (no manual input).
      </div>
    </form>
  );
}