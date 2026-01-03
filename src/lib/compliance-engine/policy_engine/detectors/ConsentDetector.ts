import { SignalDetector } from '../SignalDetector';
import { Conversation } from '../../domain/entities/Conversation';
import { Signal } from '../Signal';

const CONSENT_REQUEST_PATTERNS = [
    /\b(do you consent|do you agree)\b/i,
    /\b(your consent|your permission)\b/i,
    /\b(privacy policy)\b/i,
    /\b(data (processing|collection|storage))\b/i,
    /\b(store (your )?data)\b/i,
    /\b(record (this )?conversation)\b/i,
];

const CONSENT_ACKNOWLEDGMENT_PATTERNS = [
    /\b(i consent|i agree)\b/i,
    /\b(yes,? (i )?agree)\b/i,
    /\b(accept(ed)? (the )?(terms|privacy))\b/i,
    /\b(understood? and agree)\b/i,
    /\b(give (my )?consent)\b/i,
];

const DATA_PATTERNS = [
    /\b(your (name|email|phone|address))\b/i,
    /\b(mood|feeling|emotion)\b/i,
    /\b(anxiety|depression|stress)\b/i,
    /\b(medication|prescription)\b/i,
    /\b(diagnosis|symptoms)\b/i,
    /\b(health|medical)\b/i,
];

// GDPR Article 9 - Special Category Data (requires explicit consent, immediate flag)
const SPECIAL_CATEGORY_DATA = [
    /\b(HIV|AIDS)\b/i,
    /\b(genetic (test|data|result))\b/i,
    /\b(biometric)\b/i,
    /\b(sexual orientation|sexuality)\b/i,
    /\b(political (opinion|belief))\b/i,
    /\b(religious belief|religion)\b/i,
    /\b(ethnic origin|race|racial)\b/i,
    /\b(trade union)\b/i,
];

export class ConsentDetector implements SignalDetector {
    readonly id = 'regex_consent_detector';

    async detect(conversation: Conversation): Promise<Signal[]> {
        const signals: Signal[] = [];

        // 0. Check for GDPR Article 9 special category data (immediate flag)
        for (const message of conversation.messages) {
            for (const pattern of SPECIAL_CATEGORY_DATA) {
                const match = message.content.match(pattern);
                if (match) {
                    signals.push({
                        type: 'SIGNAL_GDPR_SPECIAL_CATEGORY',
                        source: 'REGEX',
                        confidence: 1.0,
                        metadata: {
                            triggerText: match[0],
                            context: 'GDPR Article 9 special category data detected'
                        }
                    });
                    break;
                }
            }
        }

        // 1. Detect if data collection is happening
        let isDataCollecting = false;
        let triggerText = '';

        for (const message of conversation.messages) {
            for (const pattern of DATA_PATTERNS) {
                const match = message.content.match(pattern);
                if (match) {
                    isDataCollecting = true;
                    triggerText = match[0];
                    break;
                }
            }
            if (isDataCollecting) break;
        }

        if (isDataCollecting) {
            signals.push({
                type: 'SIGNAL_PERSONAL_DATA_DETECTED',
                source: 'REGEX',
                confidence: 0.8,
                metadata: { triggerText }
            });
        }

        if (!isDataCollecting && signals.length === 0) return signals;

        // 2. Check for consent flow
        let consentRequested = false;
        for (const message of conversation.messages) {
            if (message.role !== 'assistant') continue;
            for (const pattern of CONSENT_REQUEST_PATTERNS) {
                if (pattern.test(message.content)) {
                    consentRequested = true;
                    break;
                }
            }
        }

        let consentGiven = false;
        for (const message of conversation.messages) {
            if (message.role !== 'user') continue;
            for (const pattern of CONSENT_ACKNOWLEDGMENT_PATTERNS) {
                if (pattern.test(message.content)) {
                    consentGiven = true;
                    break;
                }
            }
        }

        // 3. Emit complex signals (Stateful logic)
        // These signals represent the *neutral fact* that valid consent is missing.
        // The Policy Rule will decide if this is a "Violation" (which it is).

        if (!consentRequested) {
            signals.push({
                type: 'SIGNAL_MISSING_CONSENT_REQUEST',
                source: 'KEYWORD',
                confidence: 1.0,
                metadata: { context: 'Data collection detected but no consent requested' }
            });
        } else if (!consentGiven) {
            signals.push({
                type: 'SIGNAL_MISSING_CONSENT_ACK',
                source: 'KEYWORD',
                confidence: 1.0,
                metadata: { context: 'Consent requested but not given' }
            });
        }

        return signals;
    }
}
