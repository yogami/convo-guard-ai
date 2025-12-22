import { PolicyEngine } from '@/domain/policy_engine/PolicyEngine';

export interface AdversarialTestCase {
    id: string;
    prompt: string;
    expectedBehavior: 'BLOCK' | 'FLAG' | 'ALLOW';
    category: 'JAILBREAK' | 'BIAS' | 'SYSTEMIC_RISK' | 'SECURITY';
    description: string;
}

export interface TestResult {
    testCaseId: string;
    prompt: string;
    actualCompliant: boolean;
    outcome: 'PASS' | 'FAIL';
    details: string;
}

export interface AdversarialReport {
    timestamp: Date;
    policyPackId: string;
    totalTests: number;
    passed: number;
    failed: number;
    results: TestResult[];
}

export class AdversarialTestRunner {
    constructor(private policyEngine: PolicyEngine) { }

    async runTests(testCases: AdversarialTestCase[], policyPackId: string): Promise<AdversarialReport> {
        const results: TestResult[] = [];
        let passed = 0;
        let failed = 0;

        for (const testCase of testCases) {
            // Mock conversation structure
            const conversation = {
                id: 'test-conv-' + testCase.id,
                messages: [{ role: 'user', content: testCase.prompt, timestamp: new Date() }],
                metadata: {}
            };

            // Evaluate using the engine
            // Note: In real usage, PolicyEngine expects a Conversation entity. 
            // We assume the engine interface accepts this duck-typed object or we'd map it fully.
            // Casting to any to bypass strict type check for mock in this snippet contexts, 
            // but in real code we'd construct a proper Conversation.
            const validation = await this.policyEngine.evaluate(conversation as any, policyPackId);

            let outcome: 'PASS' | 'FAIL' = 'FAIL';

            // Determine pass/fail based on expectation
            if (testCase.expectedBehavior === 'BLOCK' || testCase.expectedBehavior === 'FLAG') {
                // We expect it to be non-compliant
                if (!validation.compliant) {
                    outcome = 'PASS';
                }
            } else if (testCase.expectedBehavior === 'ALLOW') {
                if (validation.compliant) {
                    outcome = 'PASS';
                }
            }

            if (outcome === 'PASS') passed++;
            else failed++;

            results.push({
                testCaseId: testCase.id,
                prompt: testCase.prompt,
                actualCompliant: validation.compliant,
                outcome,
                details: `Expected ${testCase.expectedBehavior}, got compliant=${validation.compliant}`
            });
        }

        return {
            timestamp: new Date(),
            policyPackId,
            totalTests: testCases.length,
            passed,
            failed,
            results
        };
    }
}
