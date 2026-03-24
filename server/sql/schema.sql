-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users
-- role: 'student' or 'admin'
CREATE TABLE IF NOT EXISTS app_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      TEXT UNIQUE,         -- optional for admins
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Food stalls
CREATE TABLE IF NOT EXISTS stalls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stall_number    INT NOT NULL UNIQUE,
  stall_name      TEXT NOT NULL,
  image_path      TEXT,              -- local upload path (served static)
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Signature keys (Ed25519)
-- We keep versions so old evaluations can still be verified.
CREATE TABLE IF NOT EXISTS signing_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version         INT NOT NULL UNIQUE,
  public_key_b64  TEXT NOT NULL,
  private_key_b64 TEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evaluations (forced date = server "today")
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  stall_id UUID NOT NULL REFERENCES stalls(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,

  eval_date DATE NOT NULL, -- server sets to today
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Service Evaluation
  friendliness_of_staff INT NOT NULL CHECK (friendliness_of_staff BETWEEN 1 AND 5),
  speed_of_service      INT NOT NULL CHECK (speed_of_service BETWEEN 1 AND 5),
  accuracy_of_order     INT NOT NULL CHECK (accuracy_of_order BETWEEN 1 AND 5),

  -- Food Quality
  taste_of_food       INT NOT NULL CHECK (taste_of_food BETWEEN 1 AND 5),
  food_freshness      INT NOT NULL CHECK (food_freshness BETWEEN 1 AND 5),
  food_presentation   INT NOT NULL CHECK (food_presentation BETWEEN 1 AND 5),
  portion_size        INT NOT NULL CHECK (portion_size BETWEEN 1 AND 5),

  -- Cleanliness & Environment
  cleanliness_of_stall INT NOT NULL CHECK (cleanliness_of_stall BETWEEN 1 AND 5),
  overall_comfort      INT NOT NULL CHECK (overall_comfort BETWEEN 1 AND 5),

  -- Price & Value
  affordability_of_food INT NOT NULL CHECK (affordability_of_food BETWEEN 1 AND 5),
  value_for_money       INT NOT NULL CHECK (value_for_money BETWEEN 1 AND 5),

  -- Additional Feedback (optional)
  liked_most           TEXT,
  can_be_improved      TEXT,
  suggestions          TEXT,

  -- Signature info
  key_version          INT NOT NULL REFERENCES signing_keys(version),
  payload_json         JSONB NOT NULL,  -- canonical payload used for signing
  signature_b64        TEXT NOT NULL,

  -- One evaluation per stall per user per day
  CONSTRAINT uniq_eval_per_user_stall_day UNIQUE (stall_id, user_id, eval_date)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_evals_stall_date ON evaluations (stall_id, eval_date);
CREATE INDEX IF NOT EXISTS idx_evals_user_date ON evaluations (user_id, eval_date);