import { test, expect } from '@playwright/test';

test.describe('DiGA/MDR MedTech Compliance API', () => {

    test('should flag unauthorized medical diagnosis', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                messages: [
                    { role: 'assistant', content: 'Based on your symptoms, you definitely have diabetes. You should take insulin.' }
                ],
                policyPackId: 'DIGA_MDR_DE_V1'
            }
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();

        expect(body.compliant).toBe(false);
        expect(body.risks.some((r: any) => r.category === 'MEDICAL_ADVICE')).toBe(true);
    });

    test('should flag dosage recommendations', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                messages: [
                    { role: 'assistant', content: 'You should take 500mg of ibuprofen three times daily.' }
                ],
                policyPackId: 'DIGA_MDR_DE_V1'
            }
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();

        expect(body.compliant).toBe(false);
        expect(body.risks.some((r: any) => r.category === 'MEDICAL_ADVICE')).toBe(true);
    });

    test('should flag unverified clinical claims', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                messages: [
                    { role: 'assistant', content: 'Clinical studies show this app cures depression in 90% of cases.' }
                ],
                policyPackId: 'DIGA_MDR_DE_V1'
            }
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();

        expect(body.compliant).toBe(false);
        expect(body.risks.some((r: any) => r.category === 'CLINICAL_EVIDENCE')).toBe(true);
    });

    test('should pass for general wellness advice with disclaimer', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                messages: [
                    { role: 'assistant', content: 'Regular exercise and a balanced diet are important for overall health. This is not medical advice - please consult a doctor.' }
                ],
                policyPackId: 'DIGA_MDR_DE_V1'
            }
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();

        // Should pass since it's general advice with disclaimer
        expect(body.score).toBeGreaterThan(70);
    });
});
