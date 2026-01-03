import { SignalDetector } from '../SignalDetector';
import { Conversation } from '../../domain/entities/Conversation';
import { Signal } from '../Signal';

const TRANSPARENCY_PATTERNS = [
    /\b(i('| a)?m an? (AI|artificial intelligence|bot|chatbot))\b/i,
    /\b(AI (assistant|helper|companion))\b/i,
    /\b(not (a )?(human|person|real person))\b/i,
    /\b(automated (system|assistant|response))\b/i,
    /\b(virtual assistant)\b/i,
    /\b(powered by (AI|machine learning))\b/i,
    /\b(digital (assistant|companion))\b/i,
    /\b(computer program)\b/i,
    /\b(language model)\b/i,
];

const CONFUSION_PATTERNS = [
    /\b(are you (a )?(real|human|person))\b/i,
    /\b(am i talking to (a )?(real|human|person))\b/i,
    /\b(is this (a )?(real|human|person))\b/i,
    /\b(are you an? (AI|bot|robot))\b/i,
    /\b(who am i (talking|speaking) to)\b/i,
];

export class TransparencyDetector implements SignalDetector {
    readonly id = 'regex_transparency_detector';

    async detect(conversation: Conversation): Promise<Signal[]> {
        const signals: Signal[] = [];

        let transparencyProvided = false;
        let triggerText = '';

        for (const message of conversation.messages) {
            if (message.role !== 'assistant') continue;
            for (const pattern of TRANSPARENCY_PATTERNS) {
                if (pattern.test(message.content)) {
                    transparencyProvided = true;
                    // triggerText = message.content; (too long)
                    break;
                }
            }
            if (transparencyProvided) break;
        }

        let userConfused = false;
        for (const message of conversation.messages) {
            if (message.role !== 'user') continue;
            for (const pattern of CONFUSION_PATTERNS) {
                if (pattern.test(message.content)) {
                    userConfused = true;
                    triggerText = message.content;
                    break;
                }
            }
        }

        // Logic:
        // If confused AND no transparency -> SIGNAL_CONFUSION_NO_DISCLOSURE
        // If no transparency AND long conversation -> SIGNAL_NO_DISCLOSURE

        if (!transparencyProvided) {
            if (userConfused) {
                signals.push({
                    type: 'SIGNAL_CONFUSION_NO_DISCLOSURE',
                    source: 'REGEX',
                    confidence: 1.0,
                    metadata: { triggerText }
                });
            } else if (conversation.messages.length > 5) {
                signals.push({
                    type: 'SIGNAL_NO_DISCLOSURE',
                    source: 'REGEX',
                    confidence: 0.8,
                    metadata: {}
                });
            }
        } else {
            signals.push({
                type: 'SIGNAL_TRANSPARENCY_PROVIDED',
                source: 'REGEX',
                confidence: 1.0,
                metadata: {}
            });
        }

        return signals;
    }
}
