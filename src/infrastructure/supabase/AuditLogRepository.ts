/**
 * Audit Log Repository
 * Handles persistence of audit logs to Supabase
 */
import { AuditLog, formatAuditLogForExport } from '@/domain/entities/AuditLog';
import { getSupabaseClient, isSupabaseConfigured } from './SupabaseClient';

export interface IAuditLogRepository {
    save(auditLog: AuditLog, transcript: string): Promise<void>;
    findById(id: string): Promise<AuditLog | null>;
    findByConversationId(conversationId: string): Promise<AuditLog[]>;
    findRecent(limit?: number): Promise<AuditLog[]>;
}

export class AuditLogRepository implements IAuditLogRepository {
    async save(auditLog: AuditLog, transcript: string): Promise<void> {
        const client = getSupabaseClient();

        if (!client) {
            // Store in memory or log if Supabase not configured
            console.log('Audit log (in-memory):', auditLog.id);
            return;
        }

        const { error } = await client.from('audit_logs').insert({
            id: auditLog.id,
            conversation_id: auditLog.conversationId,
            transcript,
            score: auditLog.result.score,
            compliant: auditLog.result.compliant,
            risks: auditLog.result.risks,
            hash: auditLog.hash,
            api_key_id: auditLog.metadata.apiKeyId || null,
        });

        if (error) {
            console.error('Failed to save audit log:', error);
            throw new Error(`Failed to save audit log: ${error.message}`);
        }
    }

    async findById(id: string): Promise<AuditLog | null> {
        const client = getSupabaseClient();
        if (!client) return null;

        const { data, error } = await client
            .from('audit_logs')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return this.mapToAuditLog(data);
    }

    async findByConversationId(conversationId: string): Promise<AuditLog[]> {
        const client = getSupabaseClient();
        if (!client) return [];

        const { data, error } = await client
            .from('audit_logs')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map((row) => this.mapToAuditLog(row));
    }

    async findRecent(limit = 50): Promise<AuditLog[]> {
        const client = getSupabaseClient();
        if (!client) return [];

        const { data, error } = await client
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error || !data) return [];

        return data.map((row) => this.mapToAuditLog(row));
    }

    private mapToAuditLog(row: {
        id: string;
        conversation_id: string;
        score: number;
        compliant: boolean;
        risks: unknown;
        hash: string;
        api_key_id: string | null;
        created_at: string;
    }): AuditLog {
        return {
            id: row.id,
            conversationId: row.conversation_id,
            hash: row.hash,
            timestamp: new Date(row.created_at),
            result: {
                compliant: row.compliant,
                score: row.score,
                risks: row.risks as AuditLog['result']['risks'],
                auditId: row.id,
            },
            metadata: {
                apiKeyId: row.api_key_id || undefined,
                requestDurationMs: 0,
            },
        };
    }
}

// Export for CSV downloads
export function exportAuditLogsToCSV(logs: AuditLog[]): string {
    const headers = [
        'audit_id',
        'conversation_id',
        'timestamp',
        'compliant',
        'score',
        'risk_count',
        'risks',
        'hash',
    ];

    const rows = logs.map((log) => {
        const exported = formatAuditLogForExport(log);
        return [
            log.id,
            log.conversationId,
            log.timestamp.toISOString(),
            log.result.compliant ? 'PASS' : 'FAIL',
            log.result.score,
            log.result.risks.length,
            JSON.stringify(exported.detected_risks),
            log.hash,
        ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

// Singleton instance
export const auditLogRepository = new AuditLogRepository();
