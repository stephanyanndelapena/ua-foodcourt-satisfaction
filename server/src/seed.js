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
    const stalls = [
      { stall_number: 1, stall_name: "Juice World", image_path: "S1.jpg", is_active: true },
      { stall_number: 2, stall_name: "Siomai Shawarma King", image_path: "S2.jpg", is_active: true },
      { stall_number: 3, stall_name: "Yamskie Lugaw House", image_path: "S3.jpg", is_active: true },
      { stall_number: 4, stall_name: "Dak Piki Food Haus", image_path: "S4.jpg", is_active: true },
      { stall_number: 5, stall_name: "Dad Bob's Dimsum House", image_path: "S5.jpg", is_active: true },
      { stall_number: 6, stall_name: "Dumpling Madness", image_path: "S6.jpg", is_active: true },
      { stall_number: 7, stall_name: "Tita Didays", image_path: "S7.jpg", is_active: true },
      { stall_number: 8, stall_name: "Mommy Linda Snack Station", image_path: "S8.jpg", is_active: true },
      { stall_number: 9, stall_name: "My Little Kitchen", image_path: "S9.jpg", is_active: true },
      { stall_number: 10, stall_name: "Bossing's Snack Corner", image_path: "S10.jpg", is_active: true },
      { stall_number: 11, stall_name: "Waffle Time", image_path: "S11.jpg", is_active: true },
      { stall_number: 12, stall_name: "DelGal's Food Hub", image_path: "S12.jpg", is_active: true },
      { stall_number: 13, stall_name: "Red Bowl", image_path: "S13.jpg", is_active: true },
      { stall_number: 14, stall_name: "Pure Foods Food Factory", image_path: "S14.jpg", is_active: true },
      { stall_number: 15, stall_name: "Levy's Asian Noodle Master", image_path: "S15.jpg", is_active: true },
    ];

    for (const st of stalls) {
      await pool.query(
        `INSERT INTO stalls (stall_number, stall_name, image_path, is_active)
       VALUES ($1,$2,$3,$4)`,
        [st.stall_number, st.stall_name, st.image_path, st.is_active]
      );
    }

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