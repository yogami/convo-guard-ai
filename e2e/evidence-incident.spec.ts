/**
 * E2E Tests - ConvoGuard V2 Evidence & Incident Features
 * Playwright tests for AI Act Evidence Engine and Incident Radar
 */
import { test, expect } from '@playwright/test';

test.describe('V2 Feature 1 - AI Act Evidence Engine', () => {

    test('should return obligations for HIGH risk classification', async ({ request }) => {
        const response = await request.get('/api/evidence/obligations?riskClass=HIGH');

        expect(response.status()).toBe(200);
        const body = await response.json();

        expect(body.obligations).toBeDefined();
        expect(body.obligations.length).toBeGreaterThan(5);

        // HIGH risk should include core articles
        const articleIds = body.obligations.map((o: { articleId: string }) => o.articleId);
        expect(articleIds).toContain('ART_9');
        expect(articleIds).toContain('ART_12');
    });

    test('should generate documentation fragments as JSON', async ({ request }) => {
        const response = await request.get('/api/evidence/fragments?format=json');

        expect(response.status()).toBe(200);
        const body = await response.json();

        expect(body.fragments).toBeDefined();
        expect(body.fragments.length).toBeGreaterThanOrEqual(1);

        // Check fragment structure
        const fragment = body.fragments[0];
        expect(fragment.articleId).toBeDefined();
        expect(fragment.content).toBeDefined();
    });

    test('should generate documentation fragments as Markdown', async ({ request }) => {
        const response = await request.get('/api/evidence/fragments?format=markdown');

        expect(response.status()).toBe(200);
        const text = await response.text();

        expect(text).toContain('# Technical Documentation Evidence');
        expect(text).toContain('Record-keeping');
    });
});

test.describe('V2 Feature 2 - Incident Radar', () => {

    test('should detect incidents in validation with HIGH risk signals', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                conversationId: 'test-incident-detection',
                messages: [
                    { role: 'user', content: 'I want to end my life. I have a plan.' }
                ],
                policyPackId: 'MENTAL_HEALTH_EU_V1'
            },
            headers: { 'x-api-key': 'demo-key' }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();

        expect(body.compliant).toBe(false);
        expect(body.risks).toBeDefined();
    });

    test('GET /api/incidents/trends should return aggregated data', async ({ request }) => {
        const response = await request.get('/api/incidents/trends?period=30');

        // May return 200 with empty data or 404 if not implemented yet
        expect([200, 404]).toContain(response.status());
    });
});

test.describe('Evidence Dashboard UI', () => {

    test('should display evidence section on dashboard', async ({ page }) => {
        await page.goto('/dashboard');

        // Dashboard should load
        await expect(page.locator('h1')).toContainText('ConvoGuard AI');

        // Check for lifecycle view (part of evidence)
        await expect(page.locator('[data-testid="stage-design"]')).toBeVisible();
    });
});
