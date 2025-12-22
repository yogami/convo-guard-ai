/**
 * ConversationRecord Entity
 * AI Act Evidence Engine - Conversation-level record-keeping
 * 
 * Supports Art. 12 record-keeping requirements by capturing:
 * - Risk classification decisions
 * - Model/prompt/policy versions
 * - Incident linkages
 */

import { createHash } from 'crypto';

/**
 * AI Act Risk Classifications (Art. 6)
 */
export type RiskClassification = 'MINIMAL' | 'LIMITED' | 'HIGH' | 'UNACCEPTABLE';

/**
 * Decision made during evaluation
 */
export interface Decision {
    type: 'ALLOW' | 'BLOCK' | 'FLAG' | 'ESCALATE';
    reason: string;
    confidence: number;
    timestamp: Date;
}

/**
 * ConversationRecord - records metadata for each evaluated conversation
 */
export interface ConversationRecord {
    id: string;
    conversationId: string;
    systemId: string;
    riskClassification: RiskClassification;
    decisions: Decision[];

    // Version tracking for "what was live when this happened?"
    modelVersion: string;
    promptVersion: string;
    policyPackVersion: string;

    // Incident linkage (Feature 2)
    incidentPointers?: string[];

    // Integrity and audit
    timestamp: Date;
    integrityHash: string;
}

export interface CreateConversationRecordInput {
    conversationId: string;
    systemId: string;
    riskClassification: RiskClassification;
    decisions: Decision[];
    modelVersion: string;
    promptVersion: string;
    policyPackVersion: string;
    incidentPointers?: string[];
}

/**
 * Factory function to create a ConversationRecord with auto-generated ID and hash
 */
export function createConversationRecord(input: CreateConversationRecordInput): ConversationRecord {
    const id = crypto.randomUUID();
    const timestamp = new Date();

    // Compute integrity hash
    const hashContent = JSON.stringify({
        id,
        conversationId: input.conversationId,
        systemId: input.systemId,
        riskClassification: input.riskClassification,
        decisions: input.decisions,
        modelVersion: input.modelVersion,
        promptVersion: input.promptVersion,
        policyPackVersion: input.policyPackVersion,
        timestamp: timestamp.toISOString()
    });
    const integrityHash = createHash('sha256').update(hashContent).digest('hex');

    return {
        id,
        conversationId: input.conversationId,
        systemId: input.systemId,
        riskClassification: input.riskClassification,
        decisions: input.decisions,
        modelVersion: input.modelVersion,
        promptVersion: input.promptVersion,
        policyPackVersion: input.policyPackVersion,
        incidentPointers: input.incidentPointers,
        timestamp,
        integrityHash
    };
}
