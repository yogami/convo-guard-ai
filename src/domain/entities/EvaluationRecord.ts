/**
 * EvaluationRecord Entity
 * AI Act Evidence Engine - Policy evaluation + obligation tracking
 * 
 * Links evaluated conversations to:
 * - Applied policies
 * - Detected signals
 * - AI Act article obligations
 * - Compliance gaps
 */

import { Signal } from '../../lib/compliance-engine/policy_engine/Signal';
import { ValidationResult } from './Conversation';

/**
 * AI Act Obligation compliance status
 */
export type ComplianceStatus = 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';

/**
 * AI Act Obligation mapping
 */
export interface AIActObligation {
    articleId: string;        // e.g., 'ART_12'
    articleName: string;      // e.g., 'Record-keeping'
    requirement: string;      // Specific requirement text
    complianceStatus: ComplianceStatus;
    evidenceRef?: string;     // Reference to evidence (audit log ID, etc.)
}

/**
 * Compliance gap identified
 */
export interface ComplianceGap {
    articleId: string;
    articleName: string;
    requirement: string;
    status: ComplianceStatus;
    recommendation?: string;
}

/**
 * EvaluationRecord - records evaluation details and obligations
 */
export interface EvaluationRecord {
    id: string;
    conversationRecordId: string;

    // What was evaluated
    policiesApplied: string[];
    signalsDetected: Signal[];

    // AI Act obligations triggered
    obligationsTriggered: AIActObligation[];

    // Evaluation result
    result: ValidationResult;

    // Calculated gaps
    gaps: ComplianceGap[];

    // Timestamp
    evaluatedAt: Date;
}

export interface CreateEvaluationRecordInput {
    conversationRecordId: string;
    policiesApplied: string[];
    signalsDetected: Signal[];
    obligationsTriggered: AIActObligation[];
    result: ValidationResult;
}

/**
 * Factory function to create an EvaluationRecord with gap analysis
 */
export function createEvaluationRecord(input: CreateEvaluationRecordInput): EvaluationRecord {
    const id = crypto.randomUUID();
    const evaluatedAt = new Date();

    // Calculate gaps from non-compliant obligations
    const gaps: ComplianceGap[] = input.obligationsTriggered
        .filter(o => o.complianceStatus === 'NON_COMPLIANT' || o.complianceStatus === 'PARTIAL')
        .map(o => ({
            articleId: o.articleId,
            articleName: o.articleName,
            requirement: o.requirement,
            status: o.complianceStatus,
            recommendation: generateRecommendation(o)
        }));

    return {
        id,
        conversationRecordId: input.conversationRecordId,
        policiesApplied: input.policiesApplied,
        signalsDetected: input.signalsDetected,
        obligationsTriggered: input.obligationsTriggered,
        result: input.result,
        gaps,
        evaluatedAt
    };
}

/**
 * Generate recommendation based on obligation gap
 */
function generateRecommendation(obligation: AIActObligation): string {
    const recommendations: Record<string, string> = {
        'ART_9': 'Implement comprehensive risk management system with documentation',
        'ART_10': 'Review data governance practices and ensure training data quality',
        'ART_11': 'Establish technical documentation per Annex IV requirements',
        'ART_12': 'Enable automatic event logging throughout system lifetime',
        'ART_13': 'Ensure transparent information provision to users',
        'ART_14': 'Implement human oversight mechanisms with appropriate competency'
    };

    return recommendations[obligation.articleId] ||
        `Address ${obligation.articleName} requirements to achieve compliance`;
}
