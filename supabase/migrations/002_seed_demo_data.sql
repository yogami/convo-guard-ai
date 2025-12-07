-- ConvoGuard AI - Seed Demo Data
-- Inserts demo API keys for testing

-- Insert demo API keys (only if they don't exist)
INSERT INTO api_keys (key, name, tier, requests_limit, enabled)
VALUES 
  ('demo-key-2024', 'Demo Free Key', 'free', 100, true),
  ('demo-pro-2024', 'Demo Pro Key', 'pro', 10000, true),
  ('demo-enterprise-2024', 'Demo Enterprise Key', 'enterprise', 100000, true)
ON CONFLICT (key) DO NOTHING;

-- Verify insertion
SELECT key, name, tier, requests_limit, enabled 
FROM api_keys 
WHERE key LIKE 'demo-%'
ORDER BY tier;
