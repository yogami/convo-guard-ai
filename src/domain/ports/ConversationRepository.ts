import { ConversationRecord } from '../entities/ConversationRecord';

/**
 * Port interface for ConversationRecord persistence.
 * Following Ports & Adapters (Hexagonal) architecture.
 */
export interface ConversationRepository {
    /**
     * Save a conversation record.
     */
    save(record: ConversationRecord): Promise<void>;

    /**
     * Find a conversation record by its unique ID.
     */
    findById(id: string): Promise<ConversationRecord | null>;

    /**
     * Find conversation records by user/client ID.
     */
    findByUserId(userId: string): Promise<ConversationRecord[]>;

    /**
     * Find conversation records by system ID.
     */
    findBySystemId(systemId: string): Promise<ConversationRecord[]>;

    /**
     * Find conversation records within a date range.
     */
    findByDateRange(start: Date, end: Date): Promise<ConversationRecord[]>;

    /**
     * Delete a conversation record (for GDPR compliance).
     */
    delete(id: string): Promise<void>;
}
