import { test, expect } from '@playwright/test';

test.describe('GPAI Systemic Risk Compliance & DoC', () => {

    test('should generate Declaration of Conformity for compliant system', async ({ request }) => {
        const response = await request.post('/api/generate-doc', {
            data: {
                systemInfo: {
                    name: 'TestBot 3000',
                    type: 'HIGH_RISK_HR',
                    intendedPurpose: 'Recruiting assistance',
                    version: '1.0.0'
                },
                providerInfo: {
                    name: 'Tech Corp',
                    address: 'Berlin, Germany',
                    contactEmail: 'compliance@techcorp.eu',
                    euRepresentative: null
                },
                assessmentResults: {
                    compliant: true,
                    score: 95,
                    violations: [],
                    lastAssessmentDate: new Date().toISOString() // JSON serialization handles this
                }
            }
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();

        expect(body.success).toBe(true);
        expect(body.doc).toBeDefined();
        expect(body.doc.conformsToAIAct).toBe(true);
        expect(body.html).toContain('EU Declaration of Conformity');

        // Verify we can retrieve it or that it persisted (API doesn't have GET yet, but response confirms ID)
        expect(body.id).toBeDefined();
    });

    test('should reject DoC generation for non-compliant system', async ({ request }) => {
        const response = await request.post('/api/generate-doc', {
            data: {
                systemInfo: {
                    name: 'BiasBot',
                    type: 'HIGH_RISK_HR',
                    intendedPurpose: 'Recruiting',
                    version: '0.1.0'
                },
                providerInfo: {
                    name: 'Unethical Corp',
                    address: 'Nowhere',
                    contactEmail: 'fail@corp.com',
                    euRepresentative: null
                },
                assessmentResults: {
                    compliant: false,
                    score: 40,
                    violations: [{ ruleId: 'RULE_AGE_BIAS', message: 'Bias detected' }],
                    lastAssessmentDate: new Date().toISOString()
                }
            }
        });

        expect(response.status()).toBe(422);
        const body = await response.json();
        expect(body.error).toContain('non-compliant');
    });

    test('should report and retrieve systemic incidents', async ({ request }) => {
        const systemId = 'GPAI-Model-X';

        // 1. Report Incident
        const postResponse = await request.post('/api/incidents', {
            data: {
                systemId: systemId,
                incidentType: 'SYSTEMIC_RISK_MATERIALIZED',
                severity: 'CRITICAL',
                description: 'Model began generating hallucinated case law at scale.',
                correctiveMeasures: 'Model reverted to v1.0, monitoring enabled.',
                reportedToAiOffice: true
            }
        });

        expect(postResponse.ok()).toBeTruthy();
        const postBody = await postResponse.json();
        expect(postBody.success).toBe(true);
        expect(postBody.id).toBeDefined();

        // 2. list incidents
        const getResponse = await request.get(`/api/incidents?systemId=${systemId}`);
        expect(getResponse.ok()).toBeTruthy();
        const getBody = await getResponse.json();

        expect(getBody.incidents.length).toBeGreaterThan(0);
        const incident = getBody.incidents[0];
        expect(incident.severity).toBe('CRITICAL');
        expect(incident.reportedToAiOffice).toBe(true);
        expect(incident.description).toContain('hallucinated case law');
    });
});
