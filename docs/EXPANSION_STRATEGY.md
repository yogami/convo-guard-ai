# Client Onboarding & Expansion Strategy

## 1. Remaining Tech Steps for First Client Onboarding
Current Status: The system effectively blocks unsafe content ("Fail Safe"). However, the current "Per-Tenant Configuration" is **in-memory and global**. Toggling a rule changes it for *everyone*.

To onboard a real client, you need **Tenant Isolation**:

### Phase 1: MVP Onboarding (The "Concierge" Model)
*   **Authentication**: Implement simple API Key protection (Middleware).
    *   *Action*: Add `x-api-key` header check in `/api/validate`.
*   **Configuration**: Move `enabled` state from In-Memory Array to Database (Supabase).
    *   *Action*: Create `tenant_configs` table in Supabase.
    *   *Action*: Update `ExternalPolicyRepository` to fetch config based on `x-api-key`.
*   **SLA & Reliability**:
    *   *Action*: Set up Uptime Monitoring (e.g., BetterStack) to prove 99.9% availability.

### Phase 2: Self-Serve (The "SaaS" Model)
*   **Developer Portal**: A page where clients generate their own API keys.
*   **Analytics Dashboard**: Show them *their* traffic, not global traffic.
*   **Billing Integration**: Stripe integration based on "validations per month".

---

## 2. Market Expansion: Beyond Mental Health & DiGA

The "Compliance Logic Gate" architecture you built is industry-agnostic. The *Framework* changes, but the *Engine* stays the same.

### Target Vertical A: FinTech / BFSI (High Value)
*   **The Problem**: AI Financial Advisors (Robo-advisors) hallucinating returns or giving illegal investment advice.
*   **The Guard**: "SEC Compliance Guard".
*   **New Policies**:
    *   `NO_PROMISED_RETURNS`: Block "You will make 10% profit."
    *   `FIDUCIARY_CHECK`: Ensure disclaimer is present.
    *   `DATA_LEAK`: Prevent outputting credit card numbers/SSNs.
*   **Pitch**: "Prevent your AI from getting you sued by the SEC."

### Target Vertical B: EdTech & Youth Safety (High Volume)
*   **The Problem**: AI Tutors exposing children to age-inappropriate content or helping them cheat.
*   **The Guard**: "COPPA/FERPA Safety Net".
*   **New Policies**:
    *   `AGE_APPROPRIATE`: Detect and rewrite complex/adult themes.
    *   `ACADEMIC_INTEGRITY`: Flag "Write my essay" requests vs "Help me understand."
    *   `PII_PROTECTION`: Strict block on sharing home addresses/school names.
*   **Pitch**: "Safe AI for Classrooms (COPPA Compliant)."

### Target Vertical C: Legal Tech (Niche but Critical)
*   **The Problem**: AI Chatbots giving specific legal advice (Unauthorized Practice of Law).
*   **The Guard**: "UPL (Unauthorized Practice of Law) Shield".
*   **New Policies**:
    *   `NO_Legal_ADVICE`: Block specific case strategy advice.
    *   `JURISDICTION_WARN`: Force "I am not a lawyer" disclaimers.

---

## 3. Immediate Action Plan
1.  **Fix Production Key**: Ensure `gemini-2.0-flash` is active and key is valid.
2.  **Add Auth Middleware**: Secure the `/api/validate` endpoint.
3.  **Database Config**: Move Policy Toggles to Supabase (User ID -> Policy Config).
4.  **Pitch Deck Update**: Add slides for "Financial Guard" and "EduSafe".
