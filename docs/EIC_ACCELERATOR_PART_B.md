# Horizon Europe Programme - EIC Accelerator Full Proposal
## Project proposal – Technical description (Part B)

**AI DISCLOSURE:** This proposal was prepared with the assistance of generative AI (Google Gemini/Antigravity) for structural organization, linguistic refinement, and data synthesis. All technical claims, company data, and strategic decisions have been verified and approved by the applicant.

**TITLE OF THE PROPOSAL:** ConvoGuard: AI Act Compliance Engine for Real-Time Conversational AI Governance  
**ACRONYM:** CONVOGUARD  
**PROPOSAL ID:** SEP-211273382  
**PIC:** 867390491  
**VAT NUMBER:** DE419001383  
**IBAN:** DE39100400000801892100  
**WEBSITE:** [berlinailabs.de](https://berlinailabs.de)  
**DURATION:** 24 months  
**FUNDING REQUESTED:** €1,000,000 (Grant only)

### List of participants
| Participant No. | Participant organisation name | Country |
| :--- | :--- | :--- |
| 1 (Coordinator) | Gopalkrishna Yamijala (Berlin AI Labs) | Germany |

### EIC Topic
**1. EIC Accelerator Open**

---

# Executive Summary – approx. 2 pages

**The Problem:**
The EU AI Act (Regulation EU 2024/1689) mandates strict compliance, automated logging, and incident reporting for high-risk AI systems (Article 12, Article 73). Currently, no developer tools exist to enforce these regulations in real-time for conversational AI. Organizations rely on static, post-hoc audits that fail to prevent harmful AI behavior before it reaches the user.

**The Solution:**
ConvoGuard is a real-time compliance middleware API. It sits between the chat interface and the AI model, evaluating every interaction against a library of regulatory "Policy Packs" (AI Act, GDPR, DiGA, MDR). If an interaction violates a policy (e.g., prohibited manipulative practices under Article 5, or lack of transparency under Article 50), ConvoGuard blocks it and generates an immediate, article-mapped audit log for regulators.

**Innovation & TRL:**
ConvoGuard is currently at **TRL 6-7**. We have a live production MVP integrated with Railway and Supabase, featuring 6 core compliance policies. The system has been verified through 62 automated tests and Playwright E2E suites, maintaining sub-300ms latency—essential for real-time human interaction.

**Market Opportunity:**
The European conversational AI market was valued at US$ 2.45B in 2023 and is projected to reach US$ 11.77B by 2031 (CAGR 21.7% [GII, 2024]). At least 20% of applications in regulated sectors are expected to be classified as "high-risk" under the AI Act, requiring robust technical documentation and logging. Our beachhead is Berlin's HealthTech sector (45+ DiGA apps), followed by EU-wide Fintech and HR recruitment AI providers.

**Funding & Objectives:**
We are requesting a **€1,000,000 grant-only** award to:
1.  Scale the AI Act policy engine to 100% article coverage.
2.  Achieve DiGA and MDR certification for mental health AI safety.
3.  Deploy 15 enterprise pilots in the DACH region.
4.  Reach €1M ARR by M24.

**The Team:**
Led by Gopalkrishna Yamijala, an engineer with 10+ years of experience in production AI systems and backend architecture. Support comes from a growing advisory board in regulatory affairs and the CIC Berlin accelerator network.

---

# Part 1 – Business case

## 1. Company description – approx. 3 pages

### Core Mission and Vision
**Mission:** To provide the "Safe Harbor" for regulated AI. We empower developers to build and deploy high-risk AI systems with transparency and safety by automating the enforcement of complex regulations.
**Vision:** To become the standard technical infrastructure for AI Act compliance globally, starting with the European digital health ecosystem.

### Market Position
ConvoGuard (Berlin AI Labs) is a first-mover in the "Runtime AI Governance" space. While competitors focus on documentation and manual audits, we occupy the technical middleware layer. We are the "Compliance-as-Code" layer for LLM applications.

### Key Partners and Contributions
1.  **HelloBetter (David Ebert, Founder):** Currently in discussion for a flagship pilot. HelloBetter is a leader in DiGA-certified digital therapeutics. Their expertise in clinical validation and regulatory hurdles for mental health chatbots will shape our product roadmap. HelloBetter is currently in discussion as a potential pilot partner.
2.  **CIC Berlin:** Our anchor accelerator. They provide access to the Berlin HealthTech ecosystem, regulatory workshops, and a network of 250+ deep-tech startups. The applicant participates in CIC (and AEThos) events and plans a full membership in the program from January 2025.
3.  **Cloud Infrastructure Partners:** Railway.app and Supabase provide the scalable, EU-resident infrastructure required to meet strict data sovereignty requirements.

### Key Assets
-   **Proprietary Policy Library:** A modular repository of AI Act and GDPR article-mapped prompts and evaluation logic.
-   **Automated Verification Suite:** 62+ production-grade unit and E2E tests (Playwright) that prove our runtime reliability.
-   **Digital Infrastructure:** High-availability API endpoints deployed on Railway with sub-300ms latency profiles.

### Advisors & Clients
-   **Advisors:** Currently holding informal meetings in the hopes of forming a board including a Regulatory Specialist (ex-BfArM context) and a B2B SaaS Growth Lead.
-   **Clients:** 2 pilot discussions underway with Berlin-based mental health and HR-tech startups.

---

## 2. The problem/market opportunity – approx. 3 pages

### The Identified Problem
The "Compliance Gap" in AI. The EU AI Act introduces heavy fines (up to €35M or 7% of turnover) for non-compliant prohibited practices. However, developers lack the tools to:
1.  **Detect violations in real-time (Article 12):** Traditional logging happens *after* the harm is done.
2.  **Generate Structured Evidence (Article 11):** Manually mapping chat logs to AI Act Annex IV technical documentation is impossible at scale.
3.  **Prevent Prohibited Practices (Article 5):** The AI Act prohibits specific manipulative or deceptive techniques—current general-purpose models often bypass native safety filters.
4.  **Report Serious Incidents (Article 73):** High-risk AI providers must report incidents within tight deadlines (15 days for serious incidents, 2 days for widespread infringements).

### For Whom
-   **HealthTech (DiGA):** Developers of mental health bots who must avoid providing harmful "therapeutic" advice (Classified as High-Risk under Annex III, 5b if used for medical triage/support).
-   **Fintech:** Banks using AI for credit scoring (High-Risk under Annex III, 5a) who must ensure transparency and non-bias.
-   **HR-Tech:** Platforms using AI for recruitment and work-task allocation (High-Risk under Annex III, 4).

### Current Solutions Shortcomings
-   **Static Audits (PwC/Consultants):** Costly (€100k+), slow, and only provide a "snapshot" of compliance.
-   **Native LLM Filters (OpenAI/AWS):** Too generic. They lack the context of Regulation (EU) 2024/1689 specificities for the German DiGA market.

### Addressable Market Size
-   **TAM (Total Addressable Market):** ~US$ 11.7B (Projected EU Conversational AI market by 2031 [GII Research, 2024]).
-   **SAM (Serviceable Available Market):** ~US$ 2.3B (The estimated 20% subset of High-Risk AI systems requiring mandatory technical compliance).
-   **SOM (Serviceable Obtainable Market):** €50M (Initial target within HealthTech and Fintech compliance middleware).

---

## 3. The innovation: Solution/Product or Services (USP) – approx. 9 pages

### How it Works
ConvoGuard acts as a proxy API.
1.  **Request:** The user sends a prompt.
2.  **Evaluation:** ConvoGuard checks the prompt and the *proposed* AI response against the "Policy Engine."
3.  **Decision:** If safe, the response is delivered. If unsafe, a "Compliance Block" is triggered.
4.  **Audit:** An encrypted, timestamped log is saved to Supabase, mapped to specific AI Act requirements.

### Value Proposition
-   **Runtime Enforcement:** We block harm before it happens.
-   **Article Mapping:** Every "FAIL" log explicitly states which EU AI Act article was at risk.
-   **5-Minute Integration:** A simple REST API wrapper that fits into any existing LLM stack (Next.js, Python, etc.).

### Development Stage (TRL 6-7)
Our prototype is demonstrated in an operational environment (Railway production). 
-   **Case Study:** A mental health bot integration where a user prompted "I want to end things." ConvoGuard bypassed the generic LLM safety and triggered a specific "Crisis Escalation Policy," blocking the AI response and providing the user with a verified helpline, while logging the incident for the clinical team.
-   **Validation:** 100% pass rate on 62 automated tests; sub-300ms latency verified across 1,000+ stress tests.

### IP Strategy
-   **Trade Secrets:** Our evaluation logic and prompt-chaining architecture.
-   **Open Source:** We release certain compliance "definitions" to the community to drive the standard, while keeping the high-performance engine proprietary.
-   **Freedom to Operate:** A statement of FTO is included in Annex; we rely on open-source frameworks and proprietary API logic that does not infringe on existing static document-generation patents.

---

## 4. Market analysis and Competition analysis – approx. 5 pages

### Market Growth (CAGR)
The AI governance market is growing at a CAGR of 35% as the Feb 2026 AI Act enforcement deadline approaches.

### Willingness to Pay
Companies in the DiGA space are already paying €20k-€50k for manual compliance consultants. A "Compliance-as-a-Service" model at €1k-€5k/month is an easy ROI decision for a CTO.

### Competitors and Threats
| Competitor | Limitation | ConvoGuard Edge |
| :--- | :--- | :--- |
| **Credo AI** | Focuses on GRC documentation. | We provide **runtime enforcement**. |
| **AWS Guardrails** | US-centric, generic safety. | We provide **EU AI Act specific mapping**. |
| **PwC/EY** | Manual and expensive. | We are **automated and affordable**. |

### SWOT Analysis
-   **Strengths:** Runtime capability, technical-first approach, Berlin location.
-   **Weaknesses:** Small team, brand awareness.
-   **Opportunities:** AI Act enforcement timeline (2025/2026), HealthTech demand.
-   **Threats:** Cloud providers shipping deeper native compliance (mitigated by our multi-model independence).

---

## 5. Marketing and sales plan – approx. 4 pages

### Business Model
**SaaS Subscription + Usage:**
-   **Base:** €500/month (Dashboard access + 10k evaluations).
-   **Scale:** €0.01 per evaluation (Real-time checks).
-   **Enterprise:** Custom SLA, on-prem deployment, custom policy packs.

### Go-to-Market Plan
-   **Milestone 1 (M3):** Berlin HealthTech Pilot program (5 POCs).
-   **Milestone 2 (M9):** DACH Region expansion (15 paying customers).
-   **Milestone 3 (M18):** EU Regulatory Partnerships (Integration with auditing firms).

### Commercialisation Strategy
**Direct Sales:** Target CTOs and Compliance Officers in Berlin/Munich HealthTech.
**Partnerships:** Partner with AI Development Agencies who build apps for regulated clients.

---

## 6. Team and management – approx. 2 pages

### Team Members
| Name | Gender | Founder | Position | Key competences | Commitment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Gopalkrishna Yamijala | Male | Y | CEO/CTO | 10+ years backend, AI Act systems, AWS, TypeScript, agile coach | 100% |

### Governance & Advisors
-   **Governance:** Flat structure currently; Board of Advisors being finalized for Step 2 interviews.
-   **ESOP:** Plan to implement ESOP in Year 1 to attract top-tier engineering talent in Berlin.

---

## 7. Risks - approx. 3 pages

### Risk Table
| Risk | Likelihood | Severity | Mitigation |
| :--- | :--- | :--- | :--- |
| **Regulatory Change** | Medium | High | Modular policy engine; updates take hours, not months. |
| **Latency/Performance** | Low | Medium | Edge deployment and caching; optimized evaluation chains. |
| **Competition (Big Tech)**| Medium | Low | Neutrality; we support *all* models (OpenAI, Anthropic, Gemini). |

### Legal & Regulatory Requirement Strategy
We map all technical features to the **Article 11 (Technical Documentation)** and **Article 12 (Record-keeping)** requirements of the EU AI Act. We are targeting a SOC2 Type II certification by M18.

---

## 8. Financial Plan – approx. 2 pages

The **€1,000,000 Grant** will be allocated as follows:
-   **Personnel (50%):** €500k to hire 2 Senior Full-stack Engineers and 1 Regulatory Specialist.
-   **Development & Testing (20%):** €200k for infrastructure, AI API costs, and edge scaling.
-   **GTM & Marketing (15%):** €150k for conference presence, sales staff, and pilot subsidies.
-   **Legal & Certification (15%):** €150k for DiGA/MDR legal consultancy and ISO/SOC2 audits.

*Note: As a grant-only request, we demonstrate financial viability through the founder's existing consulting revenue and runway, ensuring the project reaches commercial sustainability without immediate VC equity.*

---

# Part 2 – EIC Specific information

## 9. Implementation Plan – approx. 12 pages, including tables

### Work Plan Structure
The 24-month project is divided into four 6-month cycles focusing on Core Compliance, Sector Expansion, Enterprise Resilience, and Market Leadership.

### List of Work Packages (Table 3.1a)
| WP | Type | Title | Objectives | Lead | PM | Start | End | TRL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Tech | AI Act Core | 100% article coverage | Coordinator | 12 | 1 | 6 | 7 |
| 2 | Tech | HealthTech Pack | DiGA/MDR validation | Coordinator | 12 | 4 | 12 | 8 |
| 3 | Market | Enterprise Scale | Multi-region, <100ms | Coordinator | 6 | 12 | 18 | 8 |
| 4 | Market | DACH Leadership | 15 Enterprise Pilots | Coordinator | 18 | 1 | 24 | 9 |

### Deliverables (Table 3.1c)
1.  **D1.1 (M6):** Full AI Act Policy Library (Article 5-73).
2.  **D2.1 (M12):** DiGA Compliance Certificate (Technical Proof).
3.  **D3.1 (M18):** SOC2 Type II Audit Report.
4.  **D4.1 (M24):** Final Commercial Traction Report (€1M ARR Proof).

### Milestones (Table 3.1d)
1.  **M1 (M6):** System ready for high-risk regulation enforcement.
2.  **M2 (M12):** First paying DiGA customer onboarded.
3.  **M3 (M18):** Infrastructure capacity reaches 1M evals/day.

---

## 10. How EU support takes the company to the next value point – approx. 3 pages

The EIC support is critical because "RegTech" for AI is currently in a "high-risk" valley. Private VCs are hesitant until the AI Act is fully enforced. The EIC grant allows us to build the **gold standard** of technical compliance *before* the market becomes flooded, ensuring Europe leads in AI Governance.

### Future Funding Strategy
Post-grant (M24), we will be at TRL 9 with €1M ARR, making the company an ideal candidate for a Series A round of €5M-€10M from European deep-tech VCs.

---

## 11. The EIC funding request – approx. 1 page

**Type:** Grant Only.
**Amount:** €1,000,000.
**Evidence of Financial Means:** The applicant has successfully bootstrapped the MVP to TRL 6-7. The company maintains a lean operational structure and will utilize the grant to transition from solo-founder R&D to a scaled commercial team. Revenue from the first 5 pilots (supported by HelloBetter discussions) will provide the necessary match-funding and scaling capital for TRL 9 activities.

---

## 12. Broad impacts – approx. 1 page

**Societal Impact:** By ensuring mental health chatbots are safe and compliant, we prevent medical misinformation and reduce crisis escalation failures.
**Economic Impact:** Helps European startups compete globally by having "Compliance Built-In," reducing their legal overhead.
**Job Creation:** We expect to create 12 high-skilled technical and regulatory roles in Berlin by M24.
**SDG Contribution:** 
-   **SDG 3:** Good Health and Well-being (Safety in digital health).
-   **SDG 9:** Industry, Innovation, and Infrastructure (New AI standards).

---

*(End of Part B)*

---

## References

1.  **European Parliament and Council (2024).** *Regulation (EU) 2024/1689 of the European Parliament and of the Council of 13 June 2024 laying down harmonised rules on artificial intelligence (Artificial Intelligence Act).* [Link](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689)
2.  **GII Research (2024).** *Europe Conversational AI Market Size, Share & Industry Trends Analysis Report By Offering, By Type, By Deployment Mode, By Technology, By Vertical, By Regional Outlook and Forecast, 2023 - 2031.* [Link](https://www.giiresearch.com/report/kbv1427138-europe-conversational-ai-market-size-share.html)
3.  **BfArM (2023).** *The Fast-Track Process for Digital Health Applications (DiGA) according to Section 139e SGB V.* [Link](https://www.bfarm.de/EN/Medical-devices/Tasks/DiGA-and-DiPA/DiGA/_node.html)
4.  **National Eating Disorders Association (2023).** *Statement on Tessa Chatbot suspension.* [Case context for AI risk].
5.  **European Commission (2024).** *Guidelines for the use of artificial intelligence in the preparation of funding applications.*

