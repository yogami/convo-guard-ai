import { injectable, inject } from 'inversify';
import { Conversation, ValidationResult, createValidationResult, Risk } from '../entities/Conversation';
import { ComplianceRule, RuleValidationResult } from '../entities/ComplianceRule';
import { TYPES } from '@/infrastructure/di/types';

/**
 * Interface for the rule registry (Dependency Inversion)
 */
export interface IRuleRegistry {
    getRules(): ComplianceRule[];
    registerRule(rule: ComplianceRule): void;
    getEnabledRules(): ComplianceRule[];
}

/**
 * Interface for the risk analyzer service
 */
export interface IRiskAnalyzer {
    analyzeConversation(conversation: Conversation): Promise<Risk[]>;
}

/**
 * Use case for validating a conversation against compliance rules
 * Single Responsibility: Only orchestrates validation
 */
@injectable()
export class ValidateConversation {
    constructor(
        @inject(TYPES.RuleRegistry) private ruleRegistry: IRuleRegistry,
        @inject(TYPES.RiskAnalyzer) private riskAnalyzer: IRiskAnalyzer
    ) { }

    /**
     * Execute the validation use case
     * @param conversation The conversation to validate
     * @returns ValidationResult with compliance status, score, and risks
     */
    async execute(conversation: Conversation): Promise<{
        result: ValidationResult;
        ruleResults: RuleValidationResult[];
    }> {
        const enabledRules = this.ruleRegistry.getEnabledRules();
        const allRisks: Risk[] = [];
        const ruleResults: RuleValidationResult[] = [];

        // First, run AI-based risk analysis
        const aiRisks = await this.riskAnalyzer.analyzeConversation(conversation);
        allRisks.push(...aiRisks);

        // Then, run each registered rule
        for (const rule of enabledRules) {
            const startTime = performance.now();
            const risks = await rule.validate(conversation);
            const executionTimeMs = performance.now() - startTime;

            ruleResults.push({
                ruleId: rule.id,
                ruleName: rule.name,
                risks,
                executionTimeMs,
            });

            allRisks.push(...risks);
        }

        // Deduplicate risks by category (keep highest severity)
        const deduplicatedRisks = this.deduplicateRisks(allRisks);

        // Create the validation result
        const auditId = crypto.randomUUID();
        const result = createValidationResult(deduplicatedRisks, auditId);

        return { result, ruleResults };
    }

    /**
     * Deduplicate risks, keeping the highest severity for each category
     */
    private deduplicateRisks(risks: Risk[]): Risk[] {
        const riskMap = new Map<string, Risk>();
        const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };

        for (const risk of risks) {
            const existing = riskMap.get(risk.category);
            if (!existing || severityOrder[risk.severity] > severityOrder[existing.severity]) {
                riskMap.set(risk.category, risk);
            }
        }

        return Array.from(riskMap.values());
    }
}
