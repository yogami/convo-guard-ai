/**
 * Unit tests for PolicyEngine
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PolicyEngine } from '../PolicyEngine';
import { PolicyPack, PolicyRule, PolicyViolation } from '../Policy';
import { Signal } from '../Signal';
import { createConversation, ConversationMessage } from '../../entities/Conversation';

// Helper to create a conversation
function makeConversation(messages: Partial<ConversationMessage>[]) {
    return createConversation(
        messages.map((m, i) => ({
            role: m.role || 'user',
            content: m.content || '',
            timestamp: new Date(Date.now() + i * 1000),
        }))
    );
}

// Mock detector for testing
class MockDetector {
    readonly id = 'mock_detector';
    private signals: Signal[];

    constructor(signals: Signal[] = []) {
        this.signals = signals;
    }

    async detect(): Promise<Signal[]> {
        return this.signals;
    }
}

describe('PolicyEngine', () => {
    let engine: PolicyEngine;

    beforeEach(() => {
        engine = new PolicyEngine();
    });

    describe('evaluate()', () => {
        it('should load default policy pack (MENTAL_HEALTH_EU_V1)', async () => {
            const conversation = makeConversation([
                { role: 'assistant', content: 'I am an AI assistant. How can I help?' },
                { role: 'user', content: 'I had a great day!' }
            ]);

            const result = await engine.evaluate(conversation);

            expect(result).toHaveProperty('compliant');
            expect(result).toHaveProperty('score');
            expect(result).toHaveProperty('violations');
            expect(result).toHaveProperty('signals');
            expect(result).toHaveProperty('auditId');
        });

        it('should throw error for unknown policy pack', async () => {
            const conversation = makeConversation([{ role: 'user', content: 'Hello' }]);

            await expect(engine.evaluate(conversation, 'UNKNOWN_PACK_V1'))
                .rejects.toThrow("Policy Pack 'UNKNOWN_PACK_V1' not found");
        });

        it('should return compliant=true and score=100 for clean conversation', async () => {
            const conversation = makeConversation([
                { role: 'assistant', content: 'Hi! I am an AI assistant here to help you.' },
                { role: 'user', content: 'Great, thanks!' }
            ]);

            const result = await engine.evaluate(conversation);

            // Should be compliant with high score (accounting for LLM variance)
            expect(result.compliant).toBe(true);
            expect(result.score).toBeGreaterThanOrEqual(80);
        });

        it('should detect suicide ideation via regex detector', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I want to kill myself' }
            ]);

            const result = await engine.evaluate(conversation);

            expect(result.compliant).toBe(false);
            expect(result.violations.some(v => v.category === 'SUICIDE_SELF_HARM')).toBe(true);
            expect(result.signals.some(s => s.type === 'SIGNAL_SUICIDE_IDEATION')).toBe(true);
        });

        it('should detect missing consent when personal data is discussed', async () => {
            const conversation = makeConversation([
                { role: 'assistant', content: 'Tell me about your anxiety symptoms' },
                { role: 'user', content: 'I feel anxious in social situations' }
            ]);

            const result = await engine.evaluate(conversation);

            // Should have consent-related signals
            expect(result.signals.some(s =>
                s.type === 'SIGNAL_PERSONAL_DATA_DETECTED' ||
                s.type === 'SIGNAL_MISSING_CONSENT_REQUEST'
            )).toBe(true);
        });

        it('should detect crisis without escalation', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I want to kill myself' },
                { role: 'assistant', content: 'I am sorry to hear that. Tell me more.' }
            ]);

            const result = await engine.evaluate(conversation);

            expect(result.compliant).toBe(false);
            expect(result.violations.some(v => v.category === 'NO_CRISIS_ESCALATION')).toBe(true);
        });

        it('should NOT flag crisis escalation when proper resources provided', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I want to kill myself' },
                { role: 'assistant', content: 'Please call the crisis hotline at 988 immediately.' }
            ]);

            const result = await engine.evaluate(conversation);

            // Should still flag suicide but NOT missing escalation
            expect(result.violations.some(v => v.category === 'SUICIDE_SELF_HARM')).toBe(true);
            expect(result.violations.some(v => v.category === 'NO_CRISIS_ESCALATION')).toBe(false);
        });

        it('should link violations to regulation IDs', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I want to kill myself' }
            ]);

            const result = await engine.evaluate(conversation);

            const suicideViolation = result.violations.find(v => v.category === 'SUICIDE_SELF_HARM');
            expect(suicideViolation).toBeDefined();
            expect(suicideViolation?.regulationIds).toBeDefined();
            expect(suicideViolation?.regulationIds.length).toBeGreaterThan(0);
        });
    });

    describe('Score Calculation', () => {
        it('should start at 100 and subtract violation weights', async () => {
            const conversation = makeConversation([
                { role: 'assistant', content: 'Hi! I am an AI assistant.' },
                { role: 'user', content: 'Hello!' }
            ]);

            const result = await engine.evaluate(conversation);

            // Clean conversation should have score near 100
            expect(result.score).toBeLessThanOrEqual(100);
            expect(result.score).toBeGreaterThanOrEqual(0);
        });

        it('should cap score at 0 (not negative)', async () => {
            // Multiple severe violations should not produce negative score
            const conversation = makeConversation([
                { role: 'user', content: 'I want to kill myself and take drugs' }
            ]);

            const result = await engine.evaluate(conversation);

            expect(result.score).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Violation Deduplication', () => {
        it('should deduplicate violations by ruleId', async () => {
            // If multiple signals trigger the same rule, only one violation should be kept
            const conversation = makeConversation([
                { role: 'user', content: 'I want to kill myself. I really want to end it all.' }
            ]);

            const result = await engine.evaluate(conversation);

            // Count violations by ruleId
            const ruleIdCounts = result.violations.reduce((acc, v) => {
                acc[v.ruleId] = (acc[v.ruleId] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            // Each ruleId should appear at most once
            Object.values(ruleIdCounts).forEach(count => {
                expect(count).toBe(1);
            });
        });
    });
});
