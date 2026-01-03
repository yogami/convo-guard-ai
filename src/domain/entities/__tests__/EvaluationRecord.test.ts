/**
 * TDD Tests for EvaluationRecord Entity
 * AI Act Evidence Engine - Evaluation + obligation tracking
 */
import { describe, it, expect } from 'vitest';
import {
    EvaluationRecord,
    createEvaluationRecord,
    AIActObligation
} from '../EvaluationRecord';
import { Signal } from '../../../lib/compliance-engine/policy_engine/Signal';

describe('EvaluationRecord', () => {
    const mockSignal: Signal = {
        type: 'SIGNAL_SUICIDE_RISK',
        source: 'REGEX',
        confidence: 0.92,
        metadata: { triggerText: 'I want to end it all' }
    };

    const mockObligation: AIActObligation = {
        articleId: 'ART_12',
        articleName: 'Record-keeping',
        requirement: 'Automatic logging of events throughout system lifetime',
        complianceStatus: 'COMPLIANT',
        evidenceRef: 'audit-log-123'
    };

    it('should create a valid EvaluationRecord', () => {
        const record = createEvaluationRecord({
            conversationRecordId: 'conv-rec-123',
            policiesApplied: ['MENTAL_HEALTH_EU_V1'],
            signalsDetected: [mockSignal],
            obligationsTriggered: [mockObligation],
            result: {
                compliant: true,
                score: 85,
                risks: []
            }
        });

        expect(record.id).toBeDefined();
        expect(record.conversationRecordId).toBe('conv-rec-123');
        expect(record.policiesApplied).toContain('MENTAL_HEALTH_EU_V1');
        expect(record.signalsDetected).toHaveLength(1);
        expect(record.obligationsTriggered).toHaveLength(1);
    });

    it('should link multiple policies to a single evaluation', () => {
        const record = createEvaluationRecord({
            conversationRecordId: 'conv-rec-multi',
            policiesApplied: ['MENTAL_HEALTH_EU_V1', 'HR_RECRUITING_EU_V1', 'DIGA_MDR_DE_V1'],
            signalsDetected: [],
            obligationsTriggered: [],
            result: { compliant: true, score: 100, risks: [] }
        });

        expect(record.policiesApplied).toHaveLength(3);
    });

    it('should track multiple AI Act obligations', () => {
        const obligations: AIActObligation[] = [
            { articleId: 'ART_9', articleName: 'Risk Management', requirement: 'Risk assessment', complianceStatus: 'COMPLIANT' },
            { articleId: 'ART_12', articleName: 'Record-keeping', requirement: 'Logging', complianceStatus: 'COMPLIANT' },
            { articleId: 'ART_13', articleName: 'Transparency', requirement: 'User notification', complianceStatus: 'PARTIAL' }
        ];

        const record = createEvaluationRecord({
            conversationRecordId: 'conv-rec-obligations',
            policiesApplied: ['MENTAL_HEALTH_EU_V1'],
            signalsDetected: [],
            obligationsTriggered: obligations,
            result: { compliant: true, score: 90, risks: [] }
        });

        expect(record.obligationsTriggered).toHaveLength(3);
        expect(record.obligationsTriggered.find(o => o.articleId === 'ART_13')?.complianceStatus).toBe('PARTIAL');
    });

    it('should store evaluation timestamp', () => {
        const beforeCreate = new Date();

        const record = createEvaluationRecord({
            conversationRecordId: 'conv-rec-time',
            policiesApplied: [],
            signalsDetected: [],
            obligationsTriggered: [],
            result: { compliant: true, score: 100, risks: [] }
        });

        const afterCreate = new Date();

        expect(record.evaluatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
        expect(record.evaluatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should calculate gap summary for non-compliant obligations', () => {
        const obligations: AIActObligation[] = [
            { articleId: 'ART_9', articleName: 'Risk Management', requirement: 'Risk assessment', complianceStatus: 'COMPLIANT' },
            { articleId: 'ART_10', articleName: 'Data Governance', requirement: 'Data quality', complianceStatus: 'NON_COMPLIANT' },
            { articleId: 'ART_14', articleName: 'Human Oversight', requirement: 'Human-in-the-loop', complianceStatus: 'PARTIAL' }
        ];

        const record = createEvaluationRecord({
            conversationRecordId: 'conv-rec-gaps',
            policiesApplied: ['MENTAL_HEALTH_EU_V1'],
            signalsDetected: [],
            obligationsTriggered: obligations,
            result: { compliant: false, score: 60, risks: [] }
        });

        expect(record.gaps).toBeDefined();
        expect(record.gaps).toHaveLength(2); // NON_COMPLIANT and PARTIAL
        expect(record.gaps.map(g => g.articleId)).toContain('ART_10');
        expect(record.gaps.map(g => g.articleId)).toContain('ART_14');
    });
});
