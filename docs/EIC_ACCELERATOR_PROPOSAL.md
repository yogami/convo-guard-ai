# EIC Accelerator Short Application

**TITLE OF THE PROPOSAL:** ConvoGuard: AI Act Compliance Engine

**List of participants:** 1 (Coordinator): Gopalkrishna Yamijala, berlinailabs.de (Freelancer), Germany

## 1. Company description [150 words max]
Gopalkrishna Yamijala (berlinailabs.de) is a Berlin-based solo founder building AI governance tools. Live MVPs deployed on Railway:
- ConvoGuard: Real-time chatbot compliance API  
- Agent Trust Protocol: AI agent reputation dashboard
TRL 6-7: Production APIs with unit/E2E tests (Playwright verified)
6 Compliance rules implemented: Suicide prevention, GDPR consent, crisis escalation, medical safety
Sub-300ms latency verified on Railway
CIC Berlin accelerator participant
Tech: Next.js, Supabase, Google Gemini
Target: Berlin HealthTech compliance pilots

## 2. The problem/market opportunity [150 words max]
EU AI Act requires high-risk AI systems to log operations and report serious incidents (Art. 12, Art. 73). No developer tools exist for real-time evidence generation.
"Tessa" chatbot (2023) shut down after harmful advice exposed monitoring gap.
Who needs this:
- HealthTech: DiGA-compliant mental health bots
- Fintech: Customer support compliance
- HR: Recruitment AI risk management
Market: €10B conversational AI (2027 projection), 20% high-risk requiring compliance tools.

## 3. The innovation: Solution/Product or Services (USP) [200 words max]
ConvoGuard: API middleware (`/evaluate`) inserted before AI responses.
Workflow: Chat → ConvoGuard → Compliance score + audit log → Safe response or block
Live demo: https://convo-guard-ai-production.up.railway.app/
TRL 6-7 evidence:
- Railway production deployment
- 62 automated tests (100% pass rate)
- Playwright E2E verification
- Stripe payments integrated
Policy coverage: Suicide/self-harm, GDPR consent, crisis escalation, medical safety, AI transparency
USP vs competitors:
- Runtime enforcement (not static audits)
- Article-level AI Act mapping in logs
- Developer API (5-min integration)
Timing: AI Act prohibited practices enforcement Feb 2026.

## 4. Market and Competition analysis [150 words max]
Primary market: Berlin/EU HealthTech (€1.2B conversational AI compliance need)
Business model: Usage-based SaaS
- Free: 100 evals/month
- Pro: €0.01/evaluation  
- Enterprise: €1k+/month (custom packs)
Competitors:
| Type | Examples | Gap |
|------|----------|-----|
| Consulting | PwC | Manual, expensive |
| Platforms | Credo AI | Documentation only |
| Cloud | AWS Guardrails | Generic safety |
ConvoGuard edge: Real-time API + AI Act evidence generation.

## 5. Broad impacts [100 words max]
Enables safe deployment of regulated AI (EU AI Act compliance).
Mental health: Safer crisis detection (SDG 3).
Jobs: Berlin AI compliance specialist roles.
EU Policy: Supports AI Act technical documentation requirements (Art. 11, Art. 12).

## 6. Team and management [TABLE REQUIRED]
| Name | Gender | Founder | Position | Key competences | Commitment |
|------|--------|---------|----------|-----------------|------------|
| Gopalkrishna Yamijala | Man | Y | Founder/Engineer | 10+ years backend, AI systems, Railway/Supabase/n8n | 100% |

Hiring: Sales (DACH), Regulatory specialist (AI Act/DiGA)

## 7. Funding request [100 words max]
€1.2M grant requested (60% of €2M total costs, 12 months):
- 60% Engineering: Multi-regulation v3, scale infrastructure
- 20% Regulatory: Policy pack expansion + certifications  
- 20% Go-to-market: Berlin HealthTech pilots
Why grant needed: Regulatory tech requires certification de-risking before VC scale.
Projections: Year 1 €50k ARR (10 pilots), Year 2 €450k ARR
