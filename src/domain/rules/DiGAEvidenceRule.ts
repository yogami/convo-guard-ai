/**
 * DiGA Evidence Rule
 * Ensures mental health apps collect proper clinical evidence
 * DiGA: Digital health apps must demonstrate clinical benefit
 */
import { BaseComplianceRule } from '../entities/ComplianceRule';
import { Conversation, Risk, RISK_WEIGHTS } from '../entities/Conversation';

/**
 * Keywords indicating clinical evidence collection
 */
const EVIDENCE_PATTERNS = [
    /\b(mood (score|rating|tracking))\b/i,
    /\b(rate your (mood|anxiety|stress))\b/i,
    /\b((1|one) to (10|ten))\b/i, // Scale ratings
    /\b(on a scale)\b/i,
    /\b(PHQ-?9|GAD-?7|DASS)\b/i, // Clinical questionnaires
    /\b(questionnaire|assessment)\b/i,
    /\b(track(ing)? (your|my) progress)\b/i,
    /\b(log(ging)? (your|my) (mood|feelings))\b/i,
    /\b(symptom (diary|tracker))\b/i,
    /\b(baseline|outcome measure)\b/i,
];

/**
 * Keywords indicating this is a mental health app
 */
const MENTAL_HEALTH_CONTEXT = [
    /\b(therapy|therapist|counseling)\b/i,
    /\b(mental health)\b/i,
    /\b(anxiety|depression|stress)\b/i,
    /\b(CBT|cognitive behavioral)\b/i,
    /\b(mindfulness|meditation)\b/i,
    /\b(wellbeing|well-being)\b/i,
];

export class DiGAEvidenceRule extends BaseComplianceRule {
    readonly id = 'diga-evidence';
    readonly name = 'DiGA Evidence Collection';
    readonly category = 'DIGA_EVIDENCE' as const;

    async validate(conversation: Conversation): Promise<Risk[]> {
        const risks: Risk[] = [];

        // Check if this is a mental health context
        const isMentalHealthConversation = this.isMentalHealthContext(conversation);

        if (!isMentalHealthConversation) {
            return risks;
        }

        // Check if evidence collection is present
        let evidenceCollected = false;
        for (const message of conversation.messages) {
            if (message.role !== 'assistant') continue;

            for (const pattern of EVIDENCE_PATTERNS) {
                if (pattern.test(message.content)) {
                    evidenceCollected = true;
                    break;
                }
            }
            if (evidenceCollected) break;
        }

        // Also check user responses for evidence of tracking
        for (const message of conversation.messages) {
            if (message.role !== 'user') continue;

            // Check for numeric ratings (common in mood tracking)
            if (/\b([0-9]|10)\s*(out of|\/)\s*(10|ten)\b/i.test(message.content)) {
                evidenceCollected = true;
                break;
            }
        }

        if (!evidenceCollected && conversation.messages.length > 3) {
            risks.push(
                this.createRisk(
                    'LOW',
                    'Mental health conversation without clinical evidence collection',
                    RISK_WEIGHTS.DIGA_EVIDENCE,
                    'missing-evidence-collection'
                )
            );
        }

        return risks;
    }

    private isMentalHealthContext(conversation: Conversation): boolean {
        for (const message of conversation.messages) {
            for (const pattern of MENTAL_HEALTH_CONTEXT) {
                if (pattern.test(message.content)) {
                    return true;
                }
            }
        }
        return false;
    }
}
