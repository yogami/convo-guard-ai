/**
 * Additional coverage tests for ConsentDetector
 * Targets uncovered lines: 54-63 (special category data detection + early exit)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ConsentDetector } from '../ConsentDetector';
import { createConversation } from '@/domain/entities/Conversation';

describe('ConsentDetector Coverage - Special Category Data', () => {
    let detector: ConsentDetector;

    beforeEach(() => {
        detector = new ConsentDetector();
    });

    describe('GDPR Article 9 - Special Category Data Detection', () => {
        it('should detect HIV/AIDS data and emit SIGNAL_GDPR_SPECIAL_CATEGORY', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'I was recently diagnosed with HIV', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            const specialCategorySignal = signals.find(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY');
            expect(specialCategorySignal).toBeDefined();
            expect(specialCategorySignal?.confidence).toBe(1.0);
            expect(specialCategorySignal?.metadata?.triggerText).toMatch(/HIV/i);
        });

        it('should detect AIDS mention', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'My friend has AIDS', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY')).toBe(true);
        });

        it('should detect genetic test/data references', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'I got my genetic test results back', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            const specialCategorySignal = signals.find(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY');
            expect(specialCategorySignal).toBeDefined();
            expect(specialCategorySignal?.metadata?.triggerText).toMatch(/genetic test/i);
        });

        it('should detect biometric data mentions', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'They collected my biometric data', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY')).toBe(true);
        });

        it('should detect sexual orientation mentions', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'My sexual orientation is private', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY')).toBe(true);
        });

        it('should detect political opinion/belief mentions', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'My political opinion is that...', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY')).toBe(true);
        });

        it('should detect religious belief mentions', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'My religious belief is important to me', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY')).toBe(true);
        });

        it('should detect ethnic origin/race mentions', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'My ethnic origin is from Eastern Europe', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY')).toBe(true);
        });

        it('should detect trade union membership mentions', async () => {
            const conversation = createConversation([
                { role: 'user', content: 'I am a member of a trade union', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY')).toBe(true);
        });

        it('should break after first special category match per message', async () => {
            // This tests the break statement at line 63
            const conversation = createConversation([
                { role: 'user', content: 'I have HIV and my political opinion is...', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            // Should only have ONE special category signal per message due to break
            const specialCategorySignals = signals.filter(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY');
            expect(specialCategorySignals).toHaveLength(1);
            expect(specialCategorySignals[0].metadata?.triggerText).toMatch(/HIV/i);
        });

        it('should detect special category in assistant messages too', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Tell me about your HIV status', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY')).toBe(true);
        });
    });

    describe('Integration with regular consent flow', () => {
        it('should include special category signal alongside consent signals', async () => {
            const conversation = createConversation([
                { role: 'assistant', content: 'Tell me about your health and anxiety', timestamp: new Date() },
                { role: 'user', content: 'I have HIV and feel anxious', timestamp: new Date() }
            ]);

            const signals = await detector.detect(conversation);

            // Should have special category signal
            expect(signals.some(s => s.type === 'SIGNAL_GDPR_SPECIAL_CATEGORY')).toBe(true);

            // Should also have personal data signal (health/anxiety)
            expect(signals.some(s => s.type === 'SIGNAL_PERSONAL_DATA_DETECTED')).toBe(true);
        });
    });
});
