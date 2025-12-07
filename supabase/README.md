# Supabase Database Setup

## Quick Setup

1. Go to your Supabase project: https://supabase.com/dashboard/project/wmofzhfttpygpjhgycxj
2. Navigate to **SQL Editor**
3. Run migrations in order:

### Migration 001: Initial Schema
```bash
# Copy and run: supabase/migrations/001_initial_schema.sql
```

### Migration 002: Seed Demo Data
```bash
# Copy and run: supabase/migrations/002_seed_demo_data.sql
```

## Environment Variables

Add these to your Railway project and local `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wmofzhfttpygpjhgycxj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb2Z6aGZ0dHB5Z3BqaGd5Y3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDYyNzMsImV4cCI6MjA4MDcyMjI3M30.8A7jJ9UE0CjiGBdi0QoaUrV1AY7bVIUCA139-Kqgwvs
```

## Schema Overview

### `api_keys` Table
- Stores API keys for authentication
- Tracks request counts and rate limits
- Supports 3 tiers: free (100), pro (10k), enterprise (100k)

### `audit_logs` Table
- Immutable audit trail of all validations
- Stores conversation transcript, score, risks
- SHA-256 hash for tamper detection
- Links to API key for usage tracking

## Demo API Keys

After running migrations, you'll have these test keys:

| Key | Tier | Limit |
|-----|------|-------|
| `demo-key-2024` | free | 100 |
| `demo-pro-2024` | pro | 10,000 |
| `demo-enterprise-2024` | enterprise | 100,000 |

## Verify Setup

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check demo keys
SELECT * FROM api_keys;

-- Check audit logs (will be empty initially)
SELECT COUNT(*) FROM audit_logs;
```
