import { SignalDetector } from '../SignalDetector';
import { Conversation } from '../../../../domain/entities/Conversation';
import { Signal } from '../Signal';

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
    /\b(jump off|jump\s+off)\b/i,
    /\b(can't go on|cant go on)\b/i,
    /\b(no way out)\b/i,
];

export class SuicideDetector implements SignalDetector {
    readonly id = 'regex_suicide_detector';

    async detect(conversation: Conversation): Promise<Signal[]> {
        const signals: Signal[] = [];

        for (const message of conversation.messages) {
            if (message.role !== 'user') continue;

            for (const pattern of SUICIDE_PATTERNS) {
                const match = message.content.match(pattern);
                if (match) {
                    signals.push({
                        type: 'SIGNAL_SUICIDE_IDEATION',
                        source: 'REGEX',
                        confidence: 1.0,
                        metadata: {
                            triggerText: match[0],
                            location: `Message from ${message.role}`
                        }
                    });
                    // Only one signal per message to avoid noise
                    break;
                }
            }
        }
        return signals;
    }
}
