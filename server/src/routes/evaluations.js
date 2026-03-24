const express = require("express");
const { z } = require("zod");
const { pool } = require("../db");
const { requireAuth } = require("../auth");
const { stableStringify, signPayload } = require("../crypto/ed25519");

const router = express.Router();

function todayDateStringUTC() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

router.post("/", requireAuth, async (req, res) => {
  const schema = z.object({
    stall_id: z.string().uuid(),

    friendliness_of_staff: z.number().int().min(1).max(5),
    speed_of_service: z.number().int().min(1).max(5),
    accuracy_of_order: z.number().int().min(1).max(5),

    taste_of_food: z.number().int().min(1).max(5),
    food_freshness: z.number().int().min(1).max(5),
    food_presentation: z.number().int().min(1).max(5),
    portion_size: z.number().int().min(1).max(5),

    cleanliness_of_stall: z.number().int().min(1).max(5),
    overall_comfort: z.number().int().min(1).max(5),

    affordability_of_food: z.number().int().min(1).max(5),
    value_for_money: z.number().int().min(1).max(5),

    liked_most: z.string().max(2000).optional().nullable(),
    can_be_improved: z.string().max(2000).optional().nullable(),
    suggestions: z.string().max(2000).optional().nullable()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const userId = req.session.user.id;
  const eval_date = todayDateStringUTC();

  const keyRes = await pool.query(
    "SELECT version, private_key_b64 FROM signing_keys WHERE is_active=true LIMIT 1"
  );
  const activeKey = keyRes.rows[0];
  if (!activeKey) return res.status(500).json({ error: "No active signing key configured" });

  const payload = {
    stall_id: parsed.data.stall_id,
    user_id: userId,
    eval_date,

    friendliness_of_staff: parsed.data.friendliness_of_staff,
    speed_of_service: parsed.data.speed_of_service,
    accuracy_of_order: parsed.data.accuracy_of_order,

    taste_of_food: parsed.data.taste_of_food,
    food_freshness: parsed.data.food_freshness,
    food_presentation: parsed.data.food_presentation,
    portion_size: parsed.data.portion_size,

    cleanliness_of_stall: parsed.data.cleanliness_of_stall,
    overall_comfort: parsed.data.overall_comfort,

    affordability_of_food: parsed.data.affordability_of_food,
    value_for_money: parsed.data.value_for_money,

    liked_most: parsed.data.liked_most || null,
    can_be_improved: parsed.data.can_be_improved || null,
    suggestions: parsed.data.suggestions || null
  };

  const payloadString = stableStringify(payload);
  const signature_b64 = signPayload(activeKey.private_key_b64, payloadString);

  try {
    const insert = await pool.query(
      `INSERT INTO evaluations (
        stall_id, user_id, eval_date,
        friendliness_of_staff, speed_of_service, accuracy_of_order,
        taste_of_food, food_freshness, food_presentation, portion_size,
        cleanliness_of_stall, overall_comfort,
        affordability_of_food, value_for_money,
        liked_most, can_be_improved, suggestions,
        key_version, payload_json, signature_b64
      ) VALUES (
        $1,$2,$3,
        $4,$5,$6,
        $7,$8,$9,$10,
        $11,$12,
        $13,$14,
        $15,$16,$17,
        $18,$19,$20
      )
      RETURNING id`,
      [
        payload.stall_id, payload.user_id, payload.eval_date,

        payload.friendliness_of_staff,
        payload.speed_of_service,
        payload.accuracy_of_order,

        payload.taste_of_food,
        payload.food_freshness,
        payload.food_presentation,
        payload.portion_size,

        payload.cleanliness_of_stall,
        payload.overall_comfort,

        payload.affordability_of_food,
        payload.value_for_money,

        payload.liked_most,
        payload.can_be_improved,
        payload.suggestions,

        activeKey.version,
        payload,
        signature_b64
      ]
    );

    res.json({ ok: true, evaluation_id: insert.rows[0].id, eval_date });
  } catch (e) {
    if (String(e.code) === "23505") {
      return res.status(409).json({ error: "Already submitted evaluation for this stall today." });
    }
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;