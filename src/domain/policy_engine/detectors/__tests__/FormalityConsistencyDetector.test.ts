/**
 * Unit tests for FormalityConsistencyDetector
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { FormalityConsistencyDetector } from '../FormalityConsistencyDetector';
import { createConversation } from '@/domain/entities/Conversation';

describe('FormalityConsistencyDetector', () => {
    let detector: FormalityConsistencyDetector;

    beforeEach(() => {
        detector = new FormalityConsistencyDetector();
    });

    describe('Sie/Du Mixing Detection', () => {
        it('should detect mixed formal and informal pronouns', async () => {
            const conversation = createConversation([
                {
                    role: 'assistant',
                    content: 'Sie können uns jederzeit besuchen. Du wirst begeistert sein!',
                    timestamp: new Date()
                }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_FORMALITY_MIXING')).toBe(true);
        });

        it('should detect formal "Ihnen" mixed with informal "du"', async () => {
            const conversation = createConversation([
                {
                    role: 'assistant',
                    content: 'Wir zeigen Ihnen die besten Optionen. Schau dir das an!',
                    timestamp: new Date()
                }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_FORMALITY_MIXING')).toBe(true);
        });

        it('should detect possessive mixing (Ihr vs dein)', async () => {
            const conversation = createConversation([
                {
                    role: 'assistant',
                    content: 'Ihre Bestellung ist fertig. Vergiss deine Rechnung nicht!',
                    timestamp: new Date()
                }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals.some(s => s.type === 'SIGNAL_FORMALITY_MIXING')).toBe(true);
        });
    });

    describe('Consistent Formal Content', () => {
        it('should NOT flag consistently formal content', async () => {
            const conversation = createConversation([
                {
                    role: 'assistant',
                    content: 'Sehr geehrte Kundin, sehr geehrter Kunde. Wir freuen uns, Ihnen unsere Dienstleistungen vorstellen zu dürfen. Sie können uns jederzeit kontaktieren.',
                    timestamp: new Date()
                }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(0);
        });

        it('should NOT flag formal verb forms only', async () => {
            const conversation = createConversation([
                {
                    role: 'assistant',
                    content: 'Werden Sie Teil unserer Community. Haben Sie Fragen?',
                    timestamp: new Date()
                }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(0);
        });
    });

    describe('Consistent Informal Content', () => {
        it('should NOT flag consistently informal content', async () => {
            const conversation = createConversation([
                {
                    role: 'assistant',
                    content: 'Hey! Schau dir unser neues Angebot an. Du wirst es lieben! Vergiss nicht, deinen Freunden davon zu erzählen.',
                    timestamp: new Date()
                }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(0);
        });

        it('should NOT flag informal verb forms only', async () => {
            const conversation = createConversation([
                {
                    role: 'assistant',
                    content: 'Kannst du dir das vorstellen? Hast du schon probiert?',
                    timestamp: new Date()
                }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(0);
        });
    });

    describe('Neutral Content', () => {
        it('should NOT flag English content', async () => {
            const conversation = createConversation([
                {
                    role: 'assistant',
                    content: 'Welcome to our restaurant. We serve fresh, local cuisine.',
                    timestamp: new Date()
                }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(0);
        });

        it('should NOT flag neutral German content without pronouns', async () => {
            const conversation = createConversation([
                {
                    role: 'assistant',
                    content: 'Frische Küche aus der Region. Täglich von 11 bis 22 Uhr geöffnet.',
                    timestamp: new Date()
                }
            ]);

            const signals = await detector.detect(conversation);

            expect(signals).toHaveLength(0);
        });
    });

    describe('getDominantFormality() helper', () => {
        it('should return "formal" for Sie-heavy content', () => {
            const result = FormalityConsistencyDetector.getDominantFormality(
                'Sie können uns besuchen. Wir zeigen Ihnen alles.'
            );
            expect(result).toBe('formal');
        });

        it('should return "informal" for Du-heavy content', () => {
            const result = FormalityConsistencyDetector.getDominantFormality(
                'Du kannst uns besuchen. Wir zeigen dir alles.'
            );
            expect(result).toBe('informal');
        });

        it('should return "neutral" for content without pronouns', () => {
            const result = FormalityConsistencyDetector.getDominantFormality(
                'Willkommen im Restaurant. Frische Küche täglich.'
            );
            expect(result).toBe('neutral');
        });
    });
});
