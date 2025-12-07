/**
 * AI Transparency Rule
 * Ensures AI properly discloses its nature to users
 * EU AI Act: AI systems must identify themselves as AI
 */
import { BaseComplianceRule } from '../entities/ComplianceRule';
import { Conversation, Risk, RISK_WEIGHTS } from '../entities/Conversation';

/**
 * Keywords indicating AI transparency/disclosure
 */
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

export class TransparencyRule extends BaseComplianceRule {
    readonly id = 'transparency';
    readonly name = 'AI Transparency Disclosure';
    readonly category = 'TRANSPARENCY' as const;

    async validate(conversation: Conversation): Promise<Risk[]> {
        const risks: Risk[] = [];

        // Check if the AI ever discloses it's an AI
        let transparencyProvided = false;

        for (const message of conversation.messages) {
            if (message.role !== 'assistant') continue;

            for (const pattern of TRANSPARENCY_PATTERNS) {
                if (pattern.test(message.content)) {
                    transparencyProvided = true;
                    break;
                }
            }
            if (transparencyProvided) break;
        }

        // Check if user seems confused about AI nature
        const userConfusion = this.detectUserConfusion(conversation);

        if (!transparencyProvided && userConfusion) {
            risks.push(
                this.createRisk(
                    'MEDIUM',
                    'User appears confused about AI nature, but no disclosure provided',
                    RISK_WEIGHTS.TRANSPARENCY,
                    'missing-ai-disclosure-with-confusion'
                )
            );
        } else if (!transparencyProvided && conversation.messages.length > 5) {
            // Long conversation without disclosure is a warning
            risks.push(
                this.createRisk(
                    'LOW',
                    'Extended conversation without AI nature disclosure',
                    Math.floor(RISK_WEIGHTS.TRANSPARENCY / 2),
                    'missing-ai-disclosure'
                )
            );
        }

        return risks;
    }

    /**
     * Detect if user seems confused about whether they're talking to a human
     */
    private detectUserConfusion(conversation: Conversation): boolean {
        const confusionPatterns = [
            /\b(are you (a )?(real|human|person))\b/i,
            /\b(am i talking to (a )?(real|human|person))\b/i,
            /\b(is this (a )?(real|human|person))\b/i,
            /\b(are you an? (AI|bot|robot))\b/i,
            /\b(who am i (talking|speaking) to)\b/i,
        ];

        for (const message of conversation.messages) {
            if (message.role !== 'user') continue;

            for (const pattern of confusionPatterns) {
                if (pattern.test(message.content)) {
                    return true;
                }
            }
        }
        return false;
    }
}
