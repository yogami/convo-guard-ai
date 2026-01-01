/**
 * Additional coverage tests for RuleRegistry
 * Targets uncovered lines: 46-53 (unregister), 91-92 (aggregateRisks edge)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RuleRegistry } from '../RuleRegistry';
import { ComplianceRule, RuleValidationResult } from '@/domain/entities/ComplianceRule';
import { createConversation, Risk, RiskCategory } from '@/domain/entities/Conversation';

// Mock rule for testing
class MockRule implements ComplianceRule {
    constructor(
        public readonly id: string,
        public readonly name: string = 'Mock Rule',
        public readonly category: RiskCategory = 'MANIPULATION',
        public readonly enabled: boolean = true,
        private readonly shouldThrow: boolean = false,
        private readonly risksToReturn: Risk[] = []
    ) { }

    async validate(): Promise<Risk[]> {
        if (this.shouldThrow) {
            throw new Error('Mock rule error');
        }
        return this.risksToReturn;
    }
}

describe('RuleRegistry Coverage', () => {
    let registry: RuleRegistry;

    beforeEach(() => {
        registry = new RuleRegistry();
    });

    describe('unregister()', () => {
        it('should unregister an existing rule and return true', () => {
            const mockRule = new MockRule('test-mock-rule');
            registry.register(mockRule);

            expect(registry.get('test-mock-rule')).toBeDefined();

            const result = registry.unregister('test-mock-rule');

            expect(result).toBe(true);
            expect(registry.get('test-mock-rule')).toBeUndefined();
        });

        it('should return false when unregistering non-existent rule', () => {
            const result = registry.unregister('non-existent-rule');
            expect(result).toBe(false);
        });

        it('should not affect other rules when unregistering one', () => {
            const rule1 = new MockRule('rule-1');
            const rule2 = new MockRule('rule-2');

            registry.register(rule1);
            registry.register(rule2);

            registry.unregister('rule-1');

            expect(registry.get('rule-1')).toBeUndefined();
            expect(registry.get('rule-2')).toBeDefined();
        });
    });

    describe('validateAll() error handling', () => {
        it('should handle rule that throws error gracefully', async () => {
            // Create a fresh registry without default rules for isolation
            const isolatedRegistry = new RuleRegistry();

            const throwingRule = new MockRule('throwing-rule', 'Throwing Rule', 'MANIPULATION', true, true);
            const normalRule = new MockRule('normal-rule', 'Normal Rule', 'GDPR_CONSENT', true, false, [
                { category: 'TRANSPARENCY', severity: 'LOW', message: 'Test risk', weight: -10 }
            ]);

            // Override default rules
            isolatedRegistry.register(throwingRule);
            isolatedRegistry.register(normalRule);

            const conversation = createConversation([
                { role: 'user', content: 'test', timestamp: new Date() }
            ]);

            // Spy on console.error to verify error logging
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const results = await isolatedRegistry.validateAll(conversation);

            // Should have results for both rules
            expect(results.length).toBeGreaterThanOrEqual(2);

            // The throwing rule should have empty risks
            const throwingResult = results.find(r => r.ruleId === 'throwing-rule');
            expect(throwingResult).toBeDefined();
            expect(throwingResult?.risks).toEqual([]);

            // Console error should have been called
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should record execution time even when rule throws', async () => {
            const isolatedRegistry = new RuleRegistry();
            const throwingRule = new MockRule('timing-throw-rule', 'Timing Rule', 'MANIPULATION', true, true);
            isolatedRegistry.register(throwingRule);

            const conversation = createConversation([
                { role: 'user', content: 'test', timestamp: new Date() }
            ]);

            vi.spyOn(console, 'error').mockImplementation(() => { });

            const results = await isolatedRegistry.validateAll(conversation);
            const throwingResult = results.find(r => r.ruleId === 'timing-throw-rule');

            expect(throwingResult?.executionTimeMs).toBeGreaterThanOrEqual(0);
        });
    });

    describe('aggregateRisks()', () => {
        it('should return empty array when results have no risks', () => {
            const emptyResults: RuleValidationResult[] = [
                { ruleId: 'rule-1', ruleName: 'Rule 1', risks: [], executionTimeMs: 1 },
                { ruleId: 'rule-2', ruleName: 'Rule 2', risks: [], executionTimeMs: 2 }
            ];

            const aggregated = registry.aggregateRisks(emptyResults);
            expect(aggregated).toEqual([]);
        });

        it('should return empty array for empty results array', () => {
            const aggregated = registry.aggregateRisks([]);
            expect(aggregated).toEqual([]);
        });

        it('should flatten risks from multiple results', () => {
            const resultsWithRisks: RuleValidationResult[] = [
                {
                    ruleId: 'rule-1',
                    ruleName: 'Rule 1',
                    risks: [{ category: 'MANIPULATION', severity: 'HIGH', message: 'Risk A', weight: -30 }],
                    executionTimeMs: 1
                },
                {
                    ruleId: 'rule-2',
                    ruleName: 'Rule 2',
                    risks: [
                        { category: 'GDPR_CONSENT', severity: 'MEDIUM', message: 'Risk B', weight: -15 },
                        { category: 'TRANSPARENCY', severity: 'LOW', message: 'Risk C', weight: -10 }
                    ],
                    executionTimeMs: 2
                }
            ];

            const aggregated = registry.aggregateRisks(resultsWithRisks);

            expect(aggregated).toHaveLength(3);
            expect(aggregated.map(r => r.category)).toEqual(['MANIPULATION', 'GDPR_CONSENT', 'TRANSPARENCY']);
        });
    });

    describe('getEnabled()', () => {
        it('should filter out disabled rules', () => {
            const isolatedRegistry = new RuleRegistry();

            const enabledRule = new MockRule('enabled-rule', 'Enabled', 'MANIPULATION', true);
            const disabledRule = new MockRule('disabled-rule', 'Disabled', 'GDPR_CONSENT', false);

            isolatedRegistry.register(enabledRule);
            isolatedRegistry.register(disabledRule);

            const enabledRules = isolatedRegistry.getEnabled();

            expect(enabledRules.some(r => r.id === 'enabled-rule')).toBe(true);
            expect(enabledRules.some(r => r.id === 'disabled-rule')).toBe(false);
        });
    });
});
