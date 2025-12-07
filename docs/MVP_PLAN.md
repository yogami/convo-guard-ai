# Mental Health AI Compliance Validator MVP Plan

**GitHub Repo:** convo-guard-ai  
**Tech Stack:** Next.js TS + Supabase + Gemini API + Railway + TDD + SOLID + CI/CD  
**Demo Ready:** 10 days for CIC Berlin / Soonami Accelerator

---

## 🎯 Product Overview

**ConvoGuard AI:** Real-time API middleware that validates mental health chatbot conversations for EU AI Act/DiGA/GDPR compliance.

```
API: POST /validate → {compliant: true, score: 92, risks: [], audit_log: "hash"}
```

**Target Customers:** HelloBetter, MindDoc, VIA HealthTech, clare&me (Berlin mental health AI startups)

---

## 📋 Compliance Rules Engine (EU AI Act + DiGA)

| Rule Category | Triggers (LLM detects) | Action | Weight |
|--------------|------------------------|--------|--------|
| Suicide/Self-harm | "kill myself", "end it all" | BLOCK + alert | -50 |
| Manipulation | "buy this now", exploit vulnerability | FLAG | -30 |
| No crisis escalation | No "call emergency" prompt | FLAG | -25 |
| GDPR consent | Missing "I consent to record" | WARN | -15 |
| DiGA evidence | No mood tracking/patient data | WARN | -10 |
| Transparency | No "I'm AI" disclosure | WARN | -10 |

**Score:** 100 - violations → PASS/FAIL + audit trail

---

## 🏗️ Architecture (SOLID + Clean Code + TDD Pyramid)

```
src/
├── domain/           # Uncle Bob entities/use cases
│   ├── entities/
│   │   ├── Conversation.ts
│   │   ├── ComplianceRule.ts
│   │   └── AuditLog.ts
│   └── usecases/
│       ├── ValidateConversation.ts
│       └── GenerateAuditLog.ts
├── infrastructure/   # Adapters (Gemini, Supabase)
│   ├── gemini/
│   └── supabase/
├── application/      # REST controllers
└── tests/            # TDD pyramid (80% unit, 15% integration, 5% E2E)
```

### SOLID Principles Applied:
- **Single Responsibility:** ConversationValidator only validates
- **Open/Closed:** Add rules via ComplianceRuleRegistry
- **Liskov:** RuleInterface polymorphism
- **Interface Segregation:** Small APIs
- **Dependency Inversion:** DI container

---

## 🚀 10-Day Antigravity Build Plan (TDD + CI/CD)

### Day 1-2: Foundation + TDD Scaffold
1. GitHub: convo-guard-ai (Node.js + pnpm + husky pre-commit hooks)
2. CI/CD: GitHub Actions (lint/test/build on PR, Railway deploy on main)
3. TDD Pyramid scaffold: vitest (unit) + Playwright (E2E) + c8 (coverage 90%)
4. Domain: Conversation entity + ComplianceRule interface (100% test coverage)
5. Dependency injection container (InversifyJS)

**Pre-commit:** lint-staged + vitest --watch + typecheck

### Day 3-4: Core Validator Engine
1. Rules Registry: SuicideRule, ManipulationRule, ConsentRule (TDD each)
2. Gemini integration: POST transcript → structured JSON risks[]
3. Validator orchestrator: RuleRegistry → aggregate score
4. Unit tests: 50+ scenarios (suicide=FAIL, normal=100)
5. Integration tests: Mock Gemini → real validation flow

**Gemini Prompt:** "Analyze: {transcript}. Return JSON: {risks: [], severity: 'HIGH|MEDIUM|LOW'}"

### Day 5-6: Infrastructure + API
1. Supabase: conversations (audit logs), api_keys (SaaS)
2. REST API: POST /validate (auth → validate → audit → respond <200ms)
3. Auth: API keys ($49/mo Stripe tiers)
4. Rate limiting: 1000 RPM free tier
5. Playwright E2E: curl → validate → 200 OK + audit row

### Day 7: Dashboard + Monitoring
1. Next.js dashboard: Recent validations, compliance trends
2. Real-time metrics: Pass rate, avg score, top violations
3. Export: CSV audit logs for BfArM/DiGA submission
4. Stripe: $49/mo → API key + 10k convos/mo

### Day 8-9: Polish + Demo Prep
1. Error boundaries, logging (Sentry), health checks
2. Demo data: Seed 50 HelloBetter/MindDoc convos
3. Landing: "EU AI Act compliance in 1 API call"
4. Pitch deck: Problem → Demo → Berlin HealthTech TAM

### Day 10: Deploy + CIC Ready
1. Railway: Staging → Production (env-based)
2. Demo flow: curl → validate → dashboard → audit export
3. QR code + 1-min screenshare script

---

## 🧪 Testing Pyramid (90% Coverage)

```
      🏗️ E2E (5%)
      /         \
  📋 Integration (15%)  
  /                   \
🔬 Unit Tests (80%)
```

### Vitest Example:
```typescript
test('SuicideRule detects trigger', () => {
  expect(new SuicideRule().validate("I want to kill myself")).toEqual({
    compliant: false, risks: ['suicide_ideation']
  });
});
```

---

## 🔧 CI/CD Pipeline (GitHub Actions)

```yaml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test:unit --coverage
      - run: pnpm test:e2e
      - run: pnpm build
  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: railwayapp/action@v1
        with: { railwayToken: ${{ secrets.RAILWAY_TOKEN }} }
```

---

## 💰 Monetization + Berlin Go-to-Market

- **Freemium:** 100 convos/mo free → $49/mo unlimited
- **Enterprise:** $5k/mo (white-label + BfArM submission)
- **Targets:** VIA HealthTech, Neurolonic, Mentalyc, HelloBetter
- **Accelerators:** CIC Berlin Demo Day, Soonami HealthTech cohort
- **Exit:** License to Ada Health / Doctolib ($2-5M)

---

## 📦 Project Structure

```
convo-guard-ai/
├── README.md (CIC pitch + curl demo)
├── pnpm-workspace.yaml
├── packages/
│   ├── core/          # Domain + usecases
│   ├── api/           # Next.js REST
│   └── dashboard/     # React admin
├── .github/workflows/ci-cd.yml
└── railway.toml
```

---

## 🎪 CIC Demo Flow (90 seconds)

1. "Mental health bots exploding. EU AI Act 2026. No compliance layer."
2. `curl -X POST /validate "{transcript: 'I'm suicidal'}"`
3. Response: `{compliant: false, risks: ['suicide'], audit_id: 'xyz'}`
4. Dashboard: 92% pass rate, top risk = consent missing
5. "Berlin's 20+ mental AI startups need this NOW."
6. QR code → live demo → Stripe signup

---

## ⚠️ Risks & Success Criteria

**Risk:** Gemini prompt engineering (Day 3 priority)

**MVP Success:** 95% accuracy on 100 test convos + 2 Berlin pilots
