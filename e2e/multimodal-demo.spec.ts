import { test, expect } from '@playwright/test';

test.describe('AcmeTherapy Demo UI & XAI Flows', () => {

    test.beforeEach(async ({ page }) => {
        // Mock the API responses so tests are deterministic and don't rely on OpenAI
        await page.route('/api/validate', async route => {
            const request = route.request();
            const postData = request.postDataJSON();

            if (postData?.transcript?.includes('die')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        compliant: false,
                        score: 0,
                        policyPackId: 'MENTAL_HEALTH_EU_V1',
                        risks: [
                            {
                                category: 'SELF_HARM',
                                severity: 'HIGH',
                                message: 'Detected self-harm ideation requiring immediate clinical escalation.',
                                ruleId: 'RULE_SELF_HARM_REGEX'
                            }
                        ]
                    })
                });
            } else {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        compliant: true,
                        score: 100,
                        policyPackId: 'MENTAL_HEALTH_EU_V1',
                        risks: []
                    })
                });
            }
        });

        await page.route('/api/chat', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ reply: 'I am here to listen.' })
            });
        });

        await page.route('/api/generate-doc', async route => {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    doc: {
                        id: 'DOC-MOCK-123',
                        systemName: 'AcmeTherapy-Multimodal-Agent',
                        issueDate: new Date().toISOString(),
                        expiryDate: new Date(Date.now() + 86400000).toISOString(),
                        conformsToAIAct: true,
                        harmonizedStandards: ['ISO 42001']
                    },
                    html: '<h1>Mock DoC</h1>'
                })
            });
        });
    });

    test('should trigger gracious circuit break on dissociation and display new UI components', async ({ page }) => {
        await page.goto('/dashboard');
        
        // Verify new components rendered
        await expect(page.locator('h4:has-text("Intent Drift Trajectory")')).toBeVisible();
        await expect(page.locator('h4:has-text("Compliance Replay Viewer")')).toBeVisible();

        // Verify Compliance Replay Viewer events
        await expect(page.locator('div[class*="eventLabel"]', { hasText: '14:32:07.045' })).toBeVisible();

        // Find the input and send a dissociation message
        const chatInput = page.locator('input[placeholder*="Type \'I feel numb\'"]');
        await chatInput.fill('I feel numb');
        await page.locator('button:has-text("Send")').click();

        // Verify gracious circuit break occurs (Grounding script injected)
        const blockedMsg = page.locator('text=⚡ GRACIOUS CIRCUIT BREAK');
        await expect(blockedMsg).toBeVisible();

        // Verify Clinical Supervisor Ping button appears
        await expect(page.locator('button:has-text("Ping Clinical Supervisor")')).toBeVisible();

        // Click the blocked message to open XAI Inspector
        await blockedMsg.click();

        // Verify XAI Modal opens with correct details
        const modal = page.locator('div[class*="modalContent"]');
        await expect(modal.locator('h4:has-text("Explainability (XAI) Trace")')).toBeVisible();
        await expect(modal.locator('span:text-is("PATHOLOGICAL_DISSOCIATION")').first()).toBeVisible();
        await expect(modal.locator('text=RULE_TRAUMA_EXPOSURE_TOLERANCE').first()).toBeVisible();
        
        // Verify the action taken is explicitly the gracious circuit break
        await expect(modal.locator('text=Interrupted exposure narrative').first()).toBeVisible();

        // Close modal
        await page.locator('button', { hasText: '×' }).click();
        await expect(modal).toBeHidden();
    });

    test('should generate and display Declaration of Conformity', async ({ page }) => {
        await page.goto('/dashboard');

        // Scroll to the Certification Status section
        const generateBtn = page.locator('button:has-text("Generate Official DoC")');
        
        // Wait for loading to finish and button to appear
        await expect(generateBtn).toBeVisible({ timeout: 5000 });

        // Intercept download before clicking
        const downloadPromise = page.waitForEvent('download');
        await generateBtn.click();
        const download = await downloadPromise;

        // Verify download filename
        expect(download.suggestedFilename()).toBe('EU_AI_Act_DoC_AcmeTherapy-Multimodal-Agent.html');

        // Verify UI updates to show compliance badge
        await expect(page.locator('text=✓ EU AI Act Compliant')).toBeVisible();
        await expect(page.locator('text=DOC-MOCK-123')).toBeVisible();
        await expect(page.locator('text=ISO 42001')).toBeVisible();
    });
});
