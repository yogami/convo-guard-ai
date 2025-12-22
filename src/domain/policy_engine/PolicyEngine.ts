
import { Conversation, createValidationResult, Risk } from '../entities/Conversation';
import { PolicyPack, PolicyViolation } from './Policy';
import { Signal } from './Signal';
import { POLICY_PACKS } from './registries/PolicyPackRegistry';

export class PolicyEngine {

    async evaluate(conversation: Conversation, policyPackId: string = 'MENTAL_HEALTH_EU_V1'): Promise<{
        compliant: boolean;
        score: number;
        violations: PolicyViolation[];
        signals: Signal[];
        auditId: string;
    }> {
        const pack = POLICY_PACKS[policyPackId];
        if (!pack) {
            throw new Error(`Policy Pack '${policyPackId}' not found.`);
        }

        // 1. Run Detectors
        const signals: Signal[] = [];
        const detectorPromises = pack.detectors.map(d => d.detect(conversation));
        const detectorResults = await Promise.all(detectorPromises);

        detectorResults.forEach(res => signals.push(...res));

        // 2. Evaluate Rules against Signals
        const violations: PolicyViolation[] = [];

        for (const rule of pack.rules) {
            // Find matching signals
            const matches = signals.filter(s =>
                s.type === rule.targetSignal && s.confidence >= rule.minConfidence
            );

            for (const signal of matches) {
                violations.push({
                    ruleId: rule.id,
                    category: rule.category,
                    regulationIds: rule.regulationIds,
                    severity: rule.severity,
                    scoreImpact: rule.weight,
                    message: rule.messageTemplate, // In real app, might template interpolate signal metadata
                    triggerSignal: signal
                });
            }
        }

        // 3. Deduplicate Violations
        // (Similar logic to existing)
        const uniqueViolations = this.deduplicateViolations(violations);

        // 4. Calculate Score
        let score = 100;
        let isCompliant = true;

        for (const v of uniqueViolations) {
            score += v.scoreImpact; // weight is negative
            if (v.severity === 'HIGH') {
                isCompliant = false;
            }
        }

        if (score < 70) isCompliant = false;

        return {
            compliant: isCompliant,
            score: Math.max(0, score),
            violations: uniqueViolations,
            signals: signals,
            auditId: crypto.randomUUID()
        };
    }

    private deduplicateViolations(violations: PolicyViolation[]): PolicyViolation[] {
        const map = new Map<string, PolicyViolation>();
        const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };

        for (const v of violations) {
            // Uniqueness key: Rule ID + Trigger Source? 
            // Or just deduplicate by Rule ID? 
            // Current system deduplicates by Category.
            // Let's deduplicate by Rule ID for now, taking the highest severity/impact one.
            const key = v.ruleId;
            const existing = map.get(key);

            if (!existing || severityOrder[v.severity] > severityOrder[existing.severity]) {
                map.set(key, v);
            }
        }
        return Array.from(map.values());
    }
}

export const policyEngine = new PolicyEngine();
