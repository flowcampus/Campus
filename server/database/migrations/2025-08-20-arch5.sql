-- Architecture 5 additions (DO NOT APPLY YET)
-- Safe for Supabase/Neon: use pgcrypto's gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Parent linking: codes + approval flow
CREATE TABLE IF NOT EXISTS parent_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  code VARCHAR(16) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | approved | revoked
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMPTZ NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_parent_links_code ON parent_links(code);
CREATE INDEX IF NOT EXISTS ix_parent_links_student ON parent_links(student_id);

-- Many-to-many relation of parent to students once approved
CREATE TABLE IF NOT EXISTS parent_students (
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (parent_id, student_id)
);

-- Login history and device visibility
CREATE TABLE IF NOT EXISTS login_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip INET NULL,
  user_agent TEXT NULL,
  device_info JSONB NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_login_events_user ON login_events(user_id);
CREATE INDEX IF NOT EXISTS ix_login_events_created ON login_events(created_at DESC);

CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  label TEXT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_trusted_devices_user_fingerprint ON trusted_devices(user_id, device_fingerprint);

-- Guest sessions (optional persistence)
CREATE TABLE IF NOT EXISTS guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NULL REFERENCES schools(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_guest_sessions_expires ON guest_sessions(expires_at);
