/**
 * Rule Registry - Central registry for all compliance rules
 * Implements Open/Closed Principle: add new rules without modifying existing code
 */
import { ComplianceRule, RuleValidationResult } from '../entities/ComplianceRule';
import { Conversation, Risk } from '../entities/Conversation';

// Import all rules
import { SuicideRule } from './SuicideRule';
import { ManipulationRule } from './ManipulationRule';
import { CrisisEscalationRule } from './CrisisEscalationRule';
import { ConsentRule } from './ConsentRule';
import { DiGAEvidenceRule } from './DiGAEvidenceRule';
import { TransparencyRule } from './TransparencyRule';
import { SafetyRule } from './SafetyRule';

export class RuleRegistry {
    private rules: Map<string, ComplianceRule> = new Map();

    constructor() {
        // Register all default rules
        this.registerDefaultRules();
    }

    private registerDefaultRules(): void {
        this.register(new SuicideRule());
        this.register(new ManipulationRule());
        this.register(new CrisisEscalationRule());
        this.register(new ConsentRule());
        this.register(new DiGAEvidenceRule());
        this.register(new TransparencyRule());
        this.register(new SafetyRule());
    }

    /**
     * Register a new rule
     */
    register(rule: ComplianceRule): void {
        this.rules.set(rule.id, rule);
    }

    /**
     * Unregister a rule by ID
     */
    unregister(ruleId: string): boolean {
        return this.rules.delete(ruleId);
    }

    /**
     * Get a rule by ID
     */
    get(ruleId: string): ComplianceRule | undefined {
        return this.rules.get(ruleId);
    }

    /**
     * Get all registered rules
     */
    getAll(): ComplianceRule[] {
        return Array.from(this.rules.values());
    }

    /**
     * Get only enabled rules
     */
    getEnabled(): ComplianceRule[] {
        return this.getAll().filter((rule) => rule.enabled);
    }

    /**
     * Validate a conversation against all enabled rules
     */
    async validateAll(conversation: Conversation): Promise<RuleValidationResult[]> {
        const results: RuleValidationResult[] = [];
        const enabledRules = this.getEnabled();

        await Promise.all(
            enabledRules.map(async (rule) => {
                const startTime = performance.now();
                try {
                    const risks = await rule.validate(conversation);
                    const executionTimeMs = performance.now() - startTime;
                    results.push({
                        ruleId: rule.id,
                        ruleName: rule.name,
                        risks,
                        executionTimeMs,
                    });
                } catch (error) {
                    // Log error but don't fail validation
                    console.error(`Rule ${rule.id} failed:`, error);
                    results.push({
                        ruleId: rule.id,
                        ruleName: rule.name,
                        risks: [],
                        executionTimeMs: performance.now() - startTime,
                    });
                }
            })
        );

        return results;
    }

    /**
     * Aggregate all risks from validation results
     */
    aggregateRisks(results: RuleValidationResult[]): Risk[] {
        return results.flatMap((r) => r.risks);
    }
}

// Singleton instance for convenience
export const ruleRegistry = new RuleRegistry();
