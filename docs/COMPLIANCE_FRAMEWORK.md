# ConvoGuard Mental Health AI Compliance Framework v0.1

**Status**: Active Draft  
**Version**: 0.1.0  
**Effective Date**: 2025-12-11

## Overview
This framework defines the regulatory boundaries enforced by ConvoGuard for AI-driven Mental Health applications. It maps real-time validation logic to specific articles in the **EU AI Act**, **GDPR**, and **DiGA (Digital Health Applications)** ordinance.

Our system does not just "check keywords"; it acts as a **Regulatory Logic Gate** ensuring every conversation remains compliant with the following controls.

---

## 1. EU AI Act Compliance
*Alignment with High-Risk AI Systems (Annex III, Class 2)*

| Control ID | Regulation Reference | Requirement Description | ConvoGuard Enforcement |
| :--- | :--- | :--- | :--- |
| **MANIPULATION** | **prohibited_practice_art_5(1)(a)** | Prohibition of AI systems using subliminal or manipulative techniques to distort behavior. | **High Severity Block**: Detects urgency, pressure tactics, or behavioral nudging in AI responses. |
| **VULNERABLE_GROUPS** | **prohibited_practice_art_5(1)(b)** | Prohibition of exploiting vulnerabilities of specific groups (age, disability, social situation). | **High Severity Block**: Detects exploitation of emotional distress or cognitive impairment. |
| **TRANSPARENCY** | **transparency_art_50** | AI systems must inform natural persons that they are interacting with an AI system. | **Audit Check**: Verifies AI introduces itself as an automated agent (Context Check). |

## 2. GDPR & Data Privacy
*Alignment with General Data Protection Regulation (EU 2016/679)*

| Control ID | Regulation Reference | Requirement Description | ConvoGuard Enforcement |
| :--- | :--- | :--- | :--- |
| **GDPR_CONSENT** | **special_category_art_9(2)(a)** | Prohibits processing of health/biometric data without explicit consent. | **Dynamic Scan**: Flags conversation if user shares health data (HIV, genetic, psychiatric) without prior consent metadata. |
| **RIGHT_TO_EXPLAIN** | **art_22_automated_decision** | User right to explanation of automated decisions. | **Audit Log**: Every block/allow decision is cryptographically logged with `audit_id` for retrieval. |

## 3. DiGA (Digital Health Applications) Safety
*Alignment with BfArM Fast-Track Procedure*

| Control ID | Regulation Reference | Requirement Description | ConvoGuard Enforcement |
| :--- | :--- | :--- | :--- |
| **SUICIDE_SELF_HARM** | **patient_safety_std_1.4** | Immediate detection and crisis intervention routing for self-harm risk. | **Critical Intercept**: Real-time detection of ideation ("kill myself", "end it"). Forces override to Crisis Resource Protocol. |
| **MEDICAL_SAFETY** | **clinical_evidence_std_2.1** | Prevention of harmful or non-evidence-based medical advice. | **Fact-Check**: Blocks AI from suggesting off-label dosage or contradicting clinical guidelines (e.g., "stop insulin"). |

## 4. Controlled Substances
*Alignment with National & EU Drug Laws*

| Control ID | Regulation Reference | Requirement Description | ConvoGuard Enforcement |
| :--- | :--- | :--- | :--- |
| **ILLEGAL_SUBSTANCE** | **controlled_substances_act** | Prevention of facilitation, acquisition, or promotion of scheduled substances. | **Zero Tolerance**: Blocks requests for Schedule I/II substances (Fentanyl, Coke, Heroin) regardless of slang usage. |

---

## Audit & Traceability
All enforcement actions are logged with the following immutable metadata for auditor review (`/api/audit`):
*   `timestamp` (ISO 8601)
*   `control_id` (Mapped to Framework above)
*   `input_hash` (SHA-256 of user prompt)
*   `decision` (COMPLIANT | BLOCKED)
*   `risk_severity` (LOW | MEDIUM | HIGH)

---
*This framework is designed to evolve. Updates are pushed centrally to the `PolicyStore`, ensuring all connected tenants are instantly compliant with new regulations.*
