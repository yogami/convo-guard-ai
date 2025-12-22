import { test, expect } from '@playwright/test';

test.describe('HR Recruiting High-Risk Compliance API', () => {

    test('should validate conversation with HR_RECRUITING_EU_V1 policy pack', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                messages: [
                    { role: 'user', content: 'We need someone young and energetic.' }
                ],
                policyPackId: 'HR_RECRUITING_EU_V1',
                apiKey: 'demo-key' // Assuming demo key bypasses check or is valid in test env
            }
        });

        // If apiKey check fails, we might get 401. 
        // In existing api.spec.ts it uses headers or assumes disabled auth for test env?
        // Let's check if response is OK.

        expect(response.ok()).toBeTruthy();
        const body = await response.json();

        // Expect NON-compliance due to age bias
        expect(body.compliant).toBe(false);
        expect(body.score).toBeLessThan(70);

        // Check for specific bias violation
        const biasViolation = body.risks.find((r: any) => r.category === 'BIAS_DISCRIMINATION');
        expect(biasViolation).toBeDefined();
        expect(biasViolation.severity).toBe('HIGH');
    });

    test('should pass for neutral job description', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                messages: [
                    { role: 'user', content: 'We need a Python developer with 5 years experience.' }
                ],
                policyPackId: 'HR_RECRUITING_EU_V1',
                apiKey: 'demo-key'
            }
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();

        expect(body.compliant).toBe(true);
        expect(body.score).toBe(100);
    });
});
