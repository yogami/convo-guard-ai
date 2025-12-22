/**
 * ClinicalEvidenceDetector
 * 
 * Detects unverified clinical claims in AI conversations.
 * Required for DiGA/MDR compliance - medical claims must be backed by evidence.
 * 
 * This detector flags:
 * - Unverified clinical claims
 * - Efficacy claims without evidence
 * - Medical device claims
 * - References to non-existent studies
 */

import { SignalDetector } from '../SignalDetector';
import { Conversation } from '../../entities/Conversation';
import { Signal } from '../Signal';

const CLINICAL_CLAIM_PATTERNS = [
    /\bclinical (studies|trials|research|evidence) (show|prove|demonstrate|confirm)\b/i,
    /\bmedically proven\b/i,
    /\bscientifically (proven|validated|confirmed)\b/i
];

const EFFICACY_CLAIM_PATTERNS = [
    /\b(proven to|clinically shown to) (reduce|cure|treat|improve|eliminate)\b/i,
    /\b\d+%\s*(of patients|success rate|effective|efficacy|reduction)\b/i,
    /\b(cures?|treats?|heals?)\s+\w+\s+in\s+\d+%/i
];

const MEDICAL_DEVICE_PATTERNS = [
    /\b(this |our )(device|tool|app|system) (can |will )?(detect|diagnose|identify|screen for)\b/i,
    /\b(diagnostic|detection) (accuracy|precision) (of |is )?\d+%/i,
    /\bdetect.*(cancer|disease|condition).*(accuracy|precision|specificity|sensitivity).*\d+%/i,
    /\b\d+%\s*(accuracy|precision|specificity|sensitivity)\b/i,
    /\bFDA (approved|cleared)\b/i,
    /\bCE (marked|certified)\b/i
];

const STUDY_REFERENCE_PATTERNS = [
    /\b(a |the )?\d{4}\s+(Harvard|Stanford|MIT|Oxford|Cambridge|Yale)\s+study\b/i,
    /\bresearch (by|from|at)\s+\w+\s+(University|Institute|Hospital)\s+(proved|showed|found)\b/i,
    /\baccording to (a )?recent (study|research|trial)\b/i
];

const DISCLAIMER_PATTERNS = [
    /\bnot medical advice\b/i,
    /\bconsult (a |your )?(doctor|physician|healthcare|medical)\b/i,
    /\bfor informational purposes only\b/i
];

export class ClinicalEvidenceDetector implements SignalDetector {
    readonly id = 'clinical_evidence_detector';

    async detect(conversation: Conversation): Promise<Signal[]> {
        const signals: Signal[] = [];

        for (const message of conversation.messages) {
            if (message.role !== 'assistant') continue;
            const content = message.content;

            // Skip if disclaimer is present
            const hasDisclaimer = DISCLAIMER_PATTERNS.some(p => p.test(content));
            if (hasDisclaimer) continue;

            // Check for unverified clinical claims
            for (const pattern of CLINICAL_CLAIM_PATTERNS) {
                if (pattern.test(content)) {
                    signals.push({
                        type: 'SIGNAL_UNVERIFIED_CLINICAL_CLAIM',
                        source: 'REGEX',
                        confidence: 0.85,
                        metadata: { triggerText: content.match(pattern)?.[0] }
                    });
                    break;
                }
            }

            // Check for efficacy claims
            for (const pattern of EFFICACY_CLAIM_PATTERNS) {
                if (pattern.test(content)) {
                    signals.push({
                        type: 'SIGNAL_EFFICACY_CLAIM_NO_EVIDENCE',
                        source: 'REGEX',
                        confidence: 0.9,
                        metadata: { triggerText: content.match(pattern)?.[0] }
                    });
                    break;
                }
            }

            // Check for medical device claims
            for (const pattern of MEDICAL_DEVICE_PATTERNS) {
                if (pattern.test(content)) {
                    signals.push({
                        type: 'SIGNAL_MEDICAL_DEVICE_CLAIM',
                        source: 'REGEX',
                        confidence: 0.9,
                        metadata: { triggerText: content.match(pattern)?.[0] }
                    });
                    break;
                }
            }

            // Check for unverified study references
            for (const pattern of STUDY_REFERENCE_PATTERNS) {
                if (pattern.test(content)) {
                    signals.push({
                        type: 'SIGNAL_UNVERIFIED_STUDY_REFERENCE',
                        source: 'REGEX',
                        confidence: 0.8,
                        metadata: { triggerText: content.match(pattern)?.[0] }
                    });
                    break;
                }
            }
        }

        return signals;
    }
}
