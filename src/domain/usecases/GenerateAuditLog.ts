import { injectable, inject } from 'inversify';
import {
    AuditLog,
    createAuditLog,
    AuditMetadata,
    formatAuditLogForExport,
} from '../entities/AuditLog';
import { ValidationResult } from '../entities/Conversation';
import { TYPES } from '@/infrastructure/di/types';

/**
 * Interface for audit log repository (Dependency Inversion)
 */
export interface IAuditLogRepository {
    save(log: AuditLog): Promise<void>;
    findById(id: string): Promise<AuditLog | null>;
    findByConversationId(conversationId: string): Promise<AuditLog[]>;
    findRecent(limit: number): Promise<AuditLog[]>;
}

/**
 * Use case for generating and persisting audit logs
 * Single Responsibility: Only handles audit log creation
 */
@injectable()
export class GenerateAuditLog {
    constructor(
        @inject(TYPES.AuditLogRepository) private repository: IAuditLogRepository
    ) { }

    /**
     * Execute the audit log generation use case
     * @param conversationId The ID of the validated conversation
     * @param result The validation result
     * @param metadata Additional metadata (IP, user agent, etc.)
     * @returns The created AuditLog
     */
    async execute(
        conversationId: string,
        result: ValidationResult,
        metadata: Partial<AuditMetadata> = {}
    ): Promise<AuditLog> {
        const auditLog = createAuditLog(conversationId, result, metadata);
        await this.repository.save(auditLog);
        return auditLog;
    }

    /**
     * Get recent audit logs
     */
    async getRecent(limit: number = 50): Promise<AuditLog[]> {
        return this.repository.findRecent(limit);
    }

    /**
     * Export audit logs for regulatory submission
     */
    async exportForSubmission(conversationId: string): Promise<Record<string, unknown>[]> {
        const logs = await this.repository.findByConversationId(conversationId);
        return logs.map(formatAuditLogForExport);
    }
}
