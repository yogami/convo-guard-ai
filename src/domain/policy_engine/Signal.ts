/**
 * A Signal is a neutral observation extracted from the conversation.
 * It does NOT imply a violation by itself.
 */
export interface Signal {
    type: string; // e.g. "SUICIDE_IDEATION_DETECTED"
    source: 'REGEX' | 'LLM' | 'KEYWORD';
    confidence: number; // 0.0 - 1.0
    metadata?: {
        triggerText?: string;
        location?: string;
        context?: string;
    };
}

/**
 * Definition of a Signal Detector configuration.
 * This instructs the engine HOW to look for signals.
 */
export interface SignalDetectorConfig {
    id: string;
    type: 'REGEX' | 'LLM' | 'KEYWORD';
    signals: string[]; // Signals this detector can produce
    config: {
        patterns?: string[]; // For Regex
        promptDescription?: string; // For LLM
    };
}
