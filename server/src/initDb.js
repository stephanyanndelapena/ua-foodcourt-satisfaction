async function initDb(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS session (
      sid varchar PRIMARY KEY,
      sess jsonb NOT NULL,
      expire timestamptz NOT NULL
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS "IDX_session_expire"
    ON session (expire);
  `);
}

module.exports = { initDb };