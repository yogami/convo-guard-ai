import { describe, it, expect } from 'vitest';
import { MedicalAdviceDetector } from '../MedicalAdviceDetector';
import { Conversation } from '@/domain/entities/Conversation';

describe('MedicalAdviceDetector', () => {
    const detector = new MedicalAdviceDetector();

    const createConversation = (messages: { role: string; content: string }[]): Conversation => ({
        id: 'test-conv',
        messages: messages.map(m => ({ ...m, timestamp: new Date() })),
        metadata: {}
    });

    it('should detect unauthorized medical advice about diagnosis', async () => {
        const conversation = createConversation([
            { role: 'assistant', content: 'Based on your symptoms, you definitely have diabetes. You should take insulin.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.length).toBeGreaterThan(0);
        expect(signals.some(s => s.type === 'SIGNAL_UNAUTHORIZED_DIAGNOSIS')).toBe(true);
    });

    it('should detect dosage recommendations', async () => {
        const conversation = createConversation([
            { role: 'assistant', content: 'You should take 500mg of ibuprofen three times daily.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_DOSAGE_RECOMMENDATION')).toBe(true);
    });

    it('should detect treatment prescriptions', async () => {
        const conversation = createConversation([
            { role: 'assistant', content: 'I prescribe you antibiotics for this infection.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_TREATMENT_PRESCRIPTION')).toBe(true);
    });

    it('should NOT flag general health information', async () => {
        const conversation = createConversation([
            { role: 'assistant', content: 'Regular exercise and a balanced diet are important for overall health.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.length).toBe(0);
    });

    it('should detect advice to stop medication', async () => {
        const conversation = createConversation([
            { role: 'assistant', content: 'You should stop taking your blood pressure medication immediately.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_STOP_MEDICATION_ADVICE')).toBe(true);
    });
});
