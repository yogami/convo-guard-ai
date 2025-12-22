import { test, expect } from '@playwright/test';

test.describe('Transparency Logs API', () => {

    test('should create and retrieve a transparency log', async ({ request }) => {
        const systemId = 'test-hr-bot-' + Date.now();

        // 1. Create Log
        const postResponse = await request.post('/api/transparency-logs', {
            data: {
                systemId: systemId,
                decisionType: 'SCREENING',
                inputSummary: 'Candidate application text...',
                outputDecision: 'Passed screening',
                explanationProvided: true,
                humanOversight: false,
                auditTrail: ['step1', 'step2'],
                regulationReferences: ['EU_AI_ACT_ART_13']
            }
        });

        expect(postResponse.ok()).toBeTruthy();
        const postBody = await postResponse.json();
        expect(postBody.success).toBe(true);
        expect(postBody.id).toBeDefined();

        // 2. Retrieve Log
        const getResponse = await request.get(`/api/transparency-logs?systemId=${systemId}`);
        expect(getResponse.ok()).toBeTruthy();

        const getBody = await getResponse.json();
        expect(getBody.logs).toBeDefined();
        expect(getBody.logs.length).toBeGreaterThan(0);

        const log = getBody.logs[0];
        expect(log.systemId).toBe(systemId);
        expect(log.decisionType).toBe('SCREENING');
        expect(log.regulationReferences).toContain('EU_AI_ACT_ART_13');
    });

    test('should validate missing fields', async ({ request }) => {
        const response = await request.post('/api/transparency-logs', {
            data: {
                systemId: 'incomplete-log'
                // missing decisionType
            }
        });
        expect(response.status()).toBe(400);
    });
});
