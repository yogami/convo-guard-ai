/**
 * TDD Tests for AIActObligationMapper Service
 * Maps signals and evaluation results to AI Act article obligations
 */
import { describe, it, expect } from 'vitest';
import {
    AIActObligationMapper,
    mapSignalsToObligations,
    getObligationsForRiskClass
} from '../AIActObligationMapper';
import { Signal } from '../../policy_engine/Signal';

describe('AIActObligationMapper', () => {

    it('should map suicide risk signal to Art. 9 risk management obligation', () => {
        const signals: Signal[] = [{
            type: 'SIGNAL_SUICIDE_RISK',
            source: 'REGEX',
            confidence: 0.9,
            metadata: {}
        }];

        const obligations = mapSignalsToObligations(signals, 'HIGH');

        expect(obligations.some(o => o.articleId === 'ART_9')).toBe(true);
        expect(obligations.find(o => o.articleId === 'ART_9')?.articleName).toBe('Risk Management');
    });

    it('should include Art. 12 logging for all HIGH risk evaluations', () => {
        const obligations = getObligationsForRiskClass('HIGH');

        expect(obligations.some(o => o.articleId === 'ART_12')).toBe(true);
        expect(obligations.find(o => o.articleId === 'ART_12')?.articleName).toBe('Record-keeping');
    });

    it('should include Art. 13 transparency for systems requiring user notification', () => {
        const signals: Signal[] = [{
            type: 'SIGNAL_AI_GENERATED',
            source: 'RULE',
            confidence: 1.0,
            metadata: {}
        }];

        const obligations = mapSignalsToObligations(signals, 'LIMITED');

        expect(obligations.some(o => o.articleId === 'ART_13')).toBe(true);
    });

    it('should include Art. 14 human oversight for crisis escalation', () => {
        const signals: Signal[] = [{
            type: 'SIGNAL_CRISIS_ESCALATION',
            source: 'DETECTOR',
            confidence: 0.95,
            metadata: {}
        }];

        const obligations = mapSignalsToObligations(signals, 'HIGH');

        expect(obligations.some(o => o.articleId === 'ART_14')).toBe(true);
        expect(obligations.find(o => o.articleId === 'ART_14')?.articleName).toBe('Human Oversight');
    });

    it('should return minimal obligations for MINIMAL risk class', () => {
        const obligations = getObligationsForRiskClass('MINIMAL');

        expect(obligations.length).toBeLessThan(getObligationsForRiskClass('HIGH').length);
    });

    it('should mark UNACCEPTABLE risk as prohibited', () => {
        const obligations = getObligationsForRiskClass('UNACCEPTABLE');

        expect(obligations.some(o => o.articleId === 'ART_5')).toBe(true);
        expect(obligations.find(o => o.articleId === 'ART_5')?.articleName).toBe('Prohibited Practices');
    });

    it('should map bias signals to Art. 10 data governance', () => {
        const signals: Signal[] = [{
            type: 'SIGNAL_BIAS_DETECTED',
            source: 'DETECTOR',
            confidence: 0.85,
            metadata: { biasType: 'age' }
        }];

        const obligations = mapSignalsToObligations(signals, 'HIGH');

        expect(obligations.some(o => o.articleId === 'ART_10')).toBe(true);
        expect(obligations.find(o => o.articleId === 'ART_10')?.articleName).toBe('Data Governance');
    });
});
