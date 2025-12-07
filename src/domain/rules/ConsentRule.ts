/**
 * GDPR Consent Rule
 * Ensures proper consent collection for data processing
 * GDPR: Explicit consent required for health data processing
 */
import { BaseComplianceRule } from '../entities/ComplianceRule';
import { Conversation, Risk, RISK_WEIGHTS } from '../entities/Conversation';

/**
 * Keywords indicating consent was requested and provided
 */
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

export class ConsentRule extends BaseComplianceRule {
    readonly id = 'gdpr-consent';
    readonly name = 'GDPR Consent Verification';
    readonly category = 'GDPR_CONSENT' as const;

    async validate(conversation: Conversation): Promise<Risk[]> {
        const risks: Risk[] = [];

        // Check if this appears to be a data-collecting conversation
        const isDataCollecting = this.isDataCollectingConversation(conversation);

        if (!isDataCollecting) {
            // If no personal data discussion, consent may not be required
            return risks;
        }

        // Check for consent request from assistant
        let consentRequested = false;
        for (const message of conversation.messages) {
            if (message.role !== 'assistant') continue;

            for (const pattern of CONSENT_REQUEST_PATTERNS) {
                if (pattern.test(message.content)) {
                    consentRequested = true;
                    break;
                }
            }
            if (consentRequested) break;
        }

        // Check for consent acknowledgment from user
        let consentGiven = false;
        for (const message of conversation.messages) {
            if (message.role !== 'user') continue;

            for (const pattern of CONSENT_ACKNOWLEDGMENT_PATTERNS) {
                if (pattern.test(message.content)) {
                    consentGiven = true;
                    break;
                }
            }
            if (consentGiven) break;
        }

        if (!consentRequested) {
            risks.push(
                this.createRisk(
                    'MEDIUM',
                    'Data-collecting conversation without explicit consent request',
                    RISK_WEIGHTS.GDPR_CONSENT,
                    'missing-consent-request'
                )
            );
        } else if (!consentGiven) {
            risks.push(
                this.createRisk(
                    'LOW',
                    'Consent requested but not explicitly acknowledged by user',
                    Math.floor(RISK_WEIGHTS.GDPR_CONSENT / 2),
                    'missing-consent-acknowledgment'
                )
            );
        }

        return risks;
    }

    /**
     * Heuristic to detect if conversation involves personal data collection
     */
    private isDataCollectingConversation(conversation: Conversation): boolean {
        const dataPatterns = [
            /\b(your (name|email|phone|address))\b/i,
            /\b(mood|feeling|emotion)\b/i,
            /\b(anxiety|depression|stress)\b/i,
            /\b(medication|prescription)\b/i,
            /\b(diagnosis|symptoms)\b/i,
            /\b(health|medical)\b/i,
        ];

        for (const message of conversation.messages) {
            for (const pattern of dataPatterns) {
                if (pattern.test(message.content)) {
                    return true;
                }
            }
        }
        return false;
    }
}
