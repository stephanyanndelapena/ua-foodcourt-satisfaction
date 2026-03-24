const express = require("express");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { pool } = require("../db");

const router = express.Router();

router.post("/login", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { email, password } = parsed.data;

  const { rows } = await pool.query(
    "SELECT id, name, email, password_hash, role FROM app_users WHERE email=$1",
    [email]
  );

  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  res.json({ user: req.session.user });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie(process.env.SESSION_COOKIE_NAME || "ua_sid");
    res.json({ ok: true });
  });
});

router.get("/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

module.exports = router;