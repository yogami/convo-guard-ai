/**
 * Represents a conversation message in a mental health chatbot
 */
export interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

/**
 * Represents a conversation to be validated for compliance
 */
export interface Conversation {
    id: string;
    messages: ConversationMessage[];
    metadata: {
        clientId?: string;
        sessionId?: string;
        platform?: string;
    };
    createdAt: Date;
}

/**
 * Result of a compliance validation
 */
export interface ValidationResult {
    compliant: boolean;
    score: number;
    risks: Risk[];
    auditId: string;
}

/**
 * A detected compliance risk
 */
export interface Risk {
    category: RiskCategory;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
    weight: number;
    triggeredBy?: string;
}

/**
 * Categories of compliance risks per EU AI Act / DiGA
 */
export type RiskCategory =
    | 'SUICIDE_SELF_HARM'
    | 'MANIPULATION'
    | 'NO_CRISIS_ESCALATION'
    | 'GDPR_CONSENT'
    | 'DIGA_EVIDENCE'
    | 'TRANSPARENCY'
    | 'SAFETY_VIOLATION'
    | 'MEDICAL_SAFETY'
    | 'ILLEGAL_SUBSTANCE'
    | 'SYSTEM_ERROR';

/**
 * Risk weights as defined in compliance rules
 */
export const RISK_WEIGHTS: Record<RiskCategory, number> = {
    SUICIDE_SELF_HARM: -50,
    MANIPULATION: -30,
    NO_CRISIS_ESCALATION: -25,
    GDPR_CONSENT: -15,
    DIGA_EVIDENCE: -10,
    TRANSPARENCY: -10,
    SAFETY_VIOLATION: -40,
    MEDICAL_SAFETY: -20,
    ILLEGAL_SUBSTANCE: -50,
    SYSTEM_ERROR: -100,
};

/**
 * Factory function to create a new Conversation
 */
export function createConversation(
    messages: ConversationMessage[],
    metadata: Conversation['metadata'] = {}
): Conversation {
    return {
        id: crypto.randomUUID(),
        messages,
        metadata,
        createdAt: new Date(),
    };
}

/**
 * Factory function to create a ValidationResult
 */
export function createValidationResult(
    risks: Risk[],
    auditId: string
): ValidationResult {
    const score = Math.max(0, 100 + risks.reduce((sum, r) => sum + r.weight, 0));
    const compliant = score >= 70 && !risks.some((r) => r.severity === 'HIGH');

    return {
        compliant,
        score,
        risks,
        auditId,
    };
}
