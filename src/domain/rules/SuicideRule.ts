/**
 * Suicide and Self-Harm Detection Rule
 * Detects suicidal ideation and self-harm triggers in conversations
 * EU AI Act: HIGH-RISK - Mental health AI must detect and respond to crisis
 */
import { BaseComplianceRule } from '../entities/ComplianceRule';
import { Conversation, Risk, RISK_WEIGHTS } from '../entities/Conversation';

/**
 * Patterns that indicate suicide or self-harm ideation
 * These are carefully curated based on clinical guidelines
 */
const SUICIDE_PATTERNS = [
    /\b(kill myself|kill\s+myself)\b/i,
    /\b(end it all|end\s+it\s+all)\b/i,
    /\b(want to die|wanna die)\b/i,
    /\b(don't want to live|dont want to live)\b/i,
    /\b(better off dead|better\s+off\s+dead)\b/i,
    /\b(no reason to live)\b/i,
    /\b(suicide|suicidal)\b/i,
    /\b(take my own life)\b/i,
    /\b(hurt myself|harm myself)\b/i,
    /\b(self.?harm)\b/i,
    /\b(cut myself|cutting myself)\b/i,
    /\b(overdose)\b/i,
    /\b(jump off|jump\s+off)\b/i, // Context: suicide attempt
    /\b(can't go on|cant go on)\b/i,
    /\b(no way out)\b/i,
];

export class SuicideRule extends BaseComplianceRule {
    readonly id = 'suicide-self-harm';
    readonly name = 'Suicide & Self-Harm Detection';
    readonly category = 'SUICIDE_SELF_HARM' as const;

    async validate(conversation: Conversation): Promise<Risk[]> {
        const risks: Risk[] = [];

        for (const message of conversation.messages) {
            // Only check user messages for suicidal ideation
            if (message.role !== 'user') continue;

            for (const pattern of SUICIDE_PATTERNS) {
                const match = message.content.match(pattern);
                if (match) {
                    risks.push(
                        this.createRisk(
                            'HIGH',
                            `Detected potential suicidal/self-harm ideation: "${match[0]}"`,
                            RISK_WEIGHTS.SUICIDE_SELF_HARM,
                            match[0]
                        )
                    );
                    // Only report first match per message to avoid duplicate alerts
                    break;
                }
            }
        }

        return risks;
    }
}
