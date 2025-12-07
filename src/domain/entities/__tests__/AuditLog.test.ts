import { describe, it, expect, beforeEach } from 'vitest';
import {
    AuditLog,
    createAuditLog,
    verifyAuditLog,
    formatAuditLogForExport,
} from '../AuditLog';
import { ValidationResult, Risk } from '../Conversation';

describe('AuditLog Entity', () => {
    let mockResult: ValidationResult;

    beforeEach(() => {
        mockResult = {
            compliant: true,
            score: 92,
            risks: [],
            auditId: 'audit-123',
        };
    });

    describe('createAuditLog', () => {
        it('should create an audit log with hash', () => {
            const log = createAuditLog('conv-123', mockResult);

            expect(log.id).toBeDefined();
            expect(log.conversationId).toBe('conv-123');
            expect(log.hash).toBeDefined();
            expect(log.hash.length).toBe(64); // SHA-256 hex
            expect(log.timestamp).toBeInstanceOf(Date);
            expect(log.result).toEqual(mockResult);
        });

        it('should include metadata when provided', () => {
            const metadata = {
                apiKeyId: 'key-123',
                clientIp: '192.168.1.1',
                requestDurationMs: 150,
            };

            const log = createAuditLog('conv-123', mockResult, metadata);

            expect(log.metadata.apiKeyId).toBe('key-123');
            expect(log.metadata.clientIp).toBe('192.168.1.1');
            expect(log.metadata.requestDurationMs).toBe(150);
        });

        it('should default requestDurationMs to 0', () => {
            const log = createAuditLog('conv-123', mockResult);

            expect(log.metadata.requestDurationMs).toBe(0);
        });

        it('should generate unique IDs', () => {
            const log1 = createAuditLog('conv-123', mockResult);
            const log2 = createAuditLog('conv-123', mockResult);

            expect(log1.id).not.toBe(log2.id);
            expect(log1.hash).not.toBe(log2.hash); // Different timestamps/IDs
        });
    });

    describe('verifyAuditLog', () => {
        it('should return true for valid audit log', () => {
            const log = createAuditLog('conv-123', mockResult);

            expect(verifyAuditLog(log)).toBe(true);
        });

        it('should return false if hash is tampered', () => {
            const log = createAuditLog('conv-123', mockResult);
            log.hash = 'tampered-hash';

            expect(verifyAuditLog(log)).toBe(false);
        });

        it('should return false if result is modified', () => {
            const log = createAuditLog('conv-123', mockResult);
            const originalHash = log.hash;
            log.result.score = 50; // Tamper with result

            expect(verifyAuditLog(log)).toBe(false);
        });
    });

    describe('formatAuditLogForExport', () => {
        it('should format audit log for regulatory submission', () => {
            const risks: Risk[] = [
                {
                    category: 'GDPR_CONSENT',
                    severity: 'LOW',
                    message: 'Missing consent',
                    weight: -15,
                },
            ];
            const result: ValidationResult = {
                compliant: true,
                score: 85,
                risks,
                auditId: 'audit-123',
            };
            const log = createAuditLog('conv-123', result, {
                requestDurationMs: 120,
            });

            const exported = formatAuditLogForExport(log);

            expect(exported.audit_id).toBe(log.id);
            expect(exported.conversation_id).toBe('conv-123');
            expect(exported.integrity_hash).toBe(log.hash);
            expect(exported.compliance_status).toBe('PASS');
            expect(exported.compliance_score).toBe(85);
            expect(exported.processing_time_ms).toBe(120);
            expect(exported.detected_risks).toHaveLength(1);
            expect((exported.detected_risks as any[])[0].category).toBe('GDPR_CONSENT');
        });

        it('should format non-compliant logs correctly', () => {
            const result: ValidationResult = {
                compliant: false,
                score: 45,
                risks: [],
                auditId: 'audit-123',
            };
            const log = createAuditLog('conv-123', result);

            const exported = formatAuditLogForExport(log);

            expect(exported.compliance_status).toBe('FAIL');
            expect(exported.compliance_score).toBe(45);
        });
    });
});
