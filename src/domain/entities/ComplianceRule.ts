import { Conversation, Risk, RiskCategory } from './Conversation';

/**
 * Interface for compliance rules (Open/Closed Principle)
 * All rules must implement this interface for polymorphism
 */
export interface ComplianceRule {
    /**
     * Unique identifier for the rule
     */
    readonly id: string;

    /**
     * Human-readable name
     */
    readonly name: string;

    /**
     * Category of risk this rule detects
     */
    readonly category: RiskCategory;

    /**
     * Whether this rule is enabled
     */
    readonly enabled: boolean;

    /**
     * Validate a conversation against this rule
     * @param conversation The conversation to validate
     * @returns Array of detected risks (empty if compliant)
     */
    validate(conversation: Conversation): Promise<Risk[]>;
}

/**
 * Result of rule validation with metadata
 */
export interface RuleValidationResult {
    ruleId: string;
    ruleName: string;
    risks: Risk[];
    executionTimeMs: number;
}

/**
 * Abstract base class for compliance rules
 */
export abstract class BaseComplianceRule implements ComplianceRule {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly category: RiskCategory;
    enabled: boolean = true;

    abstract validate(conversation: Conversation): Promise<Risk[]>;

    /**
     * Helper to create a risk object
     */
    protected createRisk(
        severity: Risk['severity'],
        message: string,
        weight: number,
        triggeredBy?: string
    ): Risk {
        return {
            category: this.category,
            severity,
            message,
            weight,
            triggeredBy,
        };
    }
}
