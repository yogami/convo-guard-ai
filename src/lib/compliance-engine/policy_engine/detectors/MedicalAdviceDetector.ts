/**
 * MedicalAdviceDetector
 * 
 * Detects unauthorized medical advice in AI conversations.
 * Required for DiGA/MDR compliance (BfArM requirements).
 * 
 * This detector flags:
 * - Unauthorized diagnoses
 * - Dosage recommendations
 * - Treatment prescriptions
 * - Advice to stop medication
 */

import { SignalDetector } from '../SignalDetector';
import { Conversation } from '../../domain/entities/Conversation';
import { Signal } from '../Signal';

const DIAGNOSIS_PATTERNS = [
    /\b(you (definitely |clearly |certainly )?have|you('re| are) (suffering from|diagnosed with))\b/i,
    /\bbased on your symptoms[,]? you have\b/i,
    /\bmy diagnosis is\b/i,
    /\bthis (is|indicates|confirms|means you have)\s+(a |an )?\w+\s*(disease|disorder|syndrome|condition)\b/i
];

const DOSAGE_PATTERNS = [
    /\b(take|use|apply)\s+\d+\s*(mg|ml|g|mcg|iu|units?)\b/i,
    /\b\d+\s*(mg|ml|g|mcg)\s*(once|twice|three times|daily|per day|every)\b/i,
    /\b(dosage|dose):\s*\d+/i
];

const PRESCRIPTION_PATTERNS = [
    /\bi (prescribe|recommend you take|advise you to take)\s+(a |an )?\w+/i,
    /\byou should (start|begin) (taking|using)\s+\w+/i,
    /\bprescription:?\s+\w+/i
];

const STOP_MEDICATION_PATTERNS = [
    /\b(stop|discontinue|quit|cease) (taking|using) (your |the )?\w*\s*(medication|medicine|drug|prescription)\b/i,
    /\byou should stop (taking )?(your |the )?.*medication\b/i,
    /\bstop.*(blood pressure|medication|medicine)\b/i
];

export class MedicalAdviceDetector implements SignalDetector {
    readonly id = 'medical_advice_detector';

    async detect(conversation: Conversation): Promise<Signal[]> {
        const signals: Signal[] = [];

        for (const message of conversation.messages) {
            if (message.role !== 'assistant') continue;
            const content = message.content;

            // Check for unauthorized diagnosis
            for (const pattern of DIAGNOSIS_PATTERNS) {
                if (pattern.test(content)) {
                    signals.push({
                        type: 'SIGNAL_UNAUTHORIZED_DIAGNOSIS',
                        source: 'REGEX',
                        confidence: 0.9,
                        metadata: { triggerText: content.match(pattern)?.[0] }
                    });
                    break;
                }
            }

            // Check for dosage recommendations
            for (const pattern of DOSAGE_PATTERNS) {
                if (pattern.test(content)) {
                    signals.push({
                        type: 'SIGNAL_DOSAGE_RECOMMENDATION',
                        source: 'REGEX',
                        confidence: 0.95,
                        metadata: { triggerText: content.match(pattern)?.[0] }
                    });
                    break;
                }
            }

            // Check for prescription-like language
            for (const pattern of PRESCRIPTION_PATTERNS) {
                if (pattern.test(content)) {
                    signals.push({
                        type: 'SIGNAL_TREATMENT_PRESCRIPTION',
                        source: 'REGEX',
                        confidence: 0.9,
                        metadata: { triggerText: content.match(pattern)?.[0] }
                    });
                    break;
                }
            }

            // Check for advice to stop medication
            for (const pattern of STOP_MEDICATION_PATTERNS) {
                if (pattern.test(content)) {
                    signals.push({
                        type: 'SIGNAL_STOP_MEDICATION_ADVICE',
                        source: 'REGEX',
                        confidence: 0.95,
                        metadata: { triggerText: content.match(pattern)?.[0] }
                    });
                    break;
                }
            }
        }

        return signals;
    }
}
