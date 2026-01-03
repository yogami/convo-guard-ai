/**
 * IncidentTaxonomy
 * Defines structured categories for serious incidents in conversational AI
 * 
 * Feature 2: Serious Incident Radar
 */

export type IncidentCategory =
    | 'SELF_HARM_MISHANDLING'
    | 'DANGEROUS_MEDICAL_ADVICE'
    | 'DISCRIMINATORY_DECISION'
    | 'SAFETY_PROTOCOL_VIOLATION';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TaxonomyEntry {
    id: IncidentCategory;
    name: string;
    description: string;
    defaultSeverity: IncidentSeverity;
    reportingRequired: boolean;
    regulationRefs: string[];
}

/**
 * Incident Taxonomy - structured categories for serious incidents
 */
export const INCIDENT_TAXONOMY: Record<IncidentCategory, TaxonomyEntry> = {
    'SELF_HARM_MISHANDLING': {
        id: 'SELF_HARM_MISHANDLING',
        name: 'Self-Harm/Suicidal Ideation Mishandling',
        description: 'Bot failed to appropriately escalate or respond to self-harm/suicide signals',
        defaultSeverity: 'CRITICAL',
        reportingRequired: true,
        regulationRefs: ['AI_ACT_ART_73', 'MENTAL_HEALTH_GUIDELINES']
    },
    'DANGEROUS_MEDICAL_ADVICE': {
        id: 'DANGEROUS_MEDICAL_ADVICE',
        name: 'Dangerous Medical Advice',
        description: 'Bot provided contraindicated, incorrect dosage, or unauthorized medical guidance',
        defaultSeverity: 'CRITICAL',
        reportingRequired: true,
        regulationRefs: ['AI_ACT_ART_73', 'MDR_ART_10', 'DIGA_GUIDE']
    },
    'DISCRIMINATORY_DECISION': {
        id: 'DISCRIMINATORY_DECISION',
        name: 'Discriminatory Decision',
        description: 'Bot made biased decision in high-risk context (triage, access, hiring)',
        defaultSeverity: 'HIGH',
        reportingRequired: true,
        regulationRefs: ['AI_ACT_ART_6', 'AI_ACT_ART_10']
    },
    'SAFETY_PROTOCOL_VIOLATION': {
        id: 'SAFETY_PROTOCOL_VIOLATION',
        name: 'Safety Protocol Violation',
        description: 'Bot bypassed established safety guardrails',
        defaultSeverity: 'HIGH',
        reportingRequired: true,
        regulationRefs: ['AI_ACT_ART_9']
    }
};

/**
 * Signal to incident category mapping
 */
const SIGNAL_TO_INCIDENT: Record<string, IncidentCategory> = {
    'SIGNAL_SUICIDE_RISK': 'SELF_HARM_MISHANDLING',
    'SIGNAL_SELF_HARM': 'SELF_HARM_MISHANDLING',
    'SIGNAL_CRISIS_ESCALATION': 'SELF_HARM_MISHANDLING',
    'SIGNAL_DOSAGE_RECOMMENDATION': 'DANGEROUS_MEDICAL_ADVICE',
    'SIGNAL_UNAUTHORIZED_DIAGNOSIS': 'DANGEROUS_MEDICAL_ADVICE',
    'SIGNAL_TREATMENT_PRESCRIPTION': 'DANGEROUS_MEDICAL_ADVICE',
    'SIGNAL_STOP_MEDICATION_ADVICE': 'DANGEROUS_MEDICAL_ADVICE',
    'SIGNAL_BIAS_DETECTED': 'DISCRIMINATORY_DECISION',
    'SIGNAL_AGE_BIAS': 'DISCRIMINATORY_DECISION',
    'SIGNAL_GENDER_BIAS': 'DISCRIMINATORY_DECISION',
    'SIGNAL_ETHNIC_BIAS': 'DISCRIMINATORY_DECISION',
    'SIGNAL_MANIPULATION': 'SAFETY_PROTOCOL_VIOLATION'
};

import { Signal } from '../../lib/compliance-engine/policy_engine/Signal';

export interface IncidentClassification {
    category: IncidentCategory;
    severity: IncidentSeverity;
    taxonomy: TaxonomyEntry;
}

/**
 * Classify signals into incident category
 */
export function classifyIncident(signals: Signal[]): IncidentClassification | null {
    for (const signal of signals) {
        const category = SIGNAL_TO_INCIDENT[signal.type];
        if (category) {
            const taxonomy = INCIDENT_TAXONOMY[category];

            // Adjust severity based on confidence
            let severity = taxonomy.defaultSeverity;
            if (signal.confidence < 0.7 && severity === 'CRITICAL') {
                severity = 'HIGH';
            } else if (signal.confidence < 0.7 && severity === 'HIGH') {
                severity = 'MEDIUM';
            }

            return {
                category,
                severity,
                taxonomy
            };
        }
    }
    return null;
}
