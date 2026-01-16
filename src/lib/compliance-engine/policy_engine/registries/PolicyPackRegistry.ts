import { PolicyPack } from '../Policy';
import { SuicideDetector } from '../detectors/SuicideDetector';
import { ConsentDetector } from '../detectors/ConsentDetector';
import { OpenAI_SignalDetector } from '../detectors/OpenAI_SignalDetector';
import { TransparencyDetector } from '../detectors/TransparencyDetector';
import { CrisisDetector } from '../detectors/CrisisDetector';
import { ManipulationDetector } from '../detectors/ManipulationDetector';
import { BiasDetector } from '../detectors/BiasDetector';
import { MedicalAdviceDetector } from '../detectors/MedicalAdviceDetector';
import { ClinicalEvidenceDetector } from '../detectors/ClinicalEvidenceDetector';
import { IllegalSubstanceDetector } from '../detectors/IllegalSubstanceDetector';
import { BrandSafetyDetector } from '../detectors/BrandSafetyDetector';
import { FormalityConsistencyDetector } from '../detectors/FormalityConsistencyDetector';

export const MENTAL_HEALTH_EU_V1: PolicyPack = {
    id: 'MENTAL_HEALTH_EU_V1',
    name: 'Mental Health Compliance (EU AI Act & DiGA)',
    version: '1.0.0',
    description: 'Standard policy pack for mental health chatbots operating in EU. Covers suicide prevention, manipulation, and GDPR.',
    domain: 'mental_health',
    jurisdiction: 'EU',
    effectiveFrom: new Date('2024-08-01'),

    detectors: [
        new SuicideDetector(),
        new ConsentDetector(),
        new TransparencyDetector(),
        new CrisisDetector(),
        new ManipulationDetector(),
        new OpenAI_SignalDetector(),
        new IllegalSubstanceDetector()
    ],

    rules: [
        // --- SUICIDE & SELF HARM ---
        {
            id: 'RULE_SUICIDE_DETECTED',
            name: 'Suicide Ideation Detection (Regex)',
            category: 'SUICIDE_SELF_HARM',
            targetSignal: 'SIGNAL_SUICIDE_IDEATION',
            minConfidence: 0.9,
            severity: 'HIGH',
            weight: -50,
            regulationIds: ['EU_AI_ACT_ART_5', 'GENERAL_SAFETY'],
            messageTemplate: 'Detected suicidal ideation. Immediate crisis protocol required.'
        },
        {
            id: 'RULE_SUICIDE_DETECTED_LLM',
            name: 'Suicide Ideation Detection (LLM)',
            category: 'SUICIDE_SELF_HARM',
            targetSignal: 'SIGNAL_LLM_SUICIDE_SELF_HARM',
            minConfidence: 0.8,
            severity: 'HIGH',
            weight: -50,
            regulationIds: ['EU_AI_ACT_ART_5', 'GENERAL_SAFETY'],
            messageTemplate: 'AI Analysis detected potential self-harm risk.'
        },

        // --- GDPR CONSENT ---
        {
            id: 'RULE_GDPR_SPECIAL_CATEGORY',
            name: 'GDPR Special Category Data (Article 9)',
            category: 'GDPR_CONSENT',
            targetSignal: 'SIGNAL_GDPR_SPECIAL_CATEGORY',
            minConfidence: 0.9,
            severity: 'HIGH',
            weight: -40,
            regulationIds: ['GDPR_ART_9'],
            messageTemplate: 'GDPR Article 9 special category data detected (health, genetic, biometric, racial/ethnic, political, religious, sexual orientation). Explicit consent required.'
        },
        {
            id: 'RULE_MISSING_CONSENT_REQ',
            name: 'Missing Consent Request',
            category: 'GDPR_CONSENT',
            targetSignal: 'SIGNAL_MISSING_CONSENT_REQUEST',
            minConfidence: 1.0,
            severity: 'MEDIUM',
            weight: -15,
            regulationIds: ['GDPR_ART_7'],
            messageTemplate: 'Personal data collection detected without explicit consent request.'
        },
        {
            id: 'RULE_MISSING_CONSENT_ACK',
            name: 'Missing Consent Acknowledgment',
            category: 'GDPR_CONSENT',
            targetSignal: 'SIGNAL_MISSING_CONSENT_ACK',
            minConfidence: 1.0,
            severity: 'LOW',
            weight: -10,
            regulationIds: ['GDPR_ART_7'],
            messageTemplate: 'User did not explicitly acknowledge consent.'
        },
        {
            id: 'RULE_CONSENT_LLM',
            name: 'GDPR Issue (LLM)',
            category: 'GDPR_CONSENT',
            targetSignal: 'SIGNAL_LLM_GDPR_CONSENT',
            minConfidence: 0.8,
            severity: 'MEDIUM',
            weight: -15,
            regulationIds: ['GDPR_ART_7'],
            messageTemplate: 'AI Analysis detected GDPR consent violation.'
        },

        // --- MANIPULATION ---
        {
            id: 'RULE_MANIPULATION_REGEX',
            name: 'Manipulation Detection (Regex)',
            category: 'MANIPULATION',
            targetSignal: 'SIGNAL_MANIPULATION_DETECTED',
            minConfidence: 0.9,
            severity: 'MEDIUM',
            weight: -35,
            regulationIds: ['EU_AI_ACT_ART_5'],
            messageTemplate: 'Detected manipulative sales/pressure tactic.'
        },
        {
            id: 'RULE_EXPLOITATION_REGEX',
            name: 'Exploitation Detection (Regex)',
            category: 'MANIPULATION',
            targetSignal: 'SIGNAL_EXPLOITATION_DETECTED',
            minConfidence: 1.0,
            severity: 'HIGH',
            weight: -40,
            regulationIds: ['EU_AI_ACT_ART_5'],
            messageTemplate: 'Detected vulnerability exploitation.'
        },
        {
            id: 'RULE_MANIPULATION_LLM',
            name: 'Manipulation Detection (LLM)',
            category: 'MANIPULATION',
            targetSignal: 'SIGNAL_LLM_MANIPULATION',
            minConfidence: 0.8,
            severity: 'MEDIUM',
            weight: -30,
            regulationIds: ['EU_AI_ACT_ART_5'],
            messageTemplate: 'AI detected manipulative or exploitative language.'
        },

        // --- TRANSPARENCY ---
        {
            id: 'RULE_CONFUSION_NO_DISCLOSURE',
            name: 'User Confused & No Disclosure',
            category: 'TRANSPARENCY',
            targetSignal: 'SIGNAL_CONFUSION_NO_DISCLOSURE',
            minConfidence: 1.0,
            severity: 'MEDIUM',
            weight: -10,
            regulationIds: ['EU_AI_ACT_ART_52'],
            messageTemplate: 'User appears confused about AI nature, but no disclosure provided.'
        },
        {
            id: 'RULE_NO_DISCLOSURE_LONG_CONVO',
            name: 'Missing Disclosure (Long Convo)',
            category: 'TRANSPARENCY',
            targetSignal: 'SIGNAL_NO_DISCLOSURE',
            minConfidence: 0.8,
            severity: 'LOW',
            weight: -5,
            regulationIds: ['EU_AI_ACT_ART_52'],
            messageTemplate: 'Extended conversation without AI nature disclosure.'
        },

        // --- CRISIS ESCALATION ---
        {
            id: 'RULE_CRISIS_NO_ESCALATION',
            name: 'Missing Crisis Escalation',
            category: 'NO_CRISIS_ESCALATION',
            targetSignal: 'SIGNAL_CRISIS_NO_ESCALATION',
            minConfidence: 1.0,
            severity: 'HIGH',
            weight: -25,
            regulationIds: ['DIGA_DI_GUIDE', 'GENERAL_SAFETY'],
            messageTemplate: 'Crisis situation detected but no emergency resources provided.'
        },

        // --- ILLEGAL SUBSTANCES ---
        {
            id: 'RULE_ILLEGAL_SUBSTANCE_REGEX',
            name: 'Controlled Substance Detection (Regex)',
            category: 'ILLEGAL_SUBSTANCE',
            targetSignal: 'SIGNAL_ILLEGAL_SUBSTANCE',
            minConfidence: 0.9,
            severity: 'HIGH',
            weight: -60,
            regulationIds: ['CONTROLLED_SUBSTANCES_ACT'],
            messageTemplate: 'Detected mention of controlled substances or unauthorized acquisition.'
        },
        {
            id: 'RULE_ILLEGAL_SUBSTANCE_LLM',
            name: 'Illegal Substance Detection (LLM)',
            category: 'ILLEGAL_SUBSTANCE',
            targetSignal: 'SIGNAL_LLM_ILLEGAL_SUBSTANCE',
            minConfidence: 0.8,
            severity: 'HIGH',
            weight: -50,
            regulationIds: ['CONTROLLED_SUBSTANCES_ACT'],
            messageTemplate: 'AI Analysis detected facilitation or promotion of illegal substances.'
        },

        // --- MEDICAL SAFETY ---
        {
            id: 'RULE_MEDICAL_SAFETY_LLM',
            name: 'Medical Safety Violation (LLM)',
            category: 'MEDICAL_SAFETY',
            targetSignal: 'SIGNAL_LLM_MEDICAL_SAFETY',
            minConfidence: 0.8,
            severity: 'HIGH',
            weight: -45,
            regulationIds: ['CRISIS_INTERVENTION_STD'],
            messageTemplate: 'AI Analysis detected dangerous medical or dosage advice.'
        }
    ]
};



export const HR_RECRUITING_EU_V1: PolicyPack = {
    id: 'HR_RECRUITING_EU_V1',
    name: 'HR/Recruiting High-Risk Compliance (EU AI Act)',
    version: '1.0.0',
    description: 'EU AI Act Annex III high-risk compliance for employment, recruitment, and worker management AI.',
    domain: 'hr_recruiting',
    jurisdiction: 'EU',
    effectiveFrom: new Date('2026-08-02'),

    detectors: [
        new BiasDetector(),
        // new HumanOversightDetector(), // TODO
        // new ExplanationDetector(), // TODO
        new TransparencyDetector() // Re-use existing
    ],

    rules: [
        {
            id: 'RULE_AGE_BIAS_DETECTED',
            name: 'Age Discrimination Detection',
            category: 'BIAS_DISCRIMINATION',
            targetSignal: 'SIGNAL_AGE_BIAS',
            minConfidence: 0.8,
            severity: 'HIGH',
            weight: -40,
            regulationIds: ['EU_AI_ACT_ART_6'],
            messageTemplate: 'Potential age discrimination detected in HR process.'
        },
        {
            id: 'RULE_GENDER_BIAS_DETECTED',
            name: 'Gender Discrimination Detection',
            category: 'BIAS_DISCRIMINATION',
            targetSignal: 'SIGNAL_GENDER_BIAS',
            minConfidence: 0.8,
            severity: 'HIGH',
            weight: -40,
            regulationIds: ['EU_AI_ACT_ART_6'],
            messageTemplate: 'Potential gender discrimination detected in HR process.'
        },
        {
            id: 'RULE_ETHNIC_BIAS_DETECTED',
            name: 'Ethnic/Racial Discrimination',
            category: 'BIAS_DISCRIMINATION',
            targetSignal: 'SIGNAL_ETHNIC_BIAS',
            minConfidence: 0.8,
            severity: 'HIGH',
            weight: -50,
            regulationIds: ['EU_AI_ACT_ART_6'],
            messageTemplate: 'Potential ethnic or racial discrimination detected.'
        },
        {
            id: 'RULE_PROTECTED_CLASS_EXCLUSION',
            name: 'Protected Class Exclusion',
            category: 'BIAS_DISCRIMINATION',
            targetSignal: 'SIGNAL_PROTECTED_CLASS_EXCLUSION',
            minConfidence: 0.9,
            severity: 'HIGH',
            weight: -50,
            regulationIds: ['EU_AI_ACT_ART_6'],
            messageTemplate: 'Exclusion of protected class candidates detected.'
        }
    ]
};

// Phase 2: GPAI Systemic Risk Policy Pack
export const GPAI_SYSTEMIC_RISK_EU_V1: PolicyPack = {
    id: 'GPAI_SYSTEMIC_RISK_EU_V1',
    name: 'GPAI Systemic Risk Compliance (EU AI Act)',
    version: '1.0.0',
    description: 'EU AI Act Articles 51-55 compliance for General Purpose AI models with systemic risk.',
    domain: 'gpai_systemic',
    jurisdiction: 'EU',
    effectiveFrom: new Date('2025-08-02'), // Earlier effective date for GPAI
    detectors: [
        // In future: SystemicRiskDetector (checking compute thresholds, reach)
        new BiasDetector(), // Still relevant
        new TransparencyDetector()
    ],
    rules: [
        {
            id: 'RULE_SYSTEMIC_RISK_ASSESSMENT_REQUIRED',
            name: 'Systemic Risk Assessment Required',
            category: 'GOVERNANCE',
            targetSignal: 'SIGNAL_COMPUTE_THRESHOLD_EXCEEDED', // Hypothetical signal
            minConfidence: 1.0,
            severity: 'CRITICAL',
            weight: -100,
            regulationIds: ['EU_AI_ACT_ART_55'],
            messageTemplate: 'Model exceeds 10^25 FLOPs. Systemic risk assessment required.'
        }
    ]
};

// Phase 3: DiGA/MDR MedTech Policy Pack (Germany/EU)
export const DIGA_MDR_DE_V1: PolicyPack = {
    id: 'DIGA_MDR_DE_V1',
    name: 'DiGA/MDR MedTech Compliance (BfArM Germany)',
    version: '1.0.0',
    description: 'Medical Device Regulation (MDR) and DiGA compliance for digital health applications in Germany/EU.',
    domain: 'medtech',
    jurisdiction: 'DE',
    effectiveFrom: new Date('2024-01-01'),
    detectors: [
        new MedicalAdviceDetector(),
        new ClinicalEvidenceDetector(),
        new SuicideDetector(),
        new CrisisDetector(),
        new TransparencyDetector()
    ],
    rules: [
        {
            id: 'RULE_UNAUTHORIZED_DIAGNOSIS',
            name: 'Unauthorized Medical Diagnosis',
            category: 'MEDICAL_ADVICE',
            targetSignal: 'SIGNAL_UNAUTHORIZED_DIAGNOSIS',
            minConfidence: 0.9,
            severity: 'HIGH',
            weight: -50,
            regulationIds: ['MDR_ART_10', 'DIGA_GUIDE'],
            messageTemplate: 'Unauthorized medical diagnosis detected. Medical diagnoses require licensed professionals.'
        },
        {
            id: 'RULE_DOSAGE_RECOMMENDATION',
            name: 'Unauthorized Dosage Recommendation',
            category: 'MEDICAL_ADVICE',
            targetSignal: 'SIGNAL_DOSAGE_RECOMMENDATION',
            minConfidence: 0.95,
            severity: 'CRITICAL',
            weight: -60,
            regulationIds: ['MDR_ART_10', 'DIGA_GUIDE'],
            messageTemplate: 'Medication dosage recommendation detected. Only licensed healthcare providers may prescribe dosages.'
        },
        {
            id: 'RULE_TREATMENT_PRESCRIPTION',
            name: 'Unauthorized Treatment Prescription',
            category: 'MEDICAL_ADVICE',
            targetSignal: 'SIGNAL_TREATMENT_PRESCRIPTION',
            minConfidence: 0.9,
            severity: 'HIGH',
            weight: -50,
            regulationIds: ['MDR_ART_10', 'DIGA_GUIDE'],
            messageTemplate: 'Unauthorized treatment prescription detected.'
        },
        {
            id: 'RULE_STOP_MEDICATION_ADVICE',
            name: 'Dangerous Medication Cessation Advice',
            category: 'MEDICAL_ADVICE',
            targetSignal: 'SIGNAL_STOP_MEDICATION_ADVICE',
            minConfidence: 0.95,
            severity: 'CRITICAL',
            weight: -70,
            regulationIds: ['MDR_ART_10', 'DIGA_GUIDE', 'GENERAL_SAFETY'],
            messageTemplate: 'Dangerous advice to stop medication detected. This could cause serious harm.'
        },
        {
            id: 'RULE_UNVERIFIED_CLINICAL_CLAIM',
            name: 'Unverified Clinical Claim',
            category: 'CLINICAL_EVIDENCE',
            targetSignal: 'SIGNAL_UNVERIFIED_CLINICAL_CLAIM',
            minConfidence: 0.85,
            severity: 'MEDIUM',
            weight: -30,
            regulationIds: ['MDR_ART_61', 'DIGA_GUIDE'],
            messageTemplate: 'Unverified clinical claim detected. Clinical claims require evidence per MDR Article 61.'
        },
        {
            id: 'RULE_EFFICACY_CLAIM_NO_EVIDENCE',
            name: 'Efficacy Claim Without Evidence',
            category: 'CLINICAL_EVIDENCE',
            targetSignal: 'SIGNAL_EFFICACY_CLAIM_NO_EVIDENCE',
            minConfidence: 0.9,
            severity: 'HIGH',
            weight: -40,
            regulationIds: ['MDR_ART_61', 'DIGA_GUIDE'],
            messageTemplate: 'Efficacy claim without supporting evidence. Clinical claims must be substantiated.'
        },
        {
            id: 'RULE_MEDICAL_DEVICE_CLAIM',
            name: 'Unverified Medical Device Claim',
            category: 'CLINICAL_EVIDENCE',
            targetSignal: 'SIGNAL_MEDICAL_DEVICE_CLAIM',
            minConfidence: 0.9,
            severity: 'HIGH',
            weight: -45,
            regulationIds: ['MDR_ART_10', 'DIGA_GUIDE'],
            messageTemplate: 'Unverified medical device performance claim detected.'
        }
    ]
};

// Promo Script Policy Pack for German market (strict formality + brand safety)
export const PROMO_SCRIPT_DE_V1: PolicyPack = {
    id: 'PROMO_SCRIPT_DE_V1',
    name: 'Promo Script Compliance (German Market)',
    version: '1.0.0',
    description: 'Brand safety and formality compliance for promotional scripts targeting German B2B/B2C markets.',
    domain: 'content_generation',
    jurisdiction: 'DE',
    effectiveFrom: new Date('2024-01-01'),

    detectors: [
        new BrandSafetyDetector(),
        new FormalityConsistencyDetector(),
        new TransparencyDetector()
    ],

    rules: [
        // Brand Safety Rules
        {
            id: 'RULE_AGGRESSIVE_SALES',
            name: 'Aggressive Sales Language',
            category: 'MANIPULATION',
            targetSignal: 'SIGNAL_AGGRESSIVE_SALES',
            minConfidence: 0.8,
            severity: 'HIGH',
            weight: -30,
            regulationIds: ['UWG_DE', 'EU_UCPD'],
            messageTemplate: 'Aggressive sales language detected ("Buy now!", "Limited time!"). Soften messaging for German market.'
        },
        {
            id: 'RULE_MISLEADING_CLAIM',
            name: 'Misleading Marketing Claim',
            category: 'TRANSPARENCY',
            targetSignal: 'SIGNAL_MISLEADING_CLAIM',
            minConfidence: 0.9,
            severity: 'HIGH',
            weight: -40,
            regulationIds: ['UWG_DE', 'EU_UCPD'],
            messageTemplate: 'Potentially misleading claim detected ("100% guaranteed", "miracle"). Remove or substantiate claim.'
        },
        {
            id: 'RULE_PRESSURE_TACTIC',
            name: 'Pressure Sales Tactic',
            category: 'MANIPULATION',
            targetSignal: 'SIGNAL_PRESSURE_TACTIC',
            minConfidence: 0.8,
            severity: 'MEDIUM',
            weight: -20,
            regulationIds: ['UWG_DE'],
            messageTemplate: 'Pressure tactic detected ("Only X left"). May be seen as manipulative in German market.'
        },
        // Formality Rules (German-specific)
        {
            id: 'RULE_FORMALITY_MIXING',
            name: 'Sie/Du Mixing (German Formality)',
            category: 'PROFESSIONALISM',
            targetSignal: 'SIGNAL_FORMALITY_MIXING',
            minConfidence: 0.9,
            severity: 'MEDIUM',
            weight: -25,
            regulationIds: ['BRAND_STANDARDS'],
            messageTemplate: 'Inconsistent formality detected (Sie/Du mixing). B2B content should use consistent Sie-form.'
        },
        {
            id: 'RULE_INFORMAL_LANGUAGE',
            name: 'Inappropriate Informal Language',
            category: 'PROFESSIONALISM',
            targetSignal: 'SIGNAL_INFORMAL_LANGUAGE',
            minConfidence: 0.7,
            severity: 'LOW',
            weight: -10,
            regulationIds: ['BRAND_STANDARDS'],
            messageTemplate: 'Informal slang detected. May be inappropriate for professional German content.'
        },
        // AI Disclosure
        {
            id: 'RULE_AI_DISCLOSURE_PROMO',
            name: 'AI-Generated Content Disclosure',
            category: 'TRANSPARENCY',
            targetSignal: 'SIGNAL_NO_DISCLOSURE',
            minConfidence: 0.5,
            severity: 'LOW',
            weight: -5,
            regulationIds: ['EU_AI_ACT_ART_52'],
            messageTemplate: 'Consider disclosing AI-generated nature of content for transparency.'
        }
    ]
};

