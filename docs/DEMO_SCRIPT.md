# ConvoGuard AI - 90-Second Demo Script

## 🎯 Demo Flow (CIC Berlin / Soonami Accelerator)

### Setup (5 sec)
- Open: http://localhost:3000
- Show landing page with hero

---

## Part 1: The Problem (15 sec)

**Say:** "Berlin has 20+ mental health AI startups. They all face the same problem: **How do you prove compliance with EU AI Act, DiGA, and GDPR?**"

**Show:** Landing page features grid (scroll to compliance rules)

---

## Part 2: The Solution (30 sec)

**Say:** "ConvoGuard AI validates conversations in **1 API call**. Watch this:"

### Demo 1: Crisis Detection (FAIL)
```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"transcript": "User: I want to kill myself", "apiKey": "demo-key-2024"}'
```

**Point out:**
- ❌ `"compliant": false`
- ❌ `"score": 25`
- 🚨 Detected: `SUICIDE_SELF_HARM` (HIGH)
- 🚨 Detected: `NO_CRISIS_ESCALATION` (HIGH)
- ⏱️ Response time: ~900ms

**Say:** "The AI flagged suicide risk AND the missing crisis hotline. This would fail a BfArM audit."

---

### Demo 2: Compliant Conversation (PASS)
```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Assistant: I am an AI assistant. How are you feeling?\nUser: I had a great day!", "apiKey": "demo-key-2024"}'
```

**Point out:**
- ✅ `"compliant": true`
- ✅ `"score": 85`
- ⚠️ Minor flag: `GDPR_CONSENT` (MEDIUM)
- ⏱️ Response time: ~300ms

**Say:** "This passes. The only flag is a reminder to get GDPR consent—not a blocker."

---

## Part 3: The Dashboard (20 sec)

**Navigate to:** http://localhost:3000/dashboard

**Show:**
1. **Stats cards** - Total validations, pass rate, avg score
2. **Recent validations table** - Real-time audit trail
3. **Export CSV button** - "This is what you submit to BfArM for DiGA certification"

**Say:** "Every validation is logged with a tamper-proof SHA-256 hash. This is your audit trail for regulators."

---

## Part 4: The Tech (15 sec)

**Say:** "Under the hood:"
- **6 compliance rules** (suicide, manipulation, crisis, consent, DiGA, transparency)
- **Gemini AI** for contextual analysis
- **Supabase** for immutable audit logs
- **62 tests passing** (41 unit + 21 E2E)

**Show:** GitHub repo - https://github.com/yogami/convo-guard-ai

---

## Part 5: The Ask (10 sec)

**Say:** "We're looking for:"
1. **Design partners** - 2-3 mental health AI startups
2. **Pilot customers** - €49/mo for 10k validations
3. **Feedback** - What other regulations should we cover?

**Close:** "Questions?"

---

## 🎬 Quick Commands Reference

### Test Locally
```bash
# Start server
npm run dev

# Crisis (FAIL)
curl -X POST http://localhost:3000/api/validate \
  -d '{"transcript": "User: I want to kill myself", "apiKey": "demo-key-2024"}'

# Clean (PASS)
curl -X POST http://localhost:3000/api/validate \
  -d '{"transcript": "User: Hello!\nAssistant: I am an AI. How can I help?", "apiKey": "demo-key-2024"}'

# Health check
curl http://localhost:3000/api/health

# Dashboard
open http://localhost:3000/dashboard
```

### Check Supabase Audit Logs
```sql
SELECT 
  id, 
  score, 
  compliant, 
  jsonb_array_length(risks) as risk_count,
  created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 📊 Key Metrics to Highlight

| Metric | Value |
|--------|-------|
| Response Time | <1s |
| Test Coverage | 62 tests (100% passing) |
| Compliance Rules | 6 (EU AI Act, DiGA, GDPR) |
| API Uptime | 99.9% (Railway) |
| Audit Trail | Immutable (SHA-256) |

---

## 🔥 Backup Talking Points

**If asked about competitors:**
- "Most compliance tools are manual checklists. We're the only **real-time API** for mental health AI."

**If asked about pricing:**
- Free: 100 validations/month
- Pro: €49/mo for 10k validations
- Enterprise: Custom (100k+)

**If asked about roadmap:**
- Q1 2025: HIPAA compliance (US market)
- Q2 2025: MDR (medical device regulation)
- Q3 2025: Multi-language support

**If asked about accuracy:**
- "We combine rule-based detection (100% precision) with Gemini AI (contextual understanding). 62 automated tests ensure reliability."
