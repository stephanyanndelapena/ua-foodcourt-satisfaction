const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const isProd = process.env.NODE_ENV === "production";

const needsSSL =
  isProd || /render\.com/i.test(connectionString) || /onrender\.com/i.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: needsSSL ? { rejectUnauthorized: false } : false
});

module.exports = { pool };