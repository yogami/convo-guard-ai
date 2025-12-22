import { TransparencyLog } from '@/domain/entities/TransparencyLog';
import { getSupabaseClient } from './SupabaseClient';
// Assuming environment variables are available or passed in constructor
// In this project, Supabase client might be a singleton or injected.

export class TransparencyLogRepository {
    private memoryStore: Map<string, TransparencyLog> = new Map();
    // Alternatively, if there's a shared client factory, we might use that.
    // But adhering to Dependency Injection or provided client is better.
    // For now, let's assume we pass config or client.

    // Actually, looking at clean architecture, we should typically accept the client or an interface.
    // Let's modify to accept client if possible, or just config.

    async save(log: TransparencyLog): Promise<void> {
        const client = getSupabaseClient();
        if (!client) {
            console.warn('Supabase not configured, saving transparency log to memory');
            this.memoryStore.set(log.id, log);
            return;
        }

        const { error } = await client
            .from('transparency_logs')
            .insert({
                id: log.id,
                created_at: log.timestamp.toISOString(),
                system_id: log.systemId,
                decision_type: log.decisionType,
                input_summary: log.inputSummary,
                output_decision: log.outputDecision,
                explanation_provided: log.explanationProvided,
                human_oversight: log.humanOversight,
                audit_trail: log.auditTrail,
                regulation_references: log.regulationReferences
            });

        if (error) {
            throw new Error(`Failed to save transparency log: ${error.message}`);
        }
    }

    async findBySystemId(systemId: string): Promise<TransparencyLog[]> {
        const client = getSupabaseClient();
        if (!client) {
            return Array.from(this.memoryStore.values())
                .filter(l => l.systemId === systemId)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        }

        const { data, error } = await client
            .from('transparency_logs')
            .select('*')
            .eq('system_id', systemId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch logs: ${error.message}`);
        }

        return data.map((row: any) => ({
            id: row.id,
            timestamp: new Date(row.created_at),
            systemId: row.system_id,
            decisionType: row.decision_type,
            inputSummary: row.input_summary,
            outputDecision: row.output_decision,
            explanationProvided: row.explanation_provided,
            humanOversight: row.human_oversight,
            auditTrail: row.audit_trail,
            regulationReferences: row.regulation_references
        }));
    }
}

export const transparencyLogRepository = new TransparencyLogRepository();
