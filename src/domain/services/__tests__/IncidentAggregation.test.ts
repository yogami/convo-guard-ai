/**
 * TDD Tests for IncidentAggregationService and IncidentReportBuilder
 * Feature 2: Serious Incident Radar
 */
import { describe, it, expect } from 'vitest';
import {
    IncidentAggregationService,
    aggregateIncidents,
    IncidentTrend
} from '../IncidentAggregationService';
import {
    IncidentReportBuilder,
    buildIncidentReport
} from '../IncidentReportBuilder';
import { DetectedIncident } from '../IncidentDetectionService';

describe('IncidentAggregationService', () => {

    const createMockIncident = (
        category: string,
        severity: string,
        systemId: string,
        daysAgo: number = 0
    ): DetectedIncident => ({
        id: crypto.randomUUID(),
        conversationId: `conv-${Math.random()}`,
        systemId,
        category: category as any,
        severity: severity as any,
        triggerSignals: [],
        description: 'Test incident',
        regulationRefs: [],
        detectedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        reportingRequired: true
    });

    it('should aggregate incidents by category', () => {
        const incidents = [
            createMockIncident('SELF_HARM_MISHANDLING', 'CRITICAL', 'bot-1'),
            createMockIncident('SELF_HARM_MISHANDLING', 'HIGH', 'bot-1'),
            createMockIncident('DANGEROUS_MEDICAL_ADVICE', 'CRITICAL', 'bot-1')
        ];

        const result = aggregateIncidents(incidents);

        expect(result.byCategory['SELF_HARM_MISHANDLING']).toBe(2);
        expect(result.byCategory['DANGEROUS_MEDICAL_ADVICE']).toBe(1);
    });

    it('should aggregate incidents by severity', () => {
        const incidents = [
            createMockIncident('SELF_HARM_MISHANDLING', 'CRITICAL', 'bot-1'),
            createMockIncident('DANGEROUS_MEDICAL_ADVICE', 'CRITICAL', 'bot-1'),
            createMockIncident('DISCRIMINATORY_DECISION', 'HIGH', 'bot-1')
        ];

        const result = aggregateIncidents(incidents);

        expect(result.bySeverity['CRITICAL']).toBe(2);
        expect(result.bySeverity['HIGH']).toBe(1);
    });

    it('should aggregate incidents by system', () => {
        const incidents = [
            createMockIncident('SELF_HARM_MISHANDLING', 'CRITICAL', 'bot-mh-eu'),
            createMockIncident('SELF_HARM_MISHANDLING', 'CRITICAL', 'bot-mh-eu'),
            createMockIncident('DANGEROUS_MEDICAL_ADVICE', 'HIGH', 'bot-hr-global')
        ];

        const result = aggregateIncidents(incidents);

        expect(result.bySystem['bot-mh-eu']).toBe(2);
        expect(result.bySystem['bot-hr-global']).toBe(1);
    });

    it('should calculate trend over time period', () => {
        const incidents = [
            createMockIncident('SELF_HARM_MISHANDLING', 'CRITICAL', 'bot-1', 1),
            createMockIncident('SELF_HARM_MISHANDLING', 'CRITICAL', 'bot-1', 5),
            createMockIncident('SELF_HARM_MISHANDLING', 'HIGH', 'bot-1', 10),
            createMockIncident('DANGEROUS_MEDICAL_ADVICE', 'CRITICAL', 'bot-1', 20)
        ];

        const result = aggregateIncidents(incidents, { periodDays: 30, groupByWeek: true });

        expect(result.total).toBe(4);
        expect(result.trend).toBeDefined();
    });
});

describe('IncidentReportBuilder', () => {

    const mockIncident: DetectedIncident = {
        id: 'incident-001',
        conversationId: 'conv-123',
        systemId: 'bot-mh-eu',
        category: 'SELF_HARM_MISHANDLING',
        severity: 'CRITICAL',
        triggerSignals: [{ type: 'SIGNAL_SUICIDE_RISK', source: 'REGEX', confidence: 0.95, metadata: {} }],
        description: 'Bot failed to escalate suicide risk',
        regulationRefs: ['AI_ACT_ART_73'],
        detectedAt: new Date(),
        reportingRequired: true
    };

    it('should build a complete incident report', () => {
        const report = buildIncidentReport(mockIncident);

        expect(report.incidentId).toBe('incident-001');
        expect(report.category).toBe('SELF_HARM_MISHANDLING');
        expect(report.severity).toBe('CRITICAL');
    });

    it('should include description and impact', () => {
        const report = buildIncidentReport(mockIncident);

        expect(report.description).toBeDefined();
        expect(report.impactAssessment).toBeDefined();
    });

    it('should include mitigation recommendations', () => {
        const report = buildIncidentReport(mockIncident);

        expect(report.mitigations).toBeDefined();
        expect(Array.isArray(report.mitigations)).toBe(true);
    });

    it('should include timeline', () => {
        const report = buildIncidentReport(mockIncident);

        expect(report.timeline).toBeDefined();
        expect(report.timeline.detected).toBeDefined();
    });

    it('should export as JSON', () => {
        const builder = new IncidentReportBuilder().forIncident(mockIncident);
        const json = builder.exportAsJSON();

        const parsed = JSON.parse(json);
        expect(parsed.incidentId).toBe('incident-001');
    });

    it('should export as Markdown', () => {
        const builder = new IncidentReportBuilder().forIncident(mockIncident);
        const markdown = builder.exportAsMarkdown();

        expect(markdown).toContain('# Serious Incident Report');
        expect(markdown).toContain('SELF_HARM_MISHANDLING');
    });
});
