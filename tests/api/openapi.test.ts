/**
 * OpenAPI Manifest Validation Tests
 * 
 * TDD: These tests are written BEFORE implementing the OpenAPI layer.
 * They define the contract that the implementation must satisfy.
 * 
 * @group api
 * @group openapi
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = process.env.TEST_API_BASE || 'http://localhost:3000';

describe('OpenAPI Manifest', () => {
    let openApiSpec: Record<string, unknown>;

    beforeAll(async () => {
        // This will fail until we implement the endpoint
        try {
            const response = await fetch(`${API_BASE}/api/openapi.json`);
            if (response.ok) {
                openApiSpec = await response.json();
            }
        } catch {
            // Expected to fail before implementation
        }
    });

    it('should expose /api/openapi.json endpoint', async () => {
        const response = await fetch(`${API_BASE}/api/openapi.json`);
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should return valid OpenAPI 3.0 spec', async () => {
        const response = await fetch(`${API_BASE}/api/openapi.json`);
        const spec = await response.json();
        
        expect(spec.openapi).toMatch(/^3\.\d+\.\d+$/);
        expect(spec.info).toBeDefined();
        expect(spec.info.title).toBe('ConvoGuard AI API');
        expect(spec.info.version).toBeDefined();
    });

    it('should include paths for all Guardian endpoints', async () => {
        const response = await fetch(`${API_BASE}/api/openapi.json`);
        const spec = await response.json();
        
        expect(spec.paths).toBeDefined();
        expect(spec.paths['/api/guardian/scan']).toBeDefined();
        expect(spec.paths['/api/guardian/health']).toBeDefined();
        expect(spec.paths['/api/guardian/profiles']).toBeDefined();
    });

    it('should define request/response schemas', async () => {
        const response = await fetch(`${API_BASE}/api/openapi.json`);
        const spec = await response.json();
        
        // Check that scan endpoint has proper schema
        const scanPath = spec.paths['/api/guardian/scan'];
        expect(scanPath.post).toBeDefined();
        expect(scanPath.post.requestBody).toBeDefined();
        expect(scanPath.post.responses['200']).toBeDefined();
    });

    it('should include server information', async () => {
        const response = await fetch(`${API_BASE}/api/openapi.json`);
        const spec = await response.json();
        
        expect(spec.servers).toBeDefined();
        expect(spec.servers.length).toBeGreaterThan(0);
    });
});

describe('Swagger UI', () => {
    it('should expose /api/docs endpoint', async () => {
        const response = await fetch(`${API_BASE}/api/docs`);
        expect(response.status).toBe(200);
    });

    it('should return HTML content', async () => {
        const response = await fetch(`${API_BASE}/api/docs`);
        const contentType = response.headers.get('content-type');
        expect(contentType).toContain('text/html');
    });

    it('should include Swagger UI script', async () => {
        const response = await fetch(`${API_BASE}/api/docs`);
        const html = await response.text();
        expect(html).toContain('swagger-ui');
    });
});
