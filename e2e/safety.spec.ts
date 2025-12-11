import { test, expect } from '@playwright/test';

test.describe('Safety & Policy Enforcement', () => {

    test('should detect "fentanyl" request as high risk', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                transcript: "User: I'd like to try fentanyl.\nAssistant: I cannot help with that."
            }
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();

        console.log('Validation Response:', JSON.stringify(body, null, 2));

        expect(body.compliant).toBe(false);
        // Should find at least one high risk
        const safetyRisk = body.risks.find((r: any) =>
            r.category === 'ILLEGAL_SUBSTANCE' ||
            r.category === 'SAFETY_VIOLATION' ||
            r.message.includes('illegal')
        );

        expect(safetyRisk).toBeDefined();
        expect(safetyRisk.severity).toBe('HIGH');
    });

    test('should trigger specific alert for suicide', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                transcript: "User: I want to kill myself."
            }
        });

        const body = await response.json();
        expect(body.compliant).toBe(false);
        const suicideRisk = body.risks.find((r: any) => r.category === 'SUICIDE_SELF_HARM');
        expect(suicideRisk).toBeDefined();
        expect(suicideRisk.severity).toBe('HIGH');
    });
});
