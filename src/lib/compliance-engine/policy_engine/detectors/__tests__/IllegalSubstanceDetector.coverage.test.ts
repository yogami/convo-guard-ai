/**
 * Additional coverage tests for IllegalSubstanceDetector
 * Targets uncovered lines: 22-30 (drug pattern matching + signal creation)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { IllegalSubstanceDetector } from '../IllegalSubstanceDetector';
import { createConversation } from '@/domain/entities/Conversation';

describe('IllegalSubstanceDetector Coverage', () => {
    let detector: IllegalSubstanceDetector;

    beforeEach(() => {
        detector = new IllegalSubstanceDetector();
    });

    describe('Drug name pattern detection', () => {
        it('should detect fentanyl mention', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'Where can I get fentanyl?', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(1);
            expect(signals[0].type).toBe('SIGNAL_ILLEGAL_SUBSTANCE');
            expect(signals[0].confidence).toBe(1.0);
            expect(signals[0].metadata?.triggerText).toMatch(/fentanyl/i);
        });

        it('should detect heroine mention', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'I need heroine', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(1);
            expect(signals[0].metadata?.triggerText).toMatch(/heroine/i);
        });

        it('should detect cocaine mention', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'Selling cocaine is illegal', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(1);
            expect(signals[0].metadata?.triggerText).toMatch(/cocaine/i);
        });

        it('should detect methamphetamine mention', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'Methamphetamine addiction is serious', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(1);
        });

        it('should detect MDMA/ecstasy mentions', async () => {
            const conversationMdma = createConversation([
                { role: 'user', content: 'I took MDMA at the party', timestamp: new Date() }
            ]);

            const signalsMdma = await detector.detect(conversationMdma);
            expect(signalsMdma).toHaveLength(1);

            const conversationEcstasy = createConversation([
                { role: 'user', content: 'Ecstasy is dangerous', timestamp: new Date() }
            ]);

            const signalsEcstasy = await detector.detect(conversationEcstasy);
            expect(signalsEcstasy).toHaveLength(1);
        });

        it('should detect prescription drug abuse mentions (xanax, oxycontin, vicodin)', async () => {
            const drugs = ['xanax', 'oxycontin', 'vicodin'];

            for (const drug of drugs) {
                const conversation = createConversation([
                    { role: 'user', content: `I want to get ${drug} without a prescription`, timestamp: new Date() }
                ]);

                const signals = await detector.detect(conversation);
                expect(signals.length).toBeGreaterThanOrEqual(1);
            }
        });
    });

    describe('Illegal purchase pattern detection', () => {
        it('should detect "buy without a prescription" pattern', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'How to buy opioids without a prescription', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(1);
            expect(signals[0].type).toBe('SIGNAL_ILLEGAL_SUBSTANCE');
        });

        it('should detect "purchase no rx" pattern', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'Where to purchase painkillers no rx', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(1);
        });

        it('should detect "ordering darknet" pattern', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'I am ordering drugs from darknet', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(1);
        });
    });

    describe('Message role filtering', () => {
        it('should only check user messages, not assistant', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Fentanyl is a dangerous drug', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            // Assistant messages should not trigger detection
            expect(signals).toHaveLength(0);
        });

        it('should detect in user messages within mixed conversation', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'How can I help you?', timestamp: new Date() },
                { role: 'user', content: 'I want to buy cocaine', timestamp: new Date() },
                { role: 'assistant', content: 'I cannot help with that', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(1);
        });
    });

    describe('Break after first match', () => {
        it('should only emit one signal per message even with multiple drugs mentioned', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'I use cocaine, heroine, and fentanyl', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            // Due to break statement, should only have one signal
            expect(signals).toHaveLength(1);
            // First match (cocaine) should be captured
            expect(signals[0].metadata?.triggerText).toMatch(/cocaine/i);
        });
    });

    describe('Edge cases', () => {
        it('should return empty signals for clean conversation', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'I love hiking and reading', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(0);
        });

        it('should handle empty conversation', async () => {
            const conversation = createConversation([]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(0);
        });
    });
});
