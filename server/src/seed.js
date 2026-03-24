require("dotenv").config();
const bcrypt = require("bcrypt");
const { pool } = require("./db");
const { generateKeypair } = require("./crypto/ed25519");

async function main() {
  // Create initial signing key if none exists
  const k = await pool.query("SELECT COUNT(*)::int AS c FROM signing_keys");
  if (k.rows[0].c === 0) {
    const kp = generateKeypair();
    await pool.query(
      `INSERT INTO signing_keys (version, public_key_b64, private_key_b64, is_active)
       VALUES (1,$1,$2,true)`,
      [kp.public_key_b64, kp.private_key_b64]
    );
    console.log("Inserted signing key version 1 (active).");
  } else {
    console.log("Signing keys already exist.");
  }

  // Admin
  const adminEmail = "admin@ua.edu";
  const existingAdmin = await pool.query("SELECT id FROM app_users WHERE email=$1", [adminEmail]);
  if (existingAdmin.rows.length === 0) {
    const password_hash = await bcrypt.hash("Admin123!", 10);
    await pool.query(
      `INSERT INTO app_users (name, email, password_hash, role)
       VALUES ($1,$2,$3,'admin')`,
      ["UA Admin", adminEmail, password_hash]
    );
    console.log("Created admin: admin@ua.edu / Admin123!");
  } else {
    console.log("Admin already exists.");
  }

  // Student
  const studentEmail = "student@ua.edu";
  const existingStudent = await pool.query("SELECT id FROM app_users WHERE email=$1", [studentEmail]);
  if (existingStudent.rows.length === 0) {
    const password_hash = await bcrypt.hash("Student123!", 10);
    await pool.query(
      `INSERT INTO app_users (student_id, name, email, password_hash, role)
       VALUES ($1,$2,$3,$4,'student')`,
      ["2026-0001", "Sample Student", studentEmail, password_hash]
    );
    console.log("Created student: student@ua.edu / Student123!");
  } else {
    console.log("Student already exists.");
  }

  // Sample stalls
  const s = await pool.query("SELECT COUNT(*)::int AS c FROM stalls");
  if (s.rows[0].c === 0) {
    await pool.query(
      `INSERT INTO stalls (stall_number, stall_name, image_path, is_active)
       VALUES
       (1, 'Chicken House', NULL, true),
       (2, 'Noodle Bar', NULL, true),
       (3, 'Grill Corner', NULL, true)`
    );
    console.log("Inserted sample stalls.");
  } else {
    console.log("Stalls already exist.");
  }
}

main()
  .then(() => pool.end())
  .catch((e) => {
    console.error(e);
    pool.end();
    process.exit(1);
  });