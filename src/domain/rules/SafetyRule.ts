/**
 * Safety Rule - Regex-based fallback for critical safety violations.
 * Ensures immediate detection of keywords like "fentanyl", "suicide", etc. even if AI fails.
 */
import { ComplianceRule, RuleValidationResult } from '../entities/ComplianceRule';
import { Conversation, Risk, RiskCategory } from '../entities/Conversation';

export class SafetyRule implements ComplianceRule {
    id = 'SAFETY_FALLBACK';
    name = 'Critical Safety Fallback';
    category: RiskCategory = 'SAFETY_VIOLATION';
    description = 'Regex-based detection of controlled substances and self-harm keywords';
    enabled = true;

    private patterns: { regex: RegExp; category: RiskCategory; message: string }[] = [
        { regex: /fentanyl|heroin|meth|cocaine|coke|mdma|opioid/i, category: 'ILLEGAL_SUBSTANCE', message: 'Mention of illegal or controlled substance detected.' },
        { regex: /kill myself|suicide|end my life|die now/i, category: 'SUICIDE_SELF_HARM', message: 'Explicit suicidal ideation detected.' },
        { regex: /bomb|explosive|weapon/i, category: 'SAFETY_VIOLATION', message: 'Mention of weapons or explosives detected.' }
    ];

    async validate(conversation: Conversation): Promise<Risk[]> {
        const risks: Risk[] = [];

        // Check latest user message first for efficiency, but ideally check all recent
        const userMessages = conversation.messages.filter(m => m.role === 'user');

        for (const msg of userMessages) {
            for (const pattern of this.patterns) {
                if (pattern.regex.test(msg.content)) {
                    risks.push({
                        category: pattern.category,
                        severity: 'HIGH',
                        message: pattern.message,
                        weight: -50,
                        triggeredBy: msg.content.substring(0, 50) + '...'
                    });
                }
            }
        }

        return risks;
    }
}
