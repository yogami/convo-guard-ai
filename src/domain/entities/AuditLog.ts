import { ValidationResult, Risk } from './Conversation';
import { createHash } from 'crypto';

/**
 * Represents an immutable audit log entry
 */
export interface AuditLog {
    id: string;
    conversationId: string;
    hash: string;
    timestamp: Date;
    result: ValidationResult;
    metadata: AuditMetadata;
}

/**
 * Additional metadata for audit logs
 */
export interface AuditMetadata {
    apiKeyId?: string;
    clientIp?: string;
    userAgent?: string;
    requestDurationMs: number;
}

/**
 * Factory function to create an AuditLog with hash
 */
export function createAuditLog(
    conversationId: string,
    result: ValidationResult,
    metadata: Partial<AuditMetadata> = {}
): AuditLog {
    const id = crypto.randomUUID();
    const timestamp = new Date();

    // Create a hash of the audit data for integrity verification
    const hashContent = JSON.stringify({
        id,
        conversationId,
        timestamp: timestamp.toISOString(),
        result,
    });
    const hash = createHash('sha256').update(hashContent).digest('hex');

    return {
        id,
        conversationId,
        hash,
        timestamp,
        result,
        metadata: {
            requestDurationMs: metadata.requestDurationMs ?? 0,
            ...metadata,
        },
    };
}

/**
 * Verify the integrity of an audit log entry
 */
export function verifyAuditLog(log: AuditLog): boolean {
    const hashContent = JSON.stringify({
        id: log.id,
        conversationId: log.conversationId,
        timestamp: log.timestamp.toISOString(),
        result: log.result,
    });
    const expectedHash = createHash('sha256').update(hashContent).digest('hex');
    return log.hash === expectedHash;
}

/**
 * Format audit log for export (e.g., BfArM/DiGA submission)
 */
export function formatAuditLogForExport(log: AuditLog): Record<string, unknown> {
    return {
        audit_id: log.id,
        conversation_id: log.conversationId,
        integrity_hash: log.hash,
        timestamp_iso: log.timestamp.toISOString(),
        compliance_status: log.result.compliant ? 'PASS' : 'FAIL',
        compliance_score: log.result.score,
        detected_risks: log.result.risks.map((r) => ({
            category: r.category,
            severity: r.severity,
            description: r.message,
        })),
        processing_time_ms: log.metadata.requestDurationMs,
    };
}
