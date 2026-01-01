import { describe, it, expect } from 'vitest';
import {
    IncidentReportBuilder,
    buildIncidentReport,
    IncidentReport
} from '../IncidentReportBuilder';
import { DetectedIncident } from '../IncidentDetectionService';

describe('IncidentReportBuilder', () => {
    const createMockIncident = (overrides?: Partial<DetectedIncident>): DetectedIncident => ({
        id: 'incident-123',
        conversationId: 'conv-456',
        systemId: 'system-789',
        category: 'SELF_HARM_MISHANDLING',
        severity: 'CRITICAL',
        description: 'Crisis situation was not properly handled',
        detectedAt: new Date('2024-01-15T10:30:00Z'),
        triggerSignals: [
            { type: 'SUICIDE_RISK', source: 'REGEX', confidence: 0.95 }
        ],
        regulationRefs: ['AI Act Art. 5', 'MDR 2017/745'],
        reportingRequired: true,
        ...overrides
    });

    describe('buildIncidentReport', () => {
        it('should build a complete incident report', () => {
            const incident = createMockIncident();
            const report = buildIncidentReport(incident);

            expect(report.incidentId).toBe('incident-123');
            expect(report.category).toBe('SELF_HARM_MISHANDLING');
            expect(report.severity).toBe('CRITICAL');
            expect(report.description).toBe('Crisis situation was not properly handled');
            expect(report.impactAssessment).toContain('Immediate risk');
            expect(report.mitigations.length).toBeGreaterThan(0);
            expect(report.regulationRefs).toContain('AI Act Art. 5');
            expect(report.generatedAt).toBeDefined();
        });

        it('should generate correct impact assessment for CRITICAL severity', () => {
            const incident = createMockIncident({ severity: 'CRITICAL' });
            const report = buildIncidentReport(incident);

            expect(report.impactAssessment).toContain('Immediate risk');
        });

        it('should generate correct impact assessment for HIGH severity', () => {
            const incident = createMockIncident({ severity: 'HIGH' });
            const report = buildIncidentReport(incident);

            expect(report.impactAssessment).toContain('Significant risk');
        });

        it('should generate correct impact assessment for MEDIUM severity', () => {
            const incident = createMockIncident({ severity: 'MEDIUM' });
            const report = buildIncidentReport(incident);

            expect(report.impactAssessment).toContain('Moderate impact');
        });

        it('should generate correct impact assessment for LOW severity', () => {
            const incident = createMockIncident({ severity: 'LOW' });
            const report = buildIncidentReport(incident);

            expect(report.impactAssessment).toContain('Minor issue');
        });

        it('should assess HIGH recurrence risk for high confidence signals', () => {
            const incident = createMockIncident({
                triggerSignals: [{ type: 'SUICIDE_RISK', source: 'REGEX', confidence: 0.95 }]
            });
            const report = buildIncidentReport(incident);

            expect(report.recurrenceRisk).toBe('HIGH');
        });

        it('should assess MEDIUM recurrence risk for medium confidence signals', () => {
            const incident = createMockIncident({
                triggerSignals: [{ type: 'SUICIDE_RISK', source: 'REGEX', confidence: 0.75 }]
            });
            const report = buildIncidentReport(incident);

            expect(report.recurrenceRisk).toBe('MEDIUM');
        });

        it('should assess LOW recurrence risk for low confidence signals', () => {
            const incident = createMockIncident({
                triggerSignals: [{ type: 'SUICIDE_RISK', source: 'REGEX', confidence: 0.5 }]
            });
            const report = buildIncidentReport(incident);

            expect(report.recurrenceRisk).toBe('LOW');
        });

        it('should include mitigations for DANGEROUS_MEDICAL_ADVICE', () => {
            const incident = createMockIncident({ category: 'DANGEROUS_MEDICAL_ADVICE' });
            const report = buildIncidentReport(incident);

            expect(report.mitigations).toContain('Block all dosage and prescription recommendations');
        });

        it('should include mitigations for DISCRIMINATORY_DECISION', () => {
            const incident = createMockIncident({ category: 'DISCRIMINATORY_DECISION' });
            const report = buildIncidentReport(incident);

            expect(report.mitigations).toContain('Audit training data for bias');
        });

        it('should include mitigations for SAFETY_PROTOCOL_VIOLATION', () => {
            const incident = createMockIncident({ category: 'SAFETY_PROTOCOL_VIOLATION' });
            const report = buildIncidentReport(incident);

            expect(report.mitigations).toContain('Review and strengthen safety guardrails');
        });
    });

    describe('IncidentReportBuilder class', () => {
        it('should build report using fluent API', () => {
            const incident = createMockIncident();
            const builder = new IncidentReportBuilder();

            const report = builder.forIncident(incident).build();

            expect(report.incidentId).toBe('incident-123');
            expect(report.category).toBe('SELF_HARM_MISHANDLING');
        });

        it('should throw error if no incident provided', () => {
            const builder = new IncidentReportBuilder();

            expect(() => builder.build()).toThrow('No incident provided');
        });

        it('should add custom mitigations', () => {
            const incident = createMockIncident();
            const builder = new IncidentReportBuilder();

            const report = builder
                .forIncident(incident)
                .addMitigation('Custom mitigation 1')
                .addMitigation('Custom mitigation 2')
                .build();

            expect(report.mitigations).toContain('Custom mitigation 1');
            expect(report.mitigations).toContain('Custom mitigation 2');
        });

        it('should export as JSON', () => {
            const incident = createMockIncident();
            const builder = new IncidentReportBuilder();

            const json = builder.forIncident(incident).exportAsJSON();
            const parsed = JSON.parse(json);

            expect(parsed.incidentId).toBe('incident-123');
            expect(parsed.category).toBe('SELF_HARM_MISHANDLING');
        });

        it('should export as Markdown', () => {
            const incident = createMockIncident();
            const builder = new IncidentReportBuilder();

            const markdown = builder.forIncident(incident).exportAsMarkdown();

            expect(markdown).toContain('# Serious Incident Report');
            expect(markdown).toContain('**Incident ID:** incident-123');
            expect(markdown).toContain('**Category:** SELF_HARM_MISHANDLING');
            expect(markdown).toContain('**Severity:** CRITICAL');
            expect(markdown).toContain('## Description');
            expect(markdown).toContain('## Impact Assessment');
            expect(markdown).toContain('## Mitigation Recommendations');
            expect(markdown).toContain('## Regulatory References');
        });
    });
});
