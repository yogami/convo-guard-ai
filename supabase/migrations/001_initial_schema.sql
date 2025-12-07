-- ConvoGuard AI - Initial Schema
-- Creates tables for API keys and audit logs

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  requests_count INTEGER DEFAULT 0,
  requests_limit INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  transcript TEXT NOT NULL,
  score INTEGER NOT NULL,
  compliant BOOLEAN NOT NULL,
  risks JSONB NOT NULL,
  hash TEXT NOT NULL,
  api_key_id UUID REFERENCES api_keys(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_conversation_id ON audit_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_api_key_id ON audit_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_enabled ON api_keys(enabled) WHERE enabled = true;

-- Add comments for documentation
COMMENT ON TABLE api_keys IS 'API keys for authentication and rate limiting';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail of all validation requests';
COMMENT ON COLUMN audit_logs.hash IS 'SHA-256 hash for tamper detection';
COMMENT ON COLUMN audit_logs.risks IS 'JSON array of detected compliance risks';
