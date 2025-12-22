/**
 * TDD Tests for IncidentTaxonomy and IncidentDetectionService
 * Feature 2: Serious Incident Radar
 */
import { describe, it, expect } from 'vitest';
import {
    IncidentCategory,
    IncidentSeverity,
    INCIDENT_TAXONOMY,
    classifyIncident
} from '../IncidentTaxonomy';
import {
    IncidentDetectionService,
    detectIncidents
} from '../IncidentDetectionService';
import { Signal } from '../../policy_engine/Signal';

describe('IncidentTaxonomy', () => {

    it('should define SELF_HARM_MISHANDLING category', () => {
        expect(INCIDENT_TAXONOMY['SELF_HARM_MISHANDLING']).toBeDefined();
        expect(INCIDENT_TAXONOMY['SELF_HARM_MISHANDLING'].name).toBe('Self-Harm/Suicidal Ideation Mishandling');
    });

    it('should define DANGEROUS_MEDICAL_ADVICE category', () => {
        expect(INCIDENT_TAXONOMY['DANGEROUS_MEDICAL_ADVICE']).toBeDefined();
        expect(INCIDENT_TAXONOMY['DANGEROUS_MEDICAL_ADVICE'].name).toBe('Dangerous Medical Advice');
    });

    it('should define DISCRIMINATORY_DECISION category', () => {
        expect(INCIDENT_TAXONOMY['DISCRIMINATORY_DECISION']).toBeDefined();
    });

    it('should have severity levels defined for each category', () => {
        Object.values(INCIDENT_TAXONOMY).forEach(category => {
            expect(category.defaultSeverity).toBeDefined();
            expect(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).toContain(category.defaultSeverity);
        });
    });
});

describe('classifyIncident', () => {

    it('should classify suicide risk signals as SELF_HARM_MISHANDLING', () => {
        const signals: Signal[] = [{
            type: 'SIGNAL_SUICIDE_RISK',
            source: 'REGEX',
            confidence: 0.95,
            metadata: {}
        }];

        const result = classifyIncident(signals);

        expect(result.category).toBe('SELF_HARM_MISHANDLING');
        expect(result.severity).toBe('CRITICAL');
    });

    it('should classify dosage recommendation as DANGEROUS_MEDICAL_ADVICE', () => {
        const signals: Signal[] = [{
            type: 'SIGNAL_DOSAGE_RECOMMENDATION',
            source: 'REGEX',
            confidence: 0.9,
            metadata: {}
        }];

        const result = classifyIncident(signals);

        expect(result.category).toBe('DANGEROUS_MEDICAL_ADVICE');
    });

    it('should classify bias signals as DISCRIMINATORY_DECISION', () => {
        const signals: Signal[] = [{
            type: 'SIGNAL_BIAS_DETECTED',
            source: 'DETECTOR',
            confidence: 0.85,
            metadata: { biasType: 'age' }
        }];

        const result = classifyIncident(signals);

        expect(result.category).toBe('DISCRIMINATORY_DECISION');
    });

    it('should return null for non-incident signals', () => {
        const signals: Signal[] = [{
            type: 'SIGNAL_TRANSPARENCY_REQUIRED',
            source: 'RULE',
            confidence: 1.0,
            metadata: {}
        }];

        const result = classifyIncident(signals);

        expect(result).toBeNull();
    });
});

describe('IncidentDetectionService', () => {

    it('should detect and flag incidents from signals', () => {
        const signals: Signal[] = [
            { type: 'SIGNAL_SUICIDE_RISK', source: 'REGEX', confidence: 0.95, metadata: {} }
        ];

        const incidents = detectIncidents(signals, 'conv-123', 'bot-mh');

        expect(incidents.length).toBe(1);
        expect(incidents[0].category).toBe('SELF_HARM_MISHANDLING');
        expect(incidents[0].conversationId).toBe('conv-123');
    });

    it('should assign severity based on confidence', () => {
        const highConfidence: Signal[] = [
            { type: 'SIGNAL_SUICIDE_RISK', source: 'REGEX', confidence: 0.98, metadata: {} }
        ];

        const lowConfidence: Signal[] = [
            { type: 'SIGNAL_SUICIDE_RISK', source: 'REGEX', confidence: 0.6, metadata: {} }
        ];

        const highResult = detectIncidents(highConfidence, 'conv-1', 'bot-1');
        const lowResult = detectIncidents(lowConfidence, 'conv-2', 'bot-2');

        expect(highResult[0].severity).toBe('CRITICAL');
        expect(lowResult[0].severity).toBe('HIGH'); // Downgraded due to lower confidence
    });

    it('should detect multiple incident types from multiple signals', () => {
        const signals: Signal[] = [
            { type: 'SIGNAL_SUICIDE_RISK', source: 'REGEX', confidence: 0.9, metadata: {} },
            { type: 'SIGNAL_DOSAGE_RECOMMENDATION', source: 'REGEX', confidence: 0.85, metadata: {} }
        ];

        const incidents = detectIncidents(signals, 'conv-multi', 'bot-test');

        expect(incidents.length).toBe(2);
        const categories = incidents.map(i => i.category);
        expect(categories).toContain('SELF_HARM_MISHANDLING');
        expect(categories).toContain('DANGEROUS_MEDICAL_ADVICE');
    });
});
