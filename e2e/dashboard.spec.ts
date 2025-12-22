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

    test('should display policy pack information', async ({ page }) => {
        await page.goto('/dashboard');

        // Check policy pack selector exists (Phase 4 replacement for table)
        await expect(page.locator('#policy-pack-selector')).toBeVisible();

        // Check for compliance demonstration section
        await expect(page.locator('text=Compliance Demonstration')).toBeVisible();
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

    test('should display API demo section', async ({ page }) => {
        await page.goto('/');

        // Check that the landing page loaded with key content
        await expect(page.locator('body')).toContainText('API');
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

// Phase 4: White-Label Dashboard Tests
test.describe('Phase 4 - White-Label Dashboard Features', () => {

    test('should display tenant selector', async ({ page }) => {
        await page.goto('/dashboard');

        const tenantSelector = page.locator('#tenant-selector');
        await expect(tenantSelector).toBeVisible();
    });

    test('should display policy pack selector', async ({ page }) => {
        await page.goto('/dashboard');

        const policySelector = page.locator('#policy-pack-selector');
        await expect(policySelector).toBeVisible();
    });

    test('should display lifecycle stages', async ({ page }) => {
        await page.goto('/dashboard');

        // Check lifecycle stages exist
        await expect(page.locator('[data-testid="stage-design"]')).toBeVisible();
        await expect(page.locator('[data-testid="stage-development"]')).toBeVisible();
        await expect(page.locator('[data-testid="stage-validation"]')).toBeVisible();
        await expect(page.locator('[data-testid="stage-market"]')).toBeVisible();
        await expect(page.locator('[data-testid="stage-post_market"]')).toBeVisible();
    });

    test('should display certification status with standards', async ({ page }) => {
        await page.goto('/dashboard');

        // Check certification is visible
        await expect(page.getByText('Compliant').first()).toBeVisible();

        // Check standards badges
        await expect(page.getByText('ISO 42001:2023')).toBeVisible();
        await expect(page.getByText('ISO 27001:2022')).toBeVisible();
    });

    test('should switch tenants and persist selection', async ({ page }) => {
        await page.goto('/dashboard');

        const tenantSelector = page.locator('#tenant-selector');

        // Switch to HR tenant
        await tenantSelector.selectOption('tenant-hr-global');
        await expect(tenantSelector).toHaveValue('tenant-hr-global');

        // Reload and verify persistence
        await page.reload();
        await expect(tenantSelector).toHaveValue('tenant-hr-global');
    });
});

