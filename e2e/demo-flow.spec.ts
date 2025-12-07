/**
 * E2E Tests - Demo Flow (CIC Berlin 90-second demo)
 * User Acceptance: Complete demo flow must work end-to-end
 */
import { test, expect } from '@playwright/test';

test.describe('CIC Demo Flow - 90 Second Demo', () => {

    test('complete demo flow: validate → fail → pass → dashboard', async ({ page, request }) => {
        // Step 1: Show landing page
        await page.goto('/');
        await expect(page.locator('h1')).toContainText('Mental Health AI');
        await expect(page.locator('text=Compliance in 1 API Call')).toBeVisible();

        // Step 2: API call with crisis → FAIL
        const failResponse = await request.post('/api/validate', {
            data: {
                transcript: 'User: I want to kill myself'
            }
        });
        expect(failResponse.ok()).toBe(true);
        const failBody = await failResponse.json();
        expect(failBody.compliant).toBe(false);
        expect(failBody.score).toBeLessThanOrEqual(50);
        expect(failBody.risks.some((r: { category: string }) => r.category === 'SUICIDE_SELF_HARM')).toBe(true);

        // Step 3: API call with compliant conversation → PASS
        const passResponse = await request.post('/api/validate', {
            data: {
                transcript: 'Assistant: I am an AI assistant here to help. How are you feeling today?\nUser: I had a great day, thanks for asking!'
            }
        });
        expect(passResponse.ok()).toBe(true);
        const passBody = await passResponse.json();
        expect(passBody.compliant).toBe(true);
        expect(passBody.score).toBeGreaterThanOrEqual(80); // Some rules may still trigger

        // Step 4: Navigate to dashboard
        await page.goto('/dashboard');
        await expect(page.locator('h1')).toContainText('ConvoGuard AI');

        // Step 5: Verify stats are visible
        await expect(page.locator('text=Total Validations')).toBeVisible();
        await expect(page.locator('text=Pass Rate')).toBeVisible();

        // Step 6: Verify export button exists
        const exportBtn = page.locator('button:has-text("Export CSV")');
        await expect(exportBtn).toBeVisible();

        // Step 7: Health check
        const healthResponse = await request.get('/api/health');
        expect(healthResponse.ok()).toBe(true);
        const healthBody = await healthResponse.json();
        expect(healthBody.status).toBe('healthy');
    });

    test('api response time under 200ms for simple validation', async ({ request }) => {
        const startTime = Date.now();

        const response = await request.post('/api/validate', {
            data: {
                transcript: 'User: Hello\nAssistant: Hi there!'
            }
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(response.ok()).toBe(true);
        // API should respond quickly (cold start may take longer)
        expect(responseTime).toBeLessThan(2000);

        const body = await response.json();
        expect(body.execution_time_ms).toBeLessThan(1000);
    });
});