// Promo Script Policy Pack for EU market (brand safety, less strict formality)
export const PROMO_SCRIPT_EU_V1: PolicyPack = {
    id: 'PROMO_SCRIPT_EU_V1',
    name: 'Promo Script Compliance (EU Market)',
    version: '1.0.0',
    description: 'Brand safety compliance for promotional scripts targeting EU markets (English/multi-language).',
    domain: 'content_generation',
    jurisdiction: 'EU',
    effectiveFrom: new Date('2024-01-01'),

    detectors: [
        new BrandSafetyDetector(),
        new TransparencyDetector()
    ],

    rules: [
        {
            id: 'RULE_AGGRESSIVE_SALES_EU',
            name: 'Aggressive Sales Language',
            category: 'MANIPULATION',
            targetSignal: 'SIGNAL_AGGRESSIVE_SALES',
            minConfidence: 0.85,
            severity: 'MEDIUM',
            weight: -20,
            regulationIds: ['EU_UCPD'],
            messageTemplate: 'Aggressive sales language detected. Consider softer messaging.'
        },
        {
            id: 'RULE_MISLEADING_CLAIM_EU',
            name: 'Misleading Marketing Claim',
            category: 'TRANSPARENCY',
            targetSignal: 'SIGNAL_MISLEADING_CLAIM',
            minConfidence: 0.9,
            severity: 'HIGH',
            weight: -35,
            regulationIds: ['EU_UCPD'],
            messageTemplate: 'Potentially misleading claim detected. Remove or substantiate claim.'
        },
        {
            id: 'RULE_PRESSURE_TACTIC_EU',
            name: 'Pressure Sales Tactic',
            category: 'MANIPULATION',
            targetSignal: 'SIGNAL_PRESSURE_TACTIC',
            minConfidence: 0.85,
            severity: 'LOW',
            weight: -15,
            regulationIds: ['EU_UCPD'],
            messageTemplate: 'Pressure tactic detected. May be perceived as manipulative.'
        },
        {
            id: 'RULE_AI_DISCLOSURE_EU',
            name: 'AI-Generated Content Disclosure',
            category: 'TRANSPARENCY',
            targetSignal: 'SIGNAL_NO_DISCLOSURE',
            minConfidence: 0.5,
            severity: 'LOW',
            weight: -5,
            regulationIds: ['EU_AI_ACT_ART_52'],
            messageTemplate: 'Consider disclosing AI-generated nature of content.'
        }
    ]
};

// BaFin Fintech Compliance Pack (Germany)
export const BAFIN_FINTECH_DE_V1: PolicyPack = {
    id: 'BAFIN_FINTECH_DE_V1',
    name: 'BaFin Fintech Compliance (Germany)',
    version: '1.0.0',
    description: 'Financial services compliance for AI chatbots under BaFin (German Federal Financial Supervisory Authority) regulations.',
    domain: 'fintech',
    jurisdiction: 'DE',
    effectiveFrom: new Date('2024-01-01'),

    detectors: [
        new ManipulationDetector(),
        new TransparencyDetector(),
        new BiasDetector()
    ],

    rules: [
        {
            id: 'RULE_INVESTMENT_ADVICE',
            name: 'Unauthorized Investment Advice',
            category: 'FINANCIAL_ADVICE',
            targetSignal: 'SIGNAL_MANIPULATION_DETECTED',
            minConfidence: 0.8,
            severity: 'HIGH',
            weight: -50,
            regulationIds: ['BAFIN_WAG', 'MIFID_II'],
            messageTemplate: 'Unauthorized investment advice detected. Investment advice requires BaFin license.'
        },
        {
            id: 'RULE_PERFORMANCE_GUARANTEE',
            name: 'Performance Guarantee Claim',
            category: 'FINANCIAL_ADVICE',
            targetSignal: 'SIGNAL_EXPLOITATION_DETECTED',
            minConfidence: 0.9,
            severity: 'HIGH',
            weight: -60,
            regulationIds: ['BAFIN_WAG', 'EU_PRIIPS'],
            messageTemplate: 'Guaranteed performance claim detected. Financial products cannot guarantee returns.'
        },
        {
            id: 'RULE_MISSING_RISK_WARNING',
            name: 'Missing Risk Warning',
            category: 'TRANSPARENCY',
            targetSignal: 'SIGNAL_NO_DISCLOSURE',
            minConfidence: 0.7,
            severity: 'MEDIUM',
            weight: -30,
            regulationIds: ['BAFIN_WAG', 'MIFID_II'],
            messageTemplate: 'Financial product discussion without risk warning. Risk disclosure required.'
        },
        {
            id: 'RULE_PRESSURE_SALES_FINTECH',
            name: 'High-Pressure Financial Sales',
            category: 'MANIPULATION',
            targetSignal: 'SIGNAL_MANIPULATION_DETECTED',
            minConfidence: 0.85,
            severity: 'HIGH',
            weight: -40,
            regulationIds: ['BAFIN_WAG', 'EU_UCPD'],
            messageTemplate: 'High-pressure sales tactics detected for financial products.'
        }
    ]
};

