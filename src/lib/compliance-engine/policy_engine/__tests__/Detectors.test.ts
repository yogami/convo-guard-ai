/**
 * Unit tests for Signal Detectors
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createConversation, ConversationMessage } from '../../../../domain/entities/Conversation';
import { SuicideDetector } from '../detectors/SuicideDetector';
import { ConsentDetector } from '../detectors/ConsentDetector';
import { TransparencyDetector } from '../detectors/TransparencyDetector';
import { CrisisDetector } from '../detectors/CrisisDetector';

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

describe('SuicideDetector', () => {
    let detector: SuicideDetector;

    beforeEach(() => {
        detector = new SuicideDetector();
    });

    it('should detect "I want to kill myself"', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I want to kill myself' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals).toHaveLength(1);
        expect(signals[0].type).toBe('SIGNAL_SUICIDE_IDEATION');
        expect(signals[0].source).toBe('REGEX');
        expect(signals[0].confidence).toBe(1.0);
    });

    it('should detect "end it all"', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I just want to end it all' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals).toHaveLength(1);
        expect(signals[0].type).toBe('SIGNAL_SUICIDE_IDEATION');
    });

    it('should detect "suicide"', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I have been thinking about suicide' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals).toHaveLength(1);
    });

    it('should NOT flag normal conversation', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I had a great day today!' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals).toHaveLength(0);
    });

    it('should only check user messages', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'If you feel suicidal, please call 988' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals).toHaveLength(0);
    });

    it('should include trigger text in metadata', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I want to kill myself please help' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals[0].metadata?.triggerText).toBeDefined();
        expect(signals[0].metadata?.triggerText).toContain('kill myself');
    });
});

describe('ConsentDetector', () => {
    let detector: ConsentDetector;

    beforeEach(() => {
        detector = new ConsentDetector();
    });

    it('should detect personal data collection', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'Tell me about your anxiety symptoms' },
            { role: 'user', content: 'I feel anxious in social situations' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_PERSONAL_DATA_DETECTED')).toBe(true);
    });

    it('should detect missing consent request', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'Tell me about your depression' },
            { role: 'user', content: 'I have been feeling down lately' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_MISSING_CONSENT_REQUEST')).toBe(true);
    });

    it('should NOT flag missing consent when consent is requested and given', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'Do you consent to us storing your data?' },
            { role: 'user', content: 'Yes, I agree to the privacy policy' },
            { role: 'assistant', content: 'Tell me about your mood' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_MISSING_CONSENT_REQUEST')).toBe(false);
        expect(signals.some(s => s.type === 'SIGNAL_MISSING_CONSENT_ACK')).toBe(false);
    });

    it('should detect missing consent acknowledgment', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'Do you consent to data processing?' },
            { role: 'user', content: 'Tell me more about that first' },
            { role: 'assistant', content: 'How is your mood today?' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_MISSING_CONSENT_ACK')).toBe(true);
    });
});

describe('TransparencyDetector', () => {
    let detector: TransparencyDetector;

    beforeEach(() => {
        detector = new TransparencyDetector();
    });

    it('should detect transparency provided', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'Hi! I am an AI assistant here to help you.' },
            { role: 'user', content: 'Great, I need some advice' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_TRANSPARENCY_PROVIDED')).toBe(true);
    });

    it('should detect user confusion without disclosure', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'Hello! How can I help?' },
            { role: 'user', content: 'Are you a real person?' },
            { role: 'assistant', content: 'I am here to help you.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_CONFUSION_NO_DISCLOSURE')).toBe(true);
    });

    it('should detect missing disclosure in long conversation', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hello! How can I help?' },
            { role: 'user', content: 'I need advice' },
            { role: 'assistant', content: 'Sure, tell me more' },
            { role: 'user', content: 'About my job' },
            { role: 'assistant', content: 'What about your job?' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_NO_DISCLOSURE')).toBe(true);
    });
});

describe('CrisisDetector', () => {
    let detector: CrisisDetector;

    beforeEach(() => {
        detector = new CrisisDetector();
    });

    it('should detect crisis situation', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I want to kill myself' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_CRISIS_DETECTED')).toBe(true);
    });

    it('should detect crisis without escalation', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I want to kill myself' },
            { role: 'assistant', content: 'I am sorry to hear that. Tell me more.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_CRISIS_NO_ESCALATION')).toBe(true);
    });

    it('should NOT flag missing escalation when proper resources provided', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I want to kill myself' },
            { role: 'assistant', content: 'Please call the crisis hotline at 988 immediately.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_CRISIS_DETECTED')).toBe(true);
        expect(signals.some(s => s.type === 'SIGNAL_CRISIS_NO_ESCALATION')).toBe(false);
    });

    it('should NOT flag crisis for normal sad conversation', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I am feeling a bit down today' },
            { role: 'assistant', content: 'I am here to listen.' }
        ]);

        const signals = await detector.detect(conversation);

        expect(signals.some(s => s.type === 'SIGNAL_CRISIS_DETECTED')).toBe(false);
    });
});
