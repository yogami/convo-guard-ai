/**
 * Integration tests for Guardian API endpoints
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// These tests require the Next.js dev server running
// Run with: npm run test:integration

const BASE_URL = process.env.GUARDIAN_TEST_URL || 'http://localhost:3000';

describe('Guardian API Integration', () => {
    describe('GET /api/guardian/health', () => {
        it('should return healthy status', async () => {
            const response = await fetch(`${BASE_URL}/api/guardian/health`);
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.status).toBe('healthy');
            expect(data.version).toBeDefined();
            expect(data.profilesLoaded).toBeGreaterThan(0);
        });
    });

    describe('GET /api/guardian/profiles', () => {
        it('should return available policy profiles', async () => {
            const response = await fetch(`${BASE_URL}/api/guardian/profiles`);
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.profiles).toBeDefined();
            expect(Array.isArray(data.profiles)).toBe(true);
            expect(data.profiles.length).toBeGreaterThan(0);
        });

        it('should include PROMO_SCRIPT_DE_V1 profile', async () => {
            const response = await fetch(`${BASE_URL}/api/guardian/profiles`);
            const data = await response.json();

            const promoProfile = data.profiles.find(
                (p: { id: string }) => p.id === 'PROMO_SCRIPT_DE_V1'
            );

            expect(promoProfile).toBeDefined();
            expect(promoProfile.domain).toBe('content_generation');
            expect(promoProfile.jurisdiction).toBe('DE');
        });
    });

    describe('POST /api/guardian/scan', () => {
        it('should approve clean German content', async () => {
            const response = await fetch(`${BASE_URL}/api/guardian/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: 'test',
                    content: {
                        text: 'Willkommen in unserem Restaurant. Entdecken Sie unsere köstliche Küche.',
                        language: 'de',
                    },
                    profileId: 'PROMO_SCRIPT_DE_V1',
                    formalityMode: 'strict',
                }),
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.status).toBe('APPROVED');
            expect(data.score).toBeGreaterThanOrEqual(80);
            expect(data.auditId).toBeDefined();
        });

        it('should detect aggressive sales language', async () => {
            const response = await fetch(`${BASE_URL}/api/guardian/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: 'test',
                    content: {
                        text: 'BUY NOW! Limited time offer! Only 3 left!',
                        language: 'en',
                    },
                    profileId: 'PROMO_SCRIPT_EU_V1',
                    formalityMode: 'skip',
                }),
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.signals.length).toBeGreaterThan(0);
            expect(data.violations.length).toBeGreaterThan(0);

            const hasAggressive = data.signals.some(
                (s: { type: string }) => s.type === 'SIGNAL_AGGRESSIVE_SALES'
            );
            expect(hasAggressive).toBe(true);
        });

        it('should detect Sie/Du formality mixing in German', async () => {
            const response = await fetch(`${BASE_URL}/api/guardian/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: 'test',
                    content: {
                        text: 'Herzlich willkommen. Schauen Sie sich um. Du wirst es lieben!',
                        language: 'de',
                    },
                    profileId: 'PROMO_SCRIPT_DE_V1',
                    formalityMode: 'strict',
                }),
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            const hasFormalityMixing = data.signals.some(
                (s: { type: string }) => s.type === 'SIGNAL_FORMALITY_MIXING'
            );
            expect(hasFormalityMixing).toBe(true);
        });

        it('should return 400 for missing required fields', async () => {
            const response = await fetch(`${BASE_URL}/api/guardian/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: 'test',
                    // Missing content field
                }),
            });

            expect(response.status).toBe(400);
        });

        it('should return 404 for unknown profile', async () => {
            const response = await fetch(`${BASE_URL}/api/guardian/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: 'test',
                    content: { text: 'Test', language: 'en' },
                    profileId: 'NONEXISTENT_PROFILE',
                }),
            });

            expect(response.status).toBe(404);
        });
    });

    describe('Policy Pack E2E', () => {
        it('should apply MENTAL_HEALTH_EU_V1 rules', async () => {
            const response = await fetch(`${BASE_URL}/api/guardian/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: 'test',
                    content: {
                        text: 'Everything is hopeless. I want to end it all.',
                        language: 'en',
                    },
                    profileId: 'MENTAL_HEALTH_EU_V1',
                }),
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.status).toBe('REJECTED');
            expect(data.violations.length).toBeGreaterThan(0);
        });
    });
});
