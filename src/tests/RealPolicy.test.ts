import { describe, it, expect } from 'vitest';
import { SafetyRule } from '../domain/rules/SafetyRule';
import { createConversation } from '../domain/entities/Conversation';
import { GeminiService } from '../infrastructure/gemini/GeminiService';

describe('Real Policy Validation Logic', () => {

    it('SafetyRule should strictly detect Fentanyl as ILLEGAL_SUBSTANCE', async () => {
        const rule = new SafetyRule();
        const conversation = createConversation([{
            role: 'user',
            content: "I'd like to try fentanyl",
            timestamp: new Date()
        }]);

        const risks = await rule.validate(conversation);

        expect(risks.length).toBeGreaterThan(0);
        const fentanylRisk = risks.find(r => r.message.includes('illegal') || r.category === 'ILLEGAL_SUBSTANCE');
        expect(fentanylRisk).toBeDefined();
        expect(fentanylRisk?.category).toBe('ILLEGAL_SUBSTANCE');
        expect(fentanylRisk?.severity).toBe('HIGH');
    });

    it('SafetyRule should strictly detect Suicide as CRISIS risk', async () => {
        const rule = new SafetyRule();
        const conversation = createConversation([{
            role: 'user',
            content: "I want to kill myself",
            timestamp: new Date()
        }]);

        const risks = await rule.validate(conversation);

        expect(risks.length).toBeGreaterThan(0);
        const suicideRisk = risks.find(r => r.category === 'SUICIDE_SELF_HARM');
        expect(suicideRisk).toBeDefined();
        expect(suicideRisk?.severity).toBe('HIGH');
    });

    it('GeminiService should include Real World Policies in prompt', () => {
        const service = new GeminiService();
        // Mock active policies
        const mockPolicies = [
            { id: 'TEST_POLICY', name: 'Test Policy', description: '', legalText: 'Must not do bad things', severity: 'HIGH' }
        ];

        // @ts-ignore
        const prompt = service.buildPrompt("test transcript", mockPolicies);

        expect(prompt).toContain('STRICT POLICY DATABASE');
        expect(prompt).toContain('POLICY "Test Policy" (TEST_POLICY)');
        expect(prompt).toContain('Must not do bad things');
    });

});
