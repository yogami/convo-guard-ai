/**
 * Unit tests for Guardian API endpoints
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    GuardianScanRequest,
    GuardianScanResponse,
    createScanResponse,
    ContentPayload
} from '@/domain/entities/GuardianScanRequest';
import { Signal } from '@/domain/policy_engine/Signal';
import { PolicyViolation } from '@/domain/policy_engine/Policy';

describe('GuardianScanRequest Entity', () => {
    describe('createScanResponse()', () => {
        it('should create response with APPROVED status', () => {
            const signals: Signal[] = [];
            const violations: PolicyViolation[] = [];

            const response = createScanResponse('APPROVED', 100, signals, violations, 'PROMO_SCRIPT_DE_V1');

            expect(response.status).toBe('APPROVED');
            expect(response.score).toBe(100);
            expect(response.signals).toEqual([]);
            expect(response.violations).toEqual([]);
            expect(response.auditId).toBeDefined();
            expect(response.auditId.length).toBeGreaterThan(0);
            expect(response.scannedAt).toBeInstanceOf(Date);
            expect(response.profileUsed).toBe('PROMO_SCRIPT_DE_V1');
        });

        it('should create response with REJECTED status and violations', () => {
            const signals: Signal[] = [{
                type: 'SIGNAL_MANIPULATION',
                source: 'REGEX',
                confidence: 0.9,
                metadata: { triggerText: 'Buy now!' }
            }];

            const violations: PolicyViolation[] = [{
                ruleId: 'manipulation-001',
                category: 'MANIPULATION',
                regulationIds: ['AI_ACT_ART9'],
                severity: 'HIGH',
                scoreImpact: -30,
                message: 'Aggressive sales language detected',
                triggerSignal: signals[0]
            }];

            const response = createScanResponse('REJECTED', 70, signals, violations, 'PROMO_SCRIPT_DE_V1');

            expect(response.status).toBe('REJECTED');
            expect(response.score).toBe(70);
            expect(response.violations).toHaveLength(1);
            expect(response.correctionHints).toContain('Soften sales language; avoid urgency-inducing phrases like "Buy now!"');
        });

        it('should generate unique audit IDs for each response', () => {
            const response1 = createScanResponse('APPROVED', 100, [], [], 'TEST');
            const response2 = createScanResponse('APPROVED', 100, [], [], 'TEST');

            expect(response1.auditId).not.toBe(response2.auditId);
        });

        it('should generate correction hints for GDPR_CONSENT violations', () => {
            const violations: PolicyViolation[] = [{
                ruleId: 'gdpr-001',
                category: 'GDPR_CONSENT',
                regulationIds: ['GDPR_ART6'],
                severity: 'MEDIUM',
                scoreImpact: -15,
                message: 'Missing consent',
                triggerSignal: { type: 'SIGNAL_MISSING_CONSENT', source: 'REGEX', confidence: 1, metadata: {} }
            }];

            const response = createScanResponse('REVIEW_REQUIRED', 85, [], violations, 'TEST');

            expect(response.correctionHints).toContain('Ensure explicit consent is obtained before collecting personal data.');
        });

        it('should generate correction hints for TRANSPARENCY violations', () => {
            const violations: PolicyViolation[] = [{
                ruleId: 'transparency-001',
                category: 'TRANSPARENCY',
                regulationIds: ['AI_ACT_ART13'],
                severity: 'LOW',
                scoreImpact: -10,
                message: 'AI disclosure missing',
                triggerSignal: { type: 'SIGNAL_MISSING_DISCLOSURE', source: 'REGEX', confidence: 1, metadata: {} }
            }];

            const response = createScanResponse('REVIEW_REQUIRED', 90, [], violations, 'TEST');

            expect(response.correctionHints).toContain('Clearly disclose AI-generated content to viewers.');
        });

        it('should deduplicate correction hints', () => {
            const violations: PolicyViolation[] = [
                {
                    ruleId: 'manipulation-001',
                    category: 'MANIPULATION',
                    regulationIds: [],
                    severity: 'HIGH',
                    scoreImpact: -30,
                    message: 'Issue 1',
                    triggerSignal: { type: 'SIGNAL_1', source: 'REGEX', confidence: 1, metadata: {} }
                },
                {
                    ruleId: 'manipulation-002',
                    category: 'MANIPULATION',
                    regulationIds: [],
                    severity: 'MEDIUM',
                    scoreImpact: -20,
                    message: 'Issue 2',
                    triggerSignal: { type: 'SIGNAL_2', source: 'REGEX', confidence: 1, metadata: {} }
                }
            ];

            const response = createScanResponse('REJECTED', 50, [], violations, 'TEST');

            // Should only have one hint for MANIPULATION (deduplicated)
            const manipulationHints = response.correctionHints.filter(h => h.includes('sales language'));
            expect(manipulationHints).toHaveLength(1);
        });
    });
});

describe('ContentPayload Interface', () => {
    it('should accept minimal payload with just text', () => {
        const payload: ContentPayload = {
            text: 'Test content'
        };

        expect(payload.text).toBe('Test content');
        expect(payload.imageUrls).toBeUndefined();
        expect(payload.language).toBeUndefined();
    });

    it('should accept full payload with all optional fields', () => {
        const payload: ContentPayload = {
            text: 'Test content',
            imageUrls: ['https://example.com/image.jpg'],
            audioTranscript: 'Spoken text',
            language: 'de'
        };

        expect(payload.imageUrls).toHaveLength(1);
        expect(payload.language).toBe('de');
    });
});

describe('GuardianScanRequest Interface', () => {
    it('should accept valid request with required fields', () => {
        const request: GuardianScanRequest = {
            projectId: 'instagram-reel-poster',
            content: { text: 'Buy our amazing product!' },
            profileId: 'PROMO_SCRIPT_DE_V1'
        };

        expect(request.projectId).toBe('instagram-reel-poster');
        expect(request.profileId).toBe('PROMO_SCRIPT_DE_V1');
    });

    it('should accept request with skip detectors', () => {
        const request: GuardianScanRequest = {
            projectId: 'test',
            content: { text: 'Content' },
            profileId: 'TEST',
            skipDetectors: ['formality_detector']
        };

        expect(request.skipDetectors).toContain('formality_detector');
    });

    it('should accept request with formality mode override', () => {
        const request: GuardianScanRequest = {
            projectId: 'test',
            content: { text: 'Du bist toll! Sie sind willkommen.' },
            profileId: 'PROMO_SCRIPT_DE_V1',
            formalityMode: 'skip'
        };

        expect(request.formalityMode).toBe('skip');
    });
});
