const express = require("express");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { pool } = require("../db");
const { requireAdmin } = require("../auth");
const { upload } = require("../upload");
const { generateKeypair, verifySignature, stableStringify } = require("../crypto/ed25519");

const router = express.Router();

/** Admin list all stalls */
router.get("/stalls", requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, stall_number, stall_name, image_path, is_active, created_at, updated_at FROM stalls ORDER BY stall_number ASC"
  );
  res.json({ stalls: rows });
});

/** Create stall with local image */
router.post("/stalls", requireAdmin, upload.single("image"), async (req, res) => {
  const schema = z.object({
    stall_number: z.coerce.number().int().min(1),
    stall_name: z.string().min(1).max(200),
    is_active: z.coerce.boolean().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const image_path = req.file ? `/uploads/${req.file.filename}` : null;

  const { rows } = await pool.query(
    `INSERT INTO stalls (stall_number, stall_name, image_path, is_active)
     VALUES ($1,$2,$3,$4)
     RETURNING id, stall_number, stall_name, image_path, is_active`,
    [parsed.data.stall_number, parsed.data.stall_name, image_path, parsed.data.is_active ?? true]
  );

  res.json({ stall: rows[0] });
});

/** Update stall (optional image replace) */
router.put("/stalls/:id", requireAdmin, upload.single("image"), async (req, res) => {
  const schema = z.object({
    stall_number: z.coerce.number().int().min(1),
    stall_name: z.string().min(1).max(200),
    is_active: z.coerce.boolean()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const image_path = req.file ? `/uploads/${req.file.filename}` : null;

  const { rows } = await pool.query(
    `UPDATE stalls
     SET stall_number=$1,
         stall_name=$2,
         is_active=$3,
         image_path=COALESCE($4, image_path),
         updated_at=now()
     WHERE id=$5
     RETURNING id, stall_number, stall_name, image_path, is_active, updated_at`,
    [parsed.data.stall_number, parsed.data.stall_name, parsed.data.is_active, image_path, req.params.id]
  );

  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json({ stall: rows[0] });
});

// Soft delete => inactive (admin)
router.delete("/stalls/:id", requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    "UPDATE stalls SET is_active=false, updated_at=now() WHERE id=$1 RETURNING id",
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});
// Set stall active/inactive (admin)
router.patch("/stalls/:id/status", requireAdmin, async (req, res) => {
  const { is_active } = req.body || {};
  if (typeof is_active !== "boolean") {
    return res.status(400).json({ error: "is_active must be boolean" });
  }

  const { rows } = await pool.query(
    `UPDATE stalls
     SET is_active=$1, updated_at=now()
     WHERE id=$2
     RETURNING id, stall_number, stall_name, image_path, is_active, updated_at`,
    [is_active, req.params.id]
  );

  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json({ stall: rows[0] });
});
/** Rotate signing key (password-confirmed) */
router.post("/keys/rotate", requireAdmin, async (req, res) => {
  const schema = z.object({ admin_password: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const adminId = req.session.user.id;
  const adminRes = await pool.query("SELECT password_hash FROM app_users WHERE id=$1", [adminId]);
  const admin = adminRes.rows[0];
  if (!admin) return res.status(401).json({ error: "Admin not found" });

  const ok = await bcrypt.compare(parsed.data.admin_password, admin.password_hash);
  if (!ok) return res.status(401).json({ error: "Password confirmation failed" });

  const vRes = await pool.query("SELECT COALESCE(MAX(version), 0) AS v FROM signing_keys");
  const nextVersion = Number(vRes.rows[0].v) + 1;

  const kp = generateKeypair();

  await pool.query("BEGIN");
  try {
    await pool.query("UPDATE signing_keys SET is_active=false WHERE is_active=true");
    await pool.query(
      `INSERT INTO signing_keys (version, public_key_b64, private_key_b64, is_active)
       VALUES ($1,$2,$3,true)`,
      [nextVersion, kp.public_key_b64, kp.private_key_b64]
    );
    await pool.query("COMMIT");
  } catch (e) {
    await pool.query("ROLLBACK");
    console.error(e);
    return res.status(500).json({ error: "Failed to rotate key" });
  }

  res.json({ ok: true, active_version: nextVersion });
});

/** Verify evaluation signature (admin) */
router.get("/evaluations/:id/verify", requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.id, e.payload_json, e.signature_b64, e.key_version, k.public_key_b64
     FROM evaluations e
     JOIN signing_keys k ON k.version = e.key_version
     WHERE e.id=$1`,
    [req.params.id]
  );
  const ev = rows[0];
  if (!ev) return res.status(404).json({ error: "Not found" });

  const payloadString = stableStringify(ev.payload_json);
  const valid = verifySignature(ev.public_key_b64, payloadString, ev.signature_b64);

  res.json({ valid, key_version: ev.key_version });
});
// Daily summaries per stall (admin)
// Query param: ?date=YYYY-MM-DD (optional). If not provided, returns latest dates available.
router.get("/reports/daily", requireAdmin, async (req, res) => {
  const date = req.query.date || null;

  const params = [];
  let where = "";
  if (date) {
    params.push(date);
    where = `WHERE e.eval_date = $1`;
  }

  const { rows } = await pool.query(
    `SELECT
      s.id AS stall_id,
      s.stall_number,
      s.stall_name,
      s.image_path,
      e.eval_date,
      COUNT(*) AS responses,

      ROUND(AVG((e.friendliness_of_staff + e.speed_of_service + e.accuracy_of_order)::numeric / 3), 2) AS service_avg,
      ROUND(AVG((e.taste_of_food + e.food_freshness + e.food_presentation + e.portion_size)::numeric / 4), 2) AS food_avg,
      ROUND(AVG((e.cleanliness_of_stall + e.overall_comfort)::numeric / 2), 2) AS cleanliness_avg,
      ROUND(AVG((e.affordability_of_food + e.value_for_money)::numeric / 2), 2) AS price_avg,

      ROUND(AVG((
        e.friendliness_of_staff + e.speed_of_service + e.accuracy_of_order +
        e.taste_of_food + e.food_freshness + e.food_presentation + e.portion_size +
        e.cleanliness_of_stall + e.overall_comfort +
        e.affordability_of_food + e.value_for_money
      )::numeric / 11), 2) AS overall_avg

    FROM evaluations e
    JOIN stalls s ON s.id = e.stall_id
    ${where}
    GROUP BY s.id, s.stall_number, s.stall_name, s.image_path, e.eval_date
    ORDER BY e.eval_date DESC, s.stall_number ASC`,
    params
  );

  res.json({ daily: rows });
});
// Comments per stall for a date
// /api/admin/reports/stall/:stallId/comments?date=YYYY-MM-DD (required)
router.get("/reports/stall/:stallId/comments", requireAdmin, async (req, res) => {
  const stallId = req.params.stallId;
  const date = req.query.date;

  if (!date) return res.status(400).json({ error: "date query param is required (YYYY-MM-DD)" });

  const { rows } = await pool.query(
    `SELECT
      e.id,
      e.eval_date,
      e.created_at,
      u.name AS student_name,
      u.email AS student_email,

      e.liked_most,
      e.can_be_improved,
      e.suggestions,

      e.key_version,
      e.signature_b64

    FROM evaluations e
    JOIN app_users u ON u.id = e.user_id
    WHERE e.stall_id = $1
      AND e.eval_date = $2
    ORDER BY e.created_at DESC`,
    [stallId, date]
  );

  res.json({ comments: rows });
});
module.exports = router;