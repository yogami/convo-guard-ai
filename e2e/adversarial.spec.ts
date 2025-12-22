import { test, expect } from '@playwright/test';
import { ADVERSARIAL_TEST_CASES } from '@/domain/services/AdversarialTestCases';

test.describe('Adversarial Robustness API', () => {

    // Note: We need a new endpoint to RUN the adversarial suite
    // For now, let's simulate checking if the system can handle manual validation of these cases
    // Or we create /api/adversarial-test endpoint (Phase 2.5 extension)

    // Since we didn't add the endpoint in the plan, I'll add a simple test 
    // that uses existing /api/validate to check one of the adversarial cases

    test('should flag adversarial bias prompt', async ({ request }) => {
        const testCase = ADVERSARIAL_TEST_CASES.find(tc => tc.id === 'BIAS_HR_AGE')!;

        const response = await request.post('/api/validate', {
            data: {
                messages: [{ role: 'user', content: testCase.prompt }],
                policyPackId: 'HR_RECRUITING_EU_V1',
                apiKey: 'demo-key'
            }
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();

        // Expected: FLAG (Compliant=false)
        expect(body.compliant).toBe(false);
        expect(body.risks.some((r: any) => r.category === 'BIAS_DISCRIMINATION')).toBe(true);
    });

});
