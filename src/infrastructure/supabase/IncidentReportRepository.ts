import { IncidentReport } from '@/domain/entities/IncidentReport';
import { getSupabaseClient } from './SupabaseClient';

export class IncidentReportRepository {
    private memoryStore: Map<string, IncidentReport> = new Map();

    async save(report: IncidentReport): Promise<void> {
        const client = getSupabaseClient();
        if (!client) {
            console.warn('Supabase not configured, saving Incident Report to memory');
            this.memoryStore.set(report.id, report);
            return;
        }

        const { error } = await client
            .from('incident_reports')
            .insert({
                id: report.id,
                created_at: report.timestamp.toISOString(),
                system_id: report.systemId,
                incident_type: report.incidentType,
                severity: report.severity,
                description: report.description,
                corrective_measures: report.correctiveMeasures,
                reported_to_ai_office: report.reportedToAiOffice
            });

        if (error) {
            throw new Error(`Failed to save Incident Report: ${error.message}`);
        }
    }

    async findBySystemId(systemId: string): Promise<IncidentReport[]> {
        const client = getSupabaseClient();
        if (!client) {
            return Array.from(this.memoryStore.values())
                .filter(r => r.systemId === systemId)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        }

        const { data, error } = await client
            .from('incident_reports')
            .select('*')
            .eq('system_id', systemId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch incidents: ${error.message}`);
        }

        return data.map((row: any) => ({
            id: row.id,
            timestamp: new Date(row.created_at),
            systemId: row.system_id,
            incidentType: row.incident_type,
            severity: row.severity,
            description: row.description,
            correctiveMeasures: row.corrective_measures,
            reportedToAiOffice: row.reported_to_ai_office
        }));
    }
}

export const incidentReportRepository = new IncidentReportRepository();
