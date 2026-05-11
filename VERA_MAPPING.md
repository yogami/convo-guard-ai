# VERA Compliance Mapping: ConvoGuard AI

> **Verifiable Enforcement for Runtime Agents Element**: 🛡️ **Element 3 — Data Governance ("What are you eating? What are you serving?")**
> **VERA Spec**: [github.com/massivescale-ai/agentic-trust-framework](https://github.com/massivescale-ai/agentic-trust-framework)

## VERA Data Governance Requirements → Implementation

| VERA Requirement | VERA Description | Implementation Status |
|:---|:---|:---|
| **Schema Validation** | Inputs conform to expected structure and types | ✅ Input validation pipeline before inference |
| **Injection Prevention** | Detection of prompt injection and adversarial inputs | ✅ Multi-vector prompt injection defense (ONNX runtime) |
| **PII/PHI Protection** | Automated detection and masking of sensitive data | ✅ API key/secret interception + PII detection pre-network |
| **Output Validation** | Outputs conform to expected structure and content policies | ✅ 6 compliance rules (suicide prevention, GDPR, crisis, medical safety, terminology, data residency) |
| **Data Lineage** | Tracking of data provenance through the agent pipeline | ✅ Signed audit logs with EU AI Act Article mapping (11, 12, 73) |

## Beyond VERA: Where ConvoGuard Exceeds the Spec

| VERA Says | ConvoGuard Does |
|:---|:---|
| "Detect PII" | **Edge-deployed** — sub-20ms ONNX inference, no data leaves the device |
| "Validate outputs" | **Regulatory evidence** — signed, immutable compliance trails for EU AI Act |
| "Content filtering" | **Firewall model** — deterministic control layer, not probabilistic filter |
| "Schema validation" | **DLP at the Edge** — intercepts API keys and secrets before network transmission |

## VERA Maturity Level Support

| Agent Level | Supported | How |
|:---|:---|:---|
| **Intern** | ✅ | Passive monitoring mode — log violations without blocking |
| **Junior** | ✅ | Active filtering with human notification on blocks |
| **Senior** | ✅ | Autonomous filtering + signed audit logs + alerting |
| **Principal** | ✅ | Full A2A middleware — intercepts `x-agent-signature` requests for safety compliance |

## Compliance Mapping

| Regulation | Articles/Sections | Status |
|:---|:---|:---|
| **EU AI Act** | Articles 11, 12, 73 | ✅ Implemented |
| **GDPR** | Consent tracking | ✅ Implemented |
| **NIST 800-207** | Zero Trust data plane | 🟡 Partial alignment |

## Core Capabilities
- **Inference**: Local ONNX / DistilBERT runtime
- **Latency**: Sub-20ms (Edge-optimized)
- **Test Coverage**: 69/69 E2E tests passing
- **Compliance Rules**: 6 (suicide prevention, GDPR consent, crisis escalation, medical safety, medical terminology, data residency)

---

*Berlin AI Labs — VERA Reference Implementation*
*[Cloud Security Alliance Verifiable Enforcement for Runtime Agents](https://cloudsecurityalliance.org/blog/2026/02/02/the-agentic-trust-framework-zero-trust-governance-for-ai-agents)*
