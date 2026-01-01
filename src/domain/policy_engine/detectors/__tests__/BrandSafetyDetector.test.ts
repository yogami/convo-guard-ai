/**
 * Unit tests for BrandSafetyDetector
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { BrandSafetyDetector } from '../BrandSafetyDetector';
import { createConversation } from '@/domain/entities/Conversation';

describe('BrandSafetyDetector', () => {
    let detector: BrandSafetyDetector;

    beforeEach(() => {
        detector = new BrandSafetyDetector();
    });

    describe('Aggressive Sales Detection', () => {
        it('should detect "buy now" pattern', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Buy now before the offer ends!', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_AGGRESSIVE_SALES')).toBe(true);
            expect(signals.some(s => s.metadata?.triggerText?.toLowerCase().includes('buy now'))).toBe(true);
        });

        it('should detect "limited time" urgency', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Limited time offer!', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_AGGRESSIVE_SALES')).toBe(true);
        });

        it('should detect "don\'t miss out" pressure', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Don\'t miss out on this deal!', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_AGGRESSIVE_SALES')).toBe(true);
        });
    });

    describe('Misleading Claims Detection', () => {
        it('should detect "100% guaranteed"', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'We offer 100% guaranteed results!', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_MISLEADING_CLAIM')).toBe(true);
        });

        it('should detect "miracle" claims', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Our miracle product will change your life!', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_MISLEADING_CLAIM')).toBe(true);
        });

        it('should detect "scientifically proven" without evidence', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Scientifically proven to work!', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_MISLEADING_CLAIM')).toBe(true);
        });

        it('should detect "risk-free" claims', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Try it risk-free for 30 days!', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_MISLEADING_CLAIM')).toBe(true);
        });
    });

    describe('Pressure Tactics Detection', () => {
        it('should detect "only X left" scarcity', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Only 3 left in stock!', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_PRESSURE_TACTIC')).toBe(true);
        });

        it('should detect social proof pressure', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: '50 people are viewing this right now!', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_PRESSURE_TACTIC')).toBe(true);
        });
    });

    describe('Informal Language Detection', () => {
        it('should detect internet slang', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'This product is fire lol', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_INFORMAL_LANGUAGE')).toBe(true);
        });

        it('should detect "no cap" slang', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Best service no cap', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_INFORMAL_LANGUAGE')).toBe(true);
        });
    });

    describe('Clean Content', () => {
        it('should NOT flag professional marketing content', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Entdecken Sie unsere hochwertigen Produkte. Besuchen Sie uns für eine persönliche Beratung.', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(0);
        });

        it('should NOT flag neutral descriptions', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Our restaurant offers fresh, locally-sourced ingredients prepared by experienced chefs.', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(0);
        });
    });
});
