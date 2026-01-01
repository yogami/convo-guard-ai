import { AuditLog } from '../entities/AuditLog';

/**
 * Port interface for AuditLog persistence.
 * Following Ports & Adapters (Hexagonal) architecture.
 */
export interface AuditLogRepository {
    /**
     * Save an audit log entry.
     */
    save(log: AuditLog): Promise<void>;

    /**
     * Find audit logs by conversation ID.
     */
    findByConversationId(conversationId: string): Promise<AuditLog[]>;

    /**
     * Find audit logs within a date range.
     */
    findByDateRange(start: Date, end: Date): Promise<AuditLog[]>;

    /**
     * Find audit log by its unique ID.
     */
    findById(id: string): Promise<AuditLog | null>;

    /**
     * Get the count of audit logs matching criteria.
     */
    count(criteria?: { since?: Date; compliantOnly?: boolean }): Promise<number>;
}
