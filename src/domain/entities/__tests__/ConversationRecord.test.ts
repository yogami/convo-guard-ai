/**
 * TDD Tests for ConversationRecord Entity
 * AI Act Evidence Engine - Record-keeping model
 */
import { describe, it, expect } from 'vitest';
import {
    ConversationRecord,
    createConversationRecord,
    RiskClassification,
    Decision
} from '../ConversationRecord';

describe('ConversationRecord', () => {
    const mockDecision: Decision = {
        type: 'ALLOW',
        reason: 'Conversation compliant with policy',
        confidence: 0.95,
        timestamp: new Date()
    };

    it('should create a valid ConversationRecord with required fields', () => {
        const record = createConversationRecord({
            conversationId: 'conv-123',
            systemId: 'bot-mental-health-eu',
            riskClassification: 'HIGH',
            decisions: [mockDecision],
            modelVersion: 'gpt-4-0613',
            promptVersion: 'mh-prompt-v2.1',
            policyPackVersion: 'MENTAL_HEALTH_EU_V1'
        });

        expect(record.id).toBeDefined();
        expect(record.conversationId).toBe('conv-123');
        expect(record.riskClassification).toBe('HIGH');
        expect(record.decisions).toHaveLength(1);
        expect(record.modelVersion).toBe('gpt-4-0613');
        expect(record.timestamp).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for each record', () => {
        const record1 = createConversationRecord({
            conversationId: 'conv-1',
            systemId: 'bot-1',
            riskClassification: 'MINIMAL',
            decisions: [],
            modelVersion: 'v1',
            promptVersion: 'p1',
            policyPackVersion: 'pack-1'
        });

        const record2 = createConversationRecord({
            conversationId: 'conv-2',
            systemId: 'bot-2',
            riskClassification: 'LIMITED',
            decisions: [],
            modelVersion: 'v1',
            promptVersion: 'p1',
            policyPackVersion: 'pack-1'
        });

        expect(record1.id).not.toBe(record2.id);
    });

    it('should support all AI Act risk classifications', () => {
        const classifications: RiskClassification[] = ['MINIMAL', 'LIMITED', 'HIGH', 'UNACCEPTABLE'];

        classifications.forEach(classification => {
            const record = createConversationRecord({
                conversationId: 'conv-test',
                systemId: 'bot-test',
                riskClassification: classification,
                decisions: [],
                modelVersion: 'v1',
                promptVersion: 'p1',
                policyPackVersion: 'pack-1'
            });

            expect(record.riskClassification).toBe(classification);
        });
    });

    it('should store incident pointers when provided', () => {
        const record = createConversationRecord({
            conversationId: 'conv-incident',
            systemId: 'bot-test',
            riskClassification: 'HIGH',
            decisions: [],
            modelVersion: 'v1',
            promptVersion: 'p1',
            policyPackVersion: 'pack-1',
            incidentPointers: ['incident-001', 'incident-002']
        });

        expect(record.incidentPointers).toEqual(['incident-001', 'incident-002']);
    });

    it('should calculate hash for integrity verification', () => {
        const record = createConversationRecord({
            conversationId: 'conv-hash',
            systemId: 'bot-test',
            riskClassification: 'HIGH',
            decisions: [mockDecision],
            modelVersion: 'v1',
            promptVersion: 'p1',
            policyPackVersion: 'pack-1'
        });

        expect(record.integrityHash).toBeDefined();
        expect(record.integrityHash.length).toBe(64); // SHA-256 hex
    });
});
