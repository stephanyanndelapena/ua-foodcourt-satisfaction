const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// Student list: only active stalls
router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, stall_number, stall_name, image_path FROM stalls WHERE is_active=true ORDER BY stall_number ASC"
  );
  res.json({ stalls: rows });
});

module.exports = router;