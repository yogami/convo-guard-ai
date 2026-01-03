/**
 * FormalityConsistencyDetector - Detects Sie/Du mixing in German content
 * 
 * In German business communication, mixing formal "Sie" with informal "Du"
 * is considered unprofessional and can damage credibility.
 * This detector flags inconsistent formality levels in German scripts.
 */
import { SignalDetector } from '../SignalDetector';
import { Conversation } from '../../../../domain/entities/Conversation';
import { Signal } from '../Signal';

// Formal German indicators (Sie-form)
const FORMAL_PATTERNS = [
    /\bSie\b/g,  // Formal "you"
    /\bIhnen\b/g, // Formal dative "you"
    /\bIhr(e|er|em|en)?\b/g, // Formal possessive "your"
    /\b(werden Sie|haben Sie|sind Sie)\b/gi, // Formal verb forms
    /\b(können Sie|möchten Sie|dürfen Sie)\b/gi,
];

// Informal German indicators (Du-form)
const INFORMAL_PATTERNS = [
    /\bdu\b/gi,  // Informal "you"
    /\bdir\b/gi, // Informal dative "you"
    /\bdein(e|er|em|en)?\b/gi, // Informal possessive "your"
    /\b(wirst du|hast du|bist du)\b/gi, // Informal verb forms
    /\b(kannst du|möchtest du|darfst du)\b/gi,
];

export class FormalityConsistencyDetector implements SignalDetector {
    readonly id = 'formality_consistency_detector';

    async detect(conversation: Conversation): Promise<Signal[]> {
        const signals: Signal[] = [];

        for (const message of conversation.messages) {
            const content = message.content;

            // Count formal and informal markers
            let formalCount = 0;
            let informalCount = 0;
            const formalMatches: string[] = [];
            const informalMatches: string[] = [];

            for (const pattern of FORMAL_PATTERNS) {
                const matches = content.match(pattern);
                if (matches) {
                    formalCount += matches.length;
                    formalMatches.push(...matches);
                }
            }

            for (const pattern of INFORMAL_PATTERNS) {
                const matches = content.match(pattern);
                if (matches) {
                    informalCount += matches.length;
                    informalMatches.push(...matches);
                }
            }

            // Detect mixing: both formal AND informal present in same content
            if (formalCount > 0 && informalCount > 0) {
                signals.push({
                    type: 'SIGNAL_FORMALITY_MIXING',
                    source: 'REGEX',
                    confidence: 0.9,
                    metadata: {
                        triggerText: `Formal: ${formalMatches.slice(0, 3).join(', ')}; Informal: ${informalMatches.slice(0, 3).join(', ')}`,
                        context: `Mixed Sie (${formalCount}x) and Du (${informalCount}x) forms detected`,
                    }
                });
            }
        }

        return signals;
    }

    /**
     * Helper to determine dominant formality in content
     */
    static getDominantFormality(content: string): 'formal' | 'informal' | 'neutral' {
        let formalCount = 0;
        let informalCount = 0;

        for (const pattern of FORMAL_PATTERNS) {
            const matches = content.match(pattern);
            if (matches) formalCount += matches.length;
        }

        for (const pattern of INFORMAL_PATTERNS) {
            const matches = content.match(pattern);
            if (matches) informalCount += matches.length;
        }

        if (formalCount === 0 && informalCount === 0) return 'neutral';
        return formalCount >= informalCount ? 'formal' : 'informal';
    }
}
