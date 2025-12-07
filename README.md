# ConvoGuard AI

> 🛡️ Real-time API middleware for EU AI Act / DiGA / GDPR compliance validation of mental health chatbot conversations.

[![CI/CD](https://github.com/YOUR_USERNAME/convo-guard-ai/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_USERNAME/convo-guard-ai/actions/workflows/ci-cd.yml)

## 🎯 Quick Demo

```bash
curl -X POST https://api.convoguard.ai/validate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I feel really hopeless"},
      {"role": "assistant", "content": "I hear you. Those feelings are valid. Would you like to talk about what is making you feel this way?"}
    ]
  }'
```

**Response:**
```json
{
  "compliant": true,
  "score": 92,
  "risks": [],
  "auditId": "aud_abc123"
}
```

## 🚀 Features

- **Real-time Validation** - <200ms response time
- **EU AI Act Compliance** - Suicide/self-harm, manipulation, transparency detection
- **DiGA Ready** - Audit logs for BfArM submission
- **GDPR Consent Tracking** - Automated consent verification
- **Immutable Audit Trail** - SHA-256 hashed logs

## 📋 Compliance Rules

| Category | Severity | Weight |
|----------|----------|--------|
| Suicide/Self-harm | BLOCK | -50 |
| Manipulation | FLAG | -30 |
| No Crisis Escalation | FLAG | -25 |
| GDPR Consent Missing | WARN | -15 |
| DiGA Evidence Missing | WARN | -10 |
| No AI Disclosure | WARN | -10 |

**Scoring:** 100 - violations = final score. Pass ≥ 70, no HIGH severity risks.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test:unit        # Unit tests
npm run test:e2e         # E2E tests
npm run test:coverage    # With coverage

# Linting & formatting
npm run lint
npm run format
npm run typecheck
```

## 📦 Tech Stack

- **Framework:** Next.js 16 + TypeScript
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Database:** Supabase
- **AI:** Google Gemini API
- **Hosting:** Railway
- **Architecture:** Clean Architecture + SOLID + TDD

## 🏗️ Architecture

```
src/
├── domain/           # Business logic (entities, use cases)
├── infrastructure/   # External adapters (Gemini, Supabase)
├── application/      # REST API controllers
└── tests/            # Test utilities
```

## 🎪 Target Market

Berlin mental health AI startups: HelloBetter, MindDoc, VIA HealthTech, clare&me

## 📄 License

MIT © 2024 ConvoGuard AI
