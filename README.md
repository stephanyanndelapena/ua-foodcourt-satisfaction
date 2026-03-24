## Database setup

1) Create database:
```sql
CREATE DATABASE ua_foodcourt_satisfaction;
```

2) Import schema:
```bash
psql -U postgres -d ua_foodcourt_satisfaction -f db/schema.sql
```

3) Create session table (if not in schema.sql):
```sql
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
```

4) Seed initial data (admin/student/stalls/signing key):
```bash
cd server
npm install
npm run seed
```