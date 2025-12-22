/**
 * MDR-Enhanced Audit Log
 * 
 * Extended audit log entity for DiGA/MDR (MedTech) compliance.
 * Includes clinical evidence tracking, risk classification, and lifecycle stages.
 * 
 * Reference: MDR Article 10, 61; DiGA BfArM Guide
 */

import { ValidationResult, Risk } from './Conversation';
import { createHash } from 'crypto';

/**
 * MDR Risk Classification for medical devices
 */
export type MDRRiskClass = 'CLASS_I' | 'CLASS_IIa' | 'CLASS_IIb' | 'CLASS_III';

/**
 * Product Lifecycle Stage per MDR/DiGA
 */
export type LifecycleStage =
    | 'DESIGN'
    | 'DEVELOPMENT'
    | 'VALIDATION'
    | 'MARKET'
    | 'POST_MARKET';

/**
 * Clinical Evidence metadata for DiGA submissions
 */
export interface ClinicalEvidenceMetadata {
    studyReference?: string;
    evidenceLevel?: 'HIGH' | 'MODERATE' | 'LOW' | 'NONE';
    clinicalClaimsMade: boolean;
    disclaimerProvided: boolean;
}

/**
 * Enhanced MDR Audit Metadata
 */
export interface MDRAuditMetadata {
    apiKeyId?: string;
    clientIp?: string;
    userAgent?: string;
    requestDurationMs: number;

    // MDR-Specific Fields
    riskClass?: MDRRiskClass;
    lifecycleStage?: LifecycleStage;
    clinicalEvidence?: ClinicalEvidenceMetadata;
    bfarmSubmissionId?: string;
    notifiedBodyId?: string;
    udiDeviceIdentifier?: string; // Unique Device Identifier per MDR
    softwareVersion?: string;
}

/**
 * MDR-Enhanced Audit Log
 */
export interface MDRAuditLog {
    id: string;
    conversationId: string;
    hash: string;
    timestamp: Date;
    result: ValidationResult;
    metadata: MDRAuditMetadata;

    // MDR-Specific top-level fields
    deviceName?: string;
    intendedPurpose?: string;
    manufacturerName?: string;
}

/**
 * Factory function to create an MDR-enhanced AuditLog
 */
export function createMDRAuditLog(
    conversationId: string,
    result: ValidationResult,
    metadata: Partial<MDRAuditMetadata> = {},
    deviceInfo?: {
        deviceName?: string;
        intendedPurpose?: string;
        manufacturerName?: string;
    }
): MDRAuditLog {
    const id = crypto.randomUUID();
    const timestamp = new Date();

    const hashContent = JSON.stringify({
        id,
        conversationId,
        timestamp: timestamp.toISOString(),
        result,
        deviceInfo
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
            lifecycleStage: metadata.lifecycleStage ?? 'DEVELOPMENT',
            ...metadata,
        },
        ...deviceInfo
    };
}

/**
 * Format MDR audit log for BfArM/DiGA submission
 */
export function formatMDRAuditLogForExport(log: MDRAuditLog): Record<string, unknown> {
    return {
        audit_id: log.id,
        conversation_id: log.conversationId,
        integrity_hash: log.hash,
        timestamp_iso: log.timestamp.toISOString(),

        // Compliance
        compliance_status: log.result.compliant ? 'PASS' : 'FAIL',
        compliance_score: log.result.score,
        detected_risks: log.result.risks.map((r) => ({
            category: r.category,
            severity: r.severity,
            description: r.message,
        })),

        // MDR-Specific
        device_name: log.deviceName,
        intended_purpose: log.intendedPurpose,
        manufacturer_name: log.manufacturerName,
        risk_class: log.metadata.riskClass,
        lifecycle_stage: log.metadata.lifecycleStage,
        udi: log.metadata.udiDeviceIdentifier,
        software_version: log.metadata.softwareVersion,

        // Clinical Evidence
        clinical_evidence: log.metadata.clinicalEvidence,
        bfarm_submission_id: log.metadata.bfarmSubmissionId,
        notified_body_id: log.metadata.notifiedBodyId,

        processing_time_ms: log.metadata.requestDurationMs,
    };
}
