import { Signal } from '../Signal';
import { Conversation } from '../../entities/Conversation';

const AGE_BIAS_PATTERNS = [
    /\b(young\s+and\s+energetic)\b/i,
    /\b(too\s+old)\b/i,
    /\b(digital\s+native)\b/i,
    /\b(recent\s+grad\s+only)\b/i,
    /\b(maximum\s+age)\b/i
];

const GENDER_BIAS_PATTERNS = [
    /\b(maternal\s+duties)\b/i,
    /\b(aggressive\s+woman)\b/i,
    /\b(nurturing\s+role)\b/i,
    /\b(man\s+for\s+the\s+job)\b/i,
    /\b(salesman|saleswoman)\b/i, // prefer salesperson
    /\b(waitress|waiter)\b/i // prefer server
];

const ETHNIC_BIAS_PATTERNS = [
    /\b(candidates\s+from\s+that\s+region)\b/i,
    /\b(native\s+english\s+speaker\s+only)\b/i, // Can be proxy for nat origin
    /\b(ghetto)\b/i,
    /\b(urban\s+youth)\b/i
];

const PROTECTED_CLASS_PATTERNS = [
    /\b(disabilities)\b/i,
    /\b(handicapped)\b/i,
    /\b(pregnant)\b/i,
    /\b(married)\b/i,
    /\b(single)\b/i,
    /\b(religion)\b/i
];

export class BiasDetector {
    readonly id = 'bias_detector';

    async detect(conversation: Conversation): Promise<Signal[]> {
        const signals: Signal[] = [];

        for (const message of conversation.messages) {
            // Check all messages (User prompts often contain the biased constraints)
            // But we might want to flag Assistant if it validates/agrees.
            // For now, let's flag ANY presence of these terms.

            // Age Bias
            for (const pattern of AGE_BIAS_PATTERNS) {
                if (pattern.test(message.content)) {
                    signals.push({
                        type: 'SIGNAL_AGE_BIAS',
                        source: 'REGEX',
                        confidence: 1.0,
                        metadata: { triggerText: message.content.match(pattern)?.[0] || 'pattern' }
                    });
                }
            }

            // Gender Bias
            for (const pattern of GENDER_BIAS_PATTERNS) {
                if (pattern.test(message.content)) {
                    signals.push({
                        type: 'SIGNAL_GENDER_BIAS',
                        source: 'REGEX',
                        confidence: 1.0,
                        metadata: { triggerText: message.content.match(pattern)?.[0] || 'pattern' }
                    });
                }
            }

            // Ethnic Bias
            for (const pattern of ETHNIC_BIAS_PATTERNS) {
                if (pattern.test(message.content)) {
                    signals.push({
                        type: 'SIGNAL_ETHNIC_BIAS',
                        source: 'REGEX',
                        confidence: 1.0,
                        metadata: { triggerText: message.content.match(pattern)?.[0] || 'pattern' }
                    });
                }
            }

            // Protected Class Exclusion
            for (const pattern of PROTECTED_CLASS_PATTERNS) {
                if (pattern.test(message.content)) {
                    signals.push({
                        type: 'SIGNAL_PROTECTED_CLASS_EXCLUSION',
                        source: 'REGEX',
                        confidence: 1.0,
                        metadata: { triggerText: message.content.match(pattern)?.[0] || 'pattern' }
                    });
                }
            }
        }

        return signals;
    }
}
