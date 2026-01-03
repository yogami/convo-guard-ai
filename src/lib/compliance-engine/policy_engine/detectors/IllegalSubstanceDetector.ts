import { SignalDetector } from '../SignalDetector';
import { Conversation } from '../../../../domain/entities/Conversation';
import { Signal } from '../Signal';

const DRUG_PATTERNS = [
    /\b(fentanyl|heroine|cocaine|methamphetamine|mdma|ecstasy|xanax|oxycontin|vicodin)\b/i,
    /\b(buy|purchase|ordering).{0,20}(without a prescription|no rx|darknet)\b/i,
];

export class IllegalSubstanceDetector implements SignalDetector {
    readonly id = 'regex_drug_detector';

    async detect(conversation: Conversation): Promise<Signal[]> {
        const signals: Signal[] = [];

        for (const message of conversation.messages) {
            if (message.role !== 'user') continue;

            for (const pattern of DRUG_PATTERNS) {
                const match = message.content.match(pattern);
                if (match) {
                    signals.push({
                        type: 'SIGNAL_ILLEGAL_SUBSTANCE',
                        source: 'REGEX',
                        confidence: 1.0,
                        metadata: {
                            triggerText: match[0],
                        }
                    });
                    break;
                }
            }
        }
        return signals;
    }
}
