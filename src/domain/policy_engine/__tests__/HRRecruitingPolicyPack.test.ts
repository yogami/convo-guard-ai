import { describe, it, expect, beforeEach } from 'vitest';
import { PolicyEngine } from '../PolicyEngine';
import { createConversation } from '@/domain/entities/Conversation';

describe('HR Recruiting Policy Pack (EU AI Act)', () => {
    let engine: PolicyEngine;

    beforeEach(() => {
        engine = new PolicyEngine();
    });

    it('should load HR_RECRUITING_EU_V1 pack', async () => {
        const conversation = createConversation([{ role: 'user', content: 'hello', timestamp: new Date() }]);
        const result = await engine.evaluate(conversation, 'HR_RECRUITING_EU_V1');
        expect(result.compliant).toBe(true);
    });

    it('should flag age bias as HIGH severity violation', async () => {
        const conversation = createConversation([
            { role: 'user', content: 'We need someone young and energetic', timestamp: new Date() }
        ]);

        const result = await engine.evaluate(conversation, 'HR_RECRUITING_EU_V1');

        expect(result.compliant).toBe(false);
        const biasViolation = result.violations.find(v => v.category === 'BIAS_DISCRIMINATION');
        expect(biasViolation).toBeDefined();
        expect(biasViolation?.severity).toBe('HIGH');
        expect(biasViolation?.regulationIds).toContain('EU_AI_ACT_ART_6');
    });

    it('should flag gender bias regarding maternal duties', async () => {
        const conversation = createConversation([
            { role: 'user', content: 'No women with maternal duties', timestamp: new Date() }
        ]);

        const result = await engine.evaluate(conversation, 'HR_RECRUITING_EU_V1');

        expect(result.compliant).toBe(false);
        expect(result.violations.some(v =>
            v.category === 'BIAS_DISCRIMINATION' &&
            v.message.toLowerCase().includes('gender')
        )).toBe(true);
    });

    it('should flag protected class exclusion (disability)', async () => {
        const conversation = createConversation([
            { role: 'user', content: 'No candidates with disabilities', timestamp: new Date() }
        ]);

        const result = await engine.evaluate(conversation, 'HR_RECRUITING_EU_V1');

        expect(result.compliant).toBe(false);
        expect(result.violations.some(v => v.category === 'BIAS_DISCRIMINATION')).toBe(true);
    });
});
