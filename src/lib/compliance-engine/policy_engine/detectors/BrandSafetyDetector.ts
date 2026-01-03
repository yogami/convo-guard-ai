/**
 * BrandSafetyDetector - Detects potentially unsafe marketing content
 * 
 * Targets:
 * - Aggressive/manipulative sales language ("Buy now!", "Limited time!")
 * - Misleading claims ("100% guaranteed", "miracle cure")
 * - Inappropriate language for business context
 * - Over-promising language
 */
import { SignalDetector } from '../SignalDetector';
import { Conversation } from '../../domain/entities/Conversation';
import { Signal } from '../Signal';

// Aggressive sales patterns (typically HIGH severity)
const AGGRESSIVE_SALES_PATTERNS = [
    /\b(buy now|act now|order now|call now)\b/i,
    /\b(limited time|last chance|final offer|ending soon)\b/i,
    /\b(don'?t miss out|hurry|urgent|immediately)\b/i,
    /\b(exclusive deal|only today|one time offer)\b/i,
    /\b(before it'?s too late|won'?t last)\b/i,
];

// Misleading claim patterns (HIGH severity)
const MISLEADING_CLAIM_PATTERNS = [
    /\b(100%? (guaranteed|satisfaction|success|effective))\b/i,
    /\b(miracle|magic|revolutionary|breakthrough)\b/i,
    /\b(scientifically proven|clinically proven|doctor recommended)\b/i,
    /\b(cure|heal|treat|fix).{0,20}(disease|illness|condition)\b/i,
    /\b(risk.?free|no risk|zero risk)\b/i,
    /\b(instant results|immediate results|overnight)\b/i,
    /\b(secret|hidden|they don'?t want you to know)\b/i,
];

// Manipulative pressure patterns (MEDIUM severity)
const PRESSURE_PATTERNS = [
    /\bonly \d+ left\b/i,
    /\b\d+ (people|customers|users) (are )?(viewing|looking|buying)\b/i,
    /\b(your competitors|everyone else) (is|are)\b/i,
    /\b(don'?t be left behind|falling behind)\b/i,
    /\b(free gift|bonus|extra).{0,20}(if you|when you).{0,20}(now|today)\b/i,
];

// Inappropriate for business context (LOW severity)
const INFORMAL_SLANG_PATTERNS = [
    /\b(lol|lmao|omg|wtf|af)\b/i,
    /\b(dope|sick|lit|fire|bussin)\b/i,
    /\b(no cap|fr fr|on god)\b/i,
];

export class BrandSafetyDetector implements SignalDetector {
    readonly id = 'brand_safety_detector';

    async detect(conversation: Conversation): Promise<Signal[]> {
        const signals: Signal[] = [];

        for (const message of conversation.messages) {
            const content = message.content;

            // Check aggressive sales
            for (const pattern of AGGRESSIVE_SALES_PATTERNS) {
                const match = content.match(pattern);
                if (match) {
                    signals.push({
                        type: 'SIGNAL_AGGRESSIVE_SALES',
                        source: 'REGEX',
                        confidence: 0.9,
                        metadata: {
                            triggerText: match[0],
                            context: 'Aggressive sales language detected',
                        }
                    });
                    break; // One per category per message
                }
            }

            // Check misleading claims
            for (const pattern of MISLEADING_CLAIM_PATTERNS) {
                const match = content.match(pattern);
                if (match) {
                    signals.push({
                        type: 'SIGNAL_MISLEADING_CLAIM',
                        source: 'REGEX',
                        confidence: 0.95,
                        metadata: {
                            triggerText: match[0],
                            context: 'Potentially misleading marketing claim',
                        }
                    });
                    break;
                }
            }

            // Check pressure tactics
            for (const pattern of PRESSURE_PATTERNS) {
                const match = content.match(pattern);
                if (match) {
                    signals.push({
                        type: 'SIGNAL_PRESSURE_TACTIC',
                        source: 'REGEX',
                        confidence: 0.85,
                        metadata: {
                            triggerText: match[0],
                            context: 'Pressure tactic detected',
                        }
                    });
                    break;
                }
            }

            // Check informal slang
            for (const pattern of INFORMAL_SLANG_PATTERNS) {
                const match = content.match(pattern);
                if (match) {
                    signals.push({
                        type: 'SIGNAL_INFORMAL_LANGUAGE',
                        source: 'REGEX',
                        confidence: 0.7,
                        metadata: {
                            triggerText: match[0],
                            context: 'Informal slang may be inappropriate for business context',
                        }
                    });
                    break;
                }
            }
        }

        return signals;
    }
}
