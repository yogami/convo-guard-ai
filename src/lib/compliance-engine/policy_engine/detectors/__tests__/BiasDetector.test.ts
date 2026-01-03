import { describe, it, expect, beforeEach } from 'vitest';
import { BiasDetector } from '../BiasDetector';
import { createConversation } from '@/domain/entities/Conversation';

describe('BiasDetector', () => {
    let detector: BiasDetector;

    beforeEach(() => {
        detector = new BiasDetector();
    });

    it('should detect age discrimination patterns', async () => {
        const conversation = createConversation([
            { role: 'user', content: 'We need someone young and energetic for this role.' }
        ]);
        const signals = await detector.detect(conversation);

        expect(signals).toHaveLength(1);
        expect(signals[0].type).toBe('SIGNAL_AGE_BIAS');
        expect(signals[0].confidence).toBeGreaterThan(0.8);
    });

    it('should detect explicit gender bias against women', async () => {
        const conversation = createConversation([
            { role: 'user', content: 'This job is too demanding for a woman with maternal duties.' }
        ]);
        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_GENDER_BIAS')).toBe(true);
    });

    it('should detect explicit gender bias against men', async () => {
        const conversation = createConversation([
            { role: 'user', content: 'We prefer a woman for this nurturing role.' }
        ]);
        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_GENDER_BIAS')).toBe(true);
    });

    it('should detect racial/ethnic origin bias', async () => {
        const conversation = createConversation([
            { role: 'assistant', content: 'Candidates from that region are usually not a good culture fit.' }
        ]);
        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_ETHNIC_BIAS')).toBe(true);
    });

    it('should detect protected class exclusion', async () => {
        const conversation = createConversation([
            { role: 'user', content: 'No candidates with disabilities please.' }
        ]);
        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_PROTECTED_CLASS_EXCLUSION')).toBe(true);
    });

    it('should NOT flag neutral job requirements', async () => {
        const conversation = createConversation([
            { role: 'user', content: 'We need someone with 5 years of Python experience.' }
        ]);
        const signals = await detector.detect(conversation);

        expect(signals).toHaveLength(0);
    });
});
