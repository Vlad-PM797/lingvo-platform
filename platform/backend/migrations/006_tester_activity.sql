CREATE TABLE IF NOT EXISTS tester_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ip_address TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT '',
  last_path TEXT NOT NULL DEFAULT '',
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count >= 1),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, activity_date, ip_address, user_agent)
);

CREATE INDEX IF NOT EXISTS idx_tester_activity_user_id ON tester_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_tester_activity_last_seen ON tester_activity(last_seen_at DESC);
