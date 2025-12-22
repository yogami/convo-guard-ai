/**
 * TDD Tests for DocFragmentBuilder Service
 * Generates technical documentation evidence fragments for AI Act compliance
 */
import { describe, it, expect } from 'vitest';
import {
    DocFragmentBuilder,
    buildLoggingEvidence,
    buildRiskManagementEvidence,
    buildPostMarketEvidence,
    DocFragment
} from '../DocFragmentBuilder';
import { EvaluationRecord, createEvaluationRecord } from '../../entities/EvaluationRecord';
import { ConversationRecord, createConversationRecord } from '../../entities/ConversationRecord';

describe('DocFragmentBuilder', () => {
    const mockConversationRecord = createConversationRecord({
        conversationId: 'conv-123',
        systemId: 'bot-mh-eu',
        riskClassification: 'HIGH',
        decisions: [{ type: 'ALLOW', reason: 'Compliant', confidence: 0.95, timestamp: new Date() }],
        modelVersion: 'gpt-4-0613',
        promptVersion: 'mh-v2.1',
        policyPackVersion: 'MENTAL_HEALTH_EU_V1'
    });

    const mockEvaluationRecord = createEvaluationRecord({
        conversationRecordId: mockConversationRecord.id,
        policiesApplied: ['MENTAL_HEALTH_EU_V1'],
        signalsDetected: [{ type: 'SIGNAL_SUICIDE_RISK', source: 'REGEX', confidence: 0.9, metadata: {} }],
        obligationsTriggered: [
            { articleId: 'ART_9', articleName: 'Risk Management', requirement: 'Risk mgmt', complianceStatus: 'COMPLIANT' },
            { articleId: 'ART_12', articleName: 'Record-keeping', requirement: 'Logging', complianceStatus: 'COMPLIANT' }
        ],
        result: { compliant: true, score: 85, risks: [] }
    });

    it('should generate Art. 12 logging evidence fragment', () => {
        const fragment = buildLoggingEvidence([mockEvaluationRecord]);

        expect(fragment.articleId).toBe('ART_12');
        expect(fragment.title).toContain('Record-keeping');
        expect(fragment.content).toContain('logging');
        expect(fragment.evidenceType).toBe('LOGGING');
    });

    it('should include record count in logging evidence', () => {
        const records = [mockEvaluationRecord, mockEvaluationRecord];
        const fragment = buildLoggingEvidence(records);

        expect(fragment.metadata?.recordCount).toBe(2);
    });

    it('should generate risk management evidence', () => {
        const fragment = buildRiskManagementEvidence([mockConversationRecord], [mockEvaluationRecord]);

        expect(fragment.articleId).toBe('ART_9');
        expect(fragment.evidenceType).toBe('RISK_MANAGEMENT');
        expect(fragment.content).toBeDefined();
    });

    it('should include risk classification distribution', () => {
        const records = [
            mockConversationRecord,
            createConversationRecord({ ...mockConversationRecord, riskClassification: 'LIMITED', conversationId: 'conv-2', systemId: 'bot-2', modelVersion: 'v1', promptVersion: 'p1', policyPackVersion: 'pack-1', decisions: [] })
        ];

        const fragment = buildRiskManagementEvidence(records, [mockEvaluationRecord]);

        expect(fragment.metadata?.riskDistribution).toBeDefined();
    });

    it('should generate post-market monitoring evidence', () => {
        const fragment = buildPostMarketEvidence([mockEvaluationRecord], { startDate: new Date(), endDate: new Date() });

        expect(fragment.articleId).toBe('ART_72');
        expect(fragment.evidenceType).toBe('POST_MARKET');
        expect(fragment.metadata?.period).toBeDefined();
    });

    it('should export fragments as JSON', () => {
        const builder = new DocFragmentBuilder()
            .withConversationRecords([mockConversationRecord])
            .withEvaluationRecords([mockEvaluationRecord]);

        const json = builder.exportAsJSON();
        const parsed = JSON.parse(json);

        expect(parsed.fragments).toBeDefined();
        expect(Array.isArray(parsed.fragments)).toBe(true);
    });

    it('should export fragments as Markdown', () => {
        const builder = new DocFragmentBuilder()
            .withConversationRecords([mockConversationRecord])
            .withEvaluationRecords([mockEvaluationRecord]);

        const markdown = builder.exportAsMarkdown();

        expect(markdown).toContain('# Technical Documentation Evidence');
        expect(markdown).toContain('##');
    });
});
