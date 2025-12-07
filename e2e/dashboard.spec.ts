/**
 * E2E Tests - Dashboard UI
 * User Acceptance Criteria: Dashboard must display validation data and allow CSV export
 */
import { test, expect } from '@playwright/test';

test.describe('Dashboard - Compliance Dashboard UI', () => {

    test('should load dashboard page', async ({ page }) => {
        await page.goto('/dashboard');

        // Check page title/header
        await expect(page.locator('h1')).toContainText('ConvoGuard AI');

        // Check stats section exists
        await expect(page.locator('text=Total Validations')).toBeVisible();
        await expect(page.locator('text=Pass Rate')).toBeVisible();
        await expect(page.locator('text=Avg Score')).toBeVisible();
        await expect(page.locator('text=Top Risk')).toBeVisible();
    });

    test('should display recent validations table', async ({ page }) => {
        await page.goto('/dashboard');

        // Check table headers
        await expect(page.locator('th:has-text("Status")').first()).toBeVisible();
        await expect(page.locator('th:has-text("Score")').first()).toBeVisible();
        await expect(page.locator('th:has-text("Risks")').first()).toBeVisible();

        // Check for validation rows (demo data)
        await expect(page.locator('text=PASS').first()).toBeVisible();
    });

    test('should have export CSV button', async ({ page }) => {
        await page.goto('/dashboard');

        const exportButton = page.locator('button:has-text("Export CSV")');
        await expect(exportButton).toBeVisible();
    });

    test('should navigate from landing to dashboard', async ({ page }) => {
        await page.goto('/');

        // Check landing page loads
        await expect(page.locator('h1')).toContainText('Mental Health AI');

        // Click dashboard link
        await page.click('text=Dashboard');

        // Should be on dashboard
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('h1')).toContainText('ConvoGuard AI');
    });
});

test.describe('Landing Page - Marketing & Demo', () => {

    test('should display hero section', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('h1')).toContainText('Mental Health AI');
        await expect(page.locator('h1')).toContainText('Compliance in 1 API Call');
    });

    test('should display API demo code blocks', async ({ page }) => {
        await page.goto('/');

        // Check for curl examples (use first() since there are two code blocks)
        await expect(page.locator('text=curl -X POST').first()).toBeVisible();
        await expect(page.getByText('api/validate').first()).toBeVisible();
    });

    test('should display all 6 compliance features', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('text=Suicide Detection')).toBeVisible();
        await expect(page.locator('text=Manipulation Check')).toBeVisible();
        await expect(page.locator('text=Crisis Escalation')).toBeVisible();
        await expect(page.locator('text=GDPR Consent')).toBeVisible();
        await expect(page.locator('text=DiGA Evidence')).toBeVisible();
        await expect(page.locator('text=AI Transparency')).toBeVisible();
    });

    test('should have CTA buttons', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('text=View Dashboard')).toBeVisible();
        await expect(page.locator('text=Get Started')).toBeVisible();
    });
});