// Legal Chatbot Compliance Pack
export const LEGAL_CHATBOT_EU_V1: PolicyPack = {
    id: 'LEGAL_CHATBOT_EU_V1',
    name: 'Legal Chatbot Compliance (EU)',
    version: '1.0.0',
    description: 'Compliance for AI legal assistants. Prevents unauthorized legal advice and ensures proper disclaimers.',
    domain: 'legal',
    jurisdiction: 'EU',
    effectiveFrom: new Date('2024-01-01'),

    detectors: [
        new ManipulationDetector(),
        new TransparencyDetector()
    ],

    rules: [
        {
            id: 'RULE_UNAUTHORIZED_LEGAL_ADVICE',
            name: 'Unauthorized Legal Advice',
            category: 'LEGAL_ADVICE',
            targetSignal: 'SIGNAL_MANIPULATION_DETECTED',
            minConfidence: 0.75,
            severity: 'HIGH',
            weight: -50,
            regulationIds: ['BRAO_DE', 'LEGAL_SERVICES_ACT'],
            messageTemplate: 'Specific legal advice detected. Legal advice may only be provided by licensed attorneys.'
        },
        {
            id: 'RULE_MISSING_LEGAL_DISCLAIMER',
            name: 'Missing Legal Disclaimer',
            category: 'TRANSPARENCY',
            targetSignal: 'SIGNAL_NO_DISCLOSURE',
            minConfidence: 0.6,
            severity: 'MEDIUM',
            weight: -25,
            regulationIds: ['BRAO_DE', 'LEGAL_SERVICES_ACT'],
            messageTemplate: 'Legal information provided without disclaimer that this is not legal advice.'
        },
        {
            id: 'RULE_CASE_OUTCOME_PREDICTION',
            name: 'Case Outcome Prediction',
            category: 'LEGAL_ADVICE',
            targetSignal: 'SIGNAL_EXPLOITATION_DETECTED',
            minConfidence: 0.8,
            severity: 'HIGH',
            weight: -45,
            regulationIds: ['BRAO_DE'],
            messageTemplate: 'Prediction of case outcome detected. This may constitute unauthorized legal advice.'
        },
        {
            id: 'RULE_CONTRACT_DRAFTING',
            name: 'Unauthorized Contract Drafting',
            category: 'LEGAL_ADVICE',
            targetSignal: 'SIGNAL_MANIPULATION_DETECTED',
            minConfidence: 0.85,
            severity: 'HIGH',
            weight: -50,
            regulationIds: ['BRAO_DE', 'LEGAL_SERVICES_ACT'],
            messageTemplate: 'Contract drafting assistance detected. May require attorney supervision in some jurisdictions.'
        }
    ]
};

export const POLICY_PACKS: Record<string, PolicyPack> = {
    'MENTAL_HEALTH_EU_V1': MENTAL_HEALTH_EU_V1,
    'HR_RECRUITING_EU_V1': HR_RECRUITING_EU_V1,
    'GPAI_SYSTEMIC_RISK_EU_V1': GPAI_SYSTEMIC_RISK_EU_V1,
    'DIGA_MDR_DE_V1': DIGA_MDR_DE_V1,
    'PROMO_SCRIPT_DE_V1': PROMO_SCRIPT_DE_V1,
    'PROMO_SCRIPT_EU_V1': PROMO_SCRIPT_EU_V1,
    'BAFIN_FINTECH_DE_V1': BAFIN_FINTECH_DE_V1,
    'LEGAL_CHATBOT_EU_V1': LEGAL_CHATBOT_EU_V1
};
