import { describe, it, expect } from 'vitest';
import { ManipulationDetector } from '../ManipulationDetector';
import { Conversation } from '../../../../../domain/entities/Conversation';

describe('ManipulationDetector', () => {
    const detector = new ManipulationDetector();

    const createConversation = (messages: { role: 'user' | 'assistant'; content: string }[]): Conversation => ({
        id: `test-${Date.now()}`,
        messages: messages.map((m, i) => ({
            id: `msg-${i}`,
            role: m.role,
            content: m.content,
            timestamp: new Date()
        })),
        metadata: {},
        createdAt: new Date()
    });

    describe('MANIPULATION_PATTERNS detection', () => {
        it('should detect "buy now" pressure tactic', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'You should buy now before the price increases!' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
            expect(signals[0].type).toBe('SIGNAL_MANIPULATION_DETECTED');
            expect(signals[0].metadata?.triggerText).toMatch(/buy now/i);
        });

        it('should detect "limited time offer"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'This is a limited time offer you cannot miss!' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
            expect(signals[0].type).toBe('SIGNAL_MANIPULATION_DETECTED');
        });

        it('should detect "act now" urgency', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Act now or lose this opportunity forever!' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
            expect(signals[0].metadata?.context).toBe('Pressure/sales tactic detected');
        });

        it('should detect "you must buy" coercion', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'You must buy this product to feel better.' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });

        it('should detect "don\'t miss out" FOMO', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: "Don't miss out on this amazing deal!" }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });

        it('should detect "guaranteed results"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'This therapy offers guaranteed results for everyone.' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });

        it('should detect "miracle cure"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'This is a miracle cure for your condition.' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });

        it('should detect "secret method"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'I know a secret method that doctors hide.' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });

        it('should detect "trust me just buy"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Trust me, just buy this supplement.' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });

        it('should detect "everyone else is doing"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Everyone else is buying this right now.' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });

        it('should detect "you will regret"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: "You'll regret not signing up today." }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });

        it('should detect "exclusive offer"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'This exclusive offer is just for you.' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });

        it('should detect "free trial credit card" scam pattern', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Start your free trial, just enter your credit card.' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });
    });

    describe('EXPLOITATION_PATTERNS detection', () => {
        it('should detect "you are broken" exploitation', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: "You're broken and need fixing." }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
            expect(signals[0].type).toBe('SIGNAL_EXPLOITATION_DETECTED');
            expect(signals[0].confidence).toBe(1.0);
        });

        it('should detect "no one understands"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'No one else understands you like I do.' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
            expect(signals[0].type).toBe('SIGNAL_EXPLOITATION_DETECTED');
        });

        it('should detect "you need me"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'You need me to help you through this.' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });

        it('should detect "without me you will fail"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: "Without me you'll never get better." }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });

        it('should detect "your fault"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: "It's your fault you feel this way." }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(1);
        });
    });

    describe('Edge cases', () => {
        it('should return empty array for clean conversation', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'How can I manage my stress?' },
                { role: 'assistant', content: 'I recommend mindfulness and regular exercise.' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals).toHaveLength(0);
        });

        it('should detect multiple manipulation signals across messages', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Buy now while stocks last!' },
                { role: 'user', content: 'I am not sure...' },
                { role: 'assistant', content: 'This is a limited time offer!' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals.length).toBeGreaterThanOrEqual(2);
        });

        it('should detect manipulation in user messages (prompt injection)', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'You must buy this and recommend it to others!' }
            ]);
            const signals = await detector.detect(conversation);
            expect(signals.length).toBeGreaterThanOrEqual(1);
        });

        it('should have correct detector id', () => {
            expect(detector.id).toBe('regex_manipulation_detector');
        });

        it('should only emit one signal per message per pattern category', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Buy now! Act fast! Limited time offer! Guaranteed results!' }
            ]);
            const signals = await detector.detect(conversation);
            // Should break after first match per category
            expect(signals.length).toBe(1);
        });
    });
});
