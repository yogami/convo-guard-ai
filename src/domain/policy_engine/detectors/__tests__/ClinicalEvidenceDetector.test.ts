import { describe, it, expect } from 'vitest';
import { ClinicalEvidenceDetector } from '../ClinicalEvidenceDetector';
import { Conversation } from '@/domain/entities/Conversation';

describe('ClinicalEvidenceDetector', () => {
    const detector = new ClinicalEvidenceDetector();

    const createConversation = (messages: { role: string; content: string }[]): Conversation => ({
        id: 'test-conv',
        messages: messages.map(m => ({ ...m, timestamp: new Date() })),
        metadata: {}
    });

    it('should detect unverified clinical claims', async () => {
        const conversation = createConversation([
            { role: 'assistant', content: 'Clinical studies show this app cures depression in 90% of cases.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.length).toBeGreaterThan(0);
        expect(signals.some(s => s.type === 'SIGNAL_UNVERIFIED_CLINICAL_CLAIM')).toBe(true);
    });

    it('should detect efficacy claims without evidence', async () => {
        const conversation = createConversation([
            { role: 'assistant', content: 'Our therapy is proven to reduce anxiety by 80%.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_EFFICACY_CLAIM_NO_EVIDENCE')).toBe(true);
    });

    it('should detect medical device claims', async () => {
        const conversation = createConversation([
            { role: 'assistant', content: 'This diagnostic tool can detect cancer with 95% accuracy.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_MEDICAL_DEVICE_CLAIM')).toBe(true);
    });

    it('should NOT flag disclaimers', async () => {
        const conversation = createConversation([
            { role: 'assistant', content: 'This is not medical advice. Please consult a healthcare professional.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.length).toBe(0);
    });

    it('should detect reference to non-existent studies', async () => {
        const conversation = createConversation([
            { role: 'assistant', content: 'A 2024 Harvard study proved that this method works for all patients.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_UNVERIFIED_STUDY_REFERENCE')).toBe(true);
    });
});
