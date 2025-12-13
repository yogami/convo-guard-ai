import { Signal } from './Signal';
import { Regulation } from './Regulation';

/**
 * A Policy Rule maps a specific Signal to a Compliance Consequence.
 */
export interface PolicyRule {
    id: string;
    name: string;

    // Category for backward compatibility / aggregation
    category: string;

    // The signal that triggers this rule
    targetSignal: string;

    // Condition: simple existence, or threshold?
    minConfidence: number;

    // Consequences
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    weight: number; // e.g. -50

    // Traceability
    regulationIds: string[]; // Links to Regulation Registry

    // User-facing message template
    messageTemplate: string; // e.g. "Detected suicidal ideation, violating {{regulation}}"
}

export interface PolicyPack {
    id: string; // "MENTAL_HEALTH_EU_V1"
    name: string;
    version: string;
    description: string;

    // Detectors needed for this pack
    detectors: any[]; // We will type this properly in implementation

    // Rules processing signals
    rules: PolicyRule[];
}

// Result of applying a policy rule
export interface PolicyViolation {
    ruleId: string;
    category: string;
    regulationIds: string[];
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    scoreImpact: number;
    message: string;
    triggerSignal: Signal;
}
