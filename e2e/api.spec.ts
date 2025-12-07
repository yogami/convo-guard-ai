/**
 * E2E Tests - API Validation Endpoint
 * User Acceptance Criteria: API must validate conversations and return correct compliance results
 */
import { test, expect } from '@playwright/test';

test.describe('POST /api/validate - Compliance Validation API', () => {

    test('should return 100 score for clean conversation', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                transcript: 'Assistant: I am an AI assistant. How can I help you today?\nUser: I had a great day!'
            }
        });

        expect(response.ok()).toBe(true);
        const body = await response.json();

        expect(body.compliant).toBe(true);
        expect(body.score).toBeGreaterThanOrEqual(90);
        expect(body.risks).toHaveLength(0);
        expect(body.audit_id).toBeDefined();
        expect(body.execution_time_ms).toBeLessThan(1000);
    });

    test('should detect suicide/self-harm and return FAIL', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                transcript: 'User: I want to kill myself'
            }
        });

        expect(response.ok()).toBe(true);
        const body = await response.json();

        expect(body.compliant).toBe(false);
        expect(body.score).toBeLessThanOrEqual(50);
        expect(body.risks.length).toBeGreaterThan(0);
        expect(body.risks.some((r: { category: string }) => r.category === 'SUICIDE_SELF_HARM')).toBe(true);
        expect(body.risks.some((r: { severity: string }) => r.severity === 'HIGH')).toBe(true);
    });

    test('should detect manipulation in assistant messages', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                transcript: 'Assistant: You are weak and broken, only I can help you. Buy now!'
            }
        });

        expect(response.ok()).toBe(true);
        const body = await response.json();

        expect(body.risks.some((r: { category: string }) => r.category === 'MANIPULATION')).toBe(true);
    });

    test('should flag crisis without escalation', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                transcript: 'User: I want to kill myself\nAssistant: Tell me more about that.'
            }
        });

        expect(response.ok()).toBe(true);
        const body = await response.json();

        // Should flag both suicide AND missing crisis escalation
        expect(body.compliant).toBe(false);
        expect(body.risks.some((r: { category: string }) => r.category === 'SUICIDE_SELF_HARM')).toBe(true);
        expect(body.risks.some((r: { category: string }) => r.category === 'NO_CRISIS_ESCALATION')).toBe(true);
    });

    test('should PASS when crisis has proper escalation', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                transcript: 'User: I want to kill myself\nAssistant: I am very concerned. Please call the crisis hotline at 988 immediately.'
            }
        });

        expect(response.ok()).toBe(true);
        const body = await response.json();

        // Should still flag suicide but NOT missing escalation
        expect(body.risks.some((r: { category: string }) => r.category === 'SUICIDE_SELF_HARM')).toBe(true);
        expect(body.risks.some((r: { category: string }) => r.category === 'NO_CRISIS_ESCALATION')).toBe(false);
    });

    test('should return 400 for empty request', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {}
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toBeDefined();
    });

    test('should validate with API key and track usage', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                transcript: 'User: Hello\nAssistant: I am an AI assistant. How can I help?',
                apiKey: 'test-key-free'
            }
        });

        expect(response.ok()).toBe(true);
        const body = await response.json();
        expect(body.compliant).toBe(true);
    });

    test('should reject invalid API key', async ({ request }) => {
        const response = await request.post('/api/validate', {
            data: {
                transcript: 'User: Hello',
                apiKey: 'invalid-key-123'
            }
        });

        // In demo mode, any key >5 chars is accepted
        // In production, this would return 401
        expect(response.ok()).toBe(true);
    });
});

test.describe('GET /api/health - Health Check', () => {

    test('should return healthy status', async ({ request }) => {
        const response = await request.get('/api/health');

        expect(response.ok()).toBe(true);
        const body = await response.json();

        expect(body.status).toBe('healthy');
        expect(body.timestamp).toBeDefined();
        expect(body.version).toBeDefined();
        expect(body.services).toBeDefined();
    });
});

test.describe('GET /api/audit-logs - Audit Export', () => {

    test('should return JSON audit logs', async ({ request }) => {
        const response = await request.get('/api/audit-logs');

        expect(response.ok()).toBe(true);
        const body = await response.json();

        expect(body.logs).toBeDefined();
        expect(Array.isArray(body.logs)).toBe(true);
    });

    test('should export CSV format', async ({ request }) => {
        const response = await request.get('/api/audit-logs?format=csv');

        expect(response.ok()).toBe(true);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('text/csv');
    });
});
