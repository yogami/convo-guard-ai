# 🛡️ ConvoGuard AI

**Real-time API middleware that validates mental health chatbot conversations for EU AI Act/DiGA/GDPR compliance.**

Built for CIC Berlin / Soonami Accelerator demo.

[![CI/CD](https://github.com/YOUR_USERNAME/convo-guard-ai/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_USERNAME/convo-guard-ai/actions)

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - Landing page with API demo
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) - Compliance dashboard

## 📡 API Usage

### Validate a Conversation

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Assistant: I am an AI assistant. How are you feeling today?"}'
```

**Response (compliant):**
```json
{
  "compliant": true,
  "score": 100,
  "risks": [],
  "audit_id": "abc-123-xyz",
  "execution_time_ms": 45
}
```

### Crisis Detection

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"transcript": "User: I want to kill myself"}'
```

**Response (non-compliant):**
```json
{
  "compliant": false,
  "score": 50,
  "risks": [{
    "category": "SUICIDE_SELF_HARM",
    "severity": "HIGH",
    "message": "Detected potential suicidal/self-harm ideation"
  }],
  "audit_id": "def-456-uvw",
  "execution_time_ms": 38
}
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Export Audit Logs (CSV)

```bash
curl "http://localhost:3000/api/audit-logs?format=csv" -o audit-logs.csv
```

## 📋 Compliance Rules

| Rule | Trigger | Weight | Severity |
|------|---------|--------|----------|
| 🚨 Suicide/Self-harm | Suicidal ideation | -50 | HIGH |
| 🎭 Manipulation | Exploitation, pressure | -30 | MEDIUM |
| 🆘 Crisis Escalation | Missing emergency resources | -25 | HIGH |
| 📋 GDPR Consent | Missing data consent | -15 | MEDIUM |
| 📊 DiGA Evidence | No clinical tracking | -10 | LOW |
| 🤖 Transparency | No AI disclosure | -10 | LOW |

**Score:** `100 - sum(weights)` → PASS (≥70) / FAIL (<70 or HIGH risk)

## 🏗️ Tech Stack

- **Next.js 16** + TypeScript
- **Vitest** - Unit testing (90% coverage target)
- **Playwright** - E2E testing
- **Supabase** - Database & auth
- **Google Gemini** - LLM risk analysis
- **Railway** - Deployment

## 📁 Project Structure

```
src/
├── app/                  # Next.js pages & API routes
│   ├── api/
│   │   ├── validate/     # POST /api/validate
│   │   ├── health/       # GET /api/health
│   │   └── audit-logs/   # GET /api/audit-logs
│   └── dashboard/        # Compliance dashboard
├── domain/
│   ├── entities/         # Core types
│   ├── rules/            # 6 compliance rules
│   └── usecases/         # Business logic
└── infrastructure/
    ├── gemini/           # LLM adapter
    └── supabase/         # Database repositories
```

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# All tests (CI)
npm run lint && npm run typecheck && npm run test:coverage && npm run test:e2e
```

## ⚙️ Environment Variables

```env
# Gemini API (optional - enables AI analysis)
GEMINI_API_KEY=your-gemini-api-key

# Supabase (optional - enables persistence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🚀 Deployment

1. Push to main branch
2. GitHub Actions runs tests
3. Railway deploys automatically

```bash
# Manual deploy
railway up
```

## 📜 License

MIT

---

Built with ❤️ for Berlin's mental health AI ecosystem
