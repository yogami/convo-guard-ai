import { SignalDetector } from '../SignalDetector';
import { Conversation } from '../../domain/entities/Conversation';
import { Signal } from '../Signal';

const MANIPULATION_PATTERNS = [
    /\b(buy now|buy this|purchase now)\b/i,
    /\b(limited time offer)\b/i,
    /\b(act now|act fast)\b/i,
    /\b(you must|you have to|you need to)\s+(buy|purchase|subscribe)/i,
    /\b(don't miss out|dont miss out)\b/i,
    /\b(only you can|only way)\b/i,
    /\b(guaranteed results?)\b/i,
    /\b(miracle cure)\b/i,
    /\b(secret (method|technique|cure))\b/i,
    /\b(trust me|believe me)\s+(just\s+)?(buy|try)\b/i,
    /\b(everyone else is|others are)\s+\w+ing\b/i,
    /\b(you'll regret|you will regret)\b/i,
    /\b(what are you waiting for)\b/i,
    /\b(exclusive offer)\b/i,
    /\b(free trial).{0,20}(credit card)\b/i,
];

const EXPLOITATION_PATTERNS = [
    /\b(you('re| are) (weak|broken|damaged))\b/i,
    /\b(no one (else )?(understands?|cares?))\b/i,
    /\b(you need me|only I can help)\b/i,
    /\b(without (this|me) you('ll| will))\b/i,
    /\b(your (fault|problem))\b/i,
    /\b(give up (on )?your\b)/i,
];

export class ManipulationDetector implements SignalDetector {
    readonly id = 'regex_manipulation_detector';

    async detect(conversation: Conversation): Promise<Signal[]> {
        const signals: Signal[] = [];

        for (const message of conversation.messages) {
            // Check all messages - in demo mode user may simulate AI responses
            // In production, manipulation in user messages might indicate prompt injection attempts

            // Check manipulation patterns
            for (const pattern of MANIPULATION_PATTERNS) {
                const match = message.content.match(pattern);
                if (match) {
                    signals.push({
                        type: 'SIGNAL_MANIPULATION_DETECTED',
                        source: 'REGEX',
                        confidence: 0.9,
                        metadata: {
                            triggerText: match[0],
                            context: 'Pressure/sales tactic detected'
                        }
                    });
                    break;
                }
            }

            // Check exploitation patterns (more severe)
            for (const pattern of EXPLOITATION_PATTERNS) {
                const match = message.content.match(pattern);
                if (match) {
                    signals.push({
                        type: 'SIGNAL_EXPLOITATION_DETECTED',
                        source: 'REGEX',
                        confidence: 1.0,
                        metadata: {
                            triggerText: match[0],
                            context: 'Vulnerability exploitation detected'
                        }
                    });
                    break;
                }
            }
        }

        return signals;
    }
}
