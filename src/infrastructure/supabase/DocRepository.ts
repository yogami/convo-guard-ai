import { DeclarationOfConformity } from '@/domain/entities/DeclarationOfConformity';
import { getSupabaseClient } from './SupabaseClient';

export class DocRepository {
    private memoryStore: Map<string, DeclarationOfConformity> = new Map();

    async save(doc: DeclarationOfConformity): Promise<void> {
        const client = getSupabaseClient();
        if (!client) {
            console.warn('Supabase not configured, saving Declaration of Conformity to memory');
            this.memoryStore.set(doc.id, doc);
            return;
        }

        const { error } = await client
            .from('declarations_of_conformity')
            .insert({
                id: doc.id,
                created_at: new Date().toISOString(), // Use current time for creation
                system_name: doc.systemName,
                provider_name: doc.providerName,
                provider_address: doc.providerAddress,
                issue_date: doc.issueDate.toISOString(),
                doc_json: doc, // Store full object as JSONB
                pdf_url: null // Placeholder for now
            });

        if (error) {
            throw new Error(`Failed to save Declaration of Conformity: ${error.message}`);
        }
    }

    async findById(id: string): Promise<DeclarationOfConformity | null> {
        const client = getSupabaseClient();
        if (!client) {
            return this.memoryStore.get(id) || null;
        }

        const { data, error } = await client
            .from('declarations_of_conformity')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return null;
        }

        // We assume doc_json holds the structure, but we might need to parse dates back
        const doc = data.doc_json as DeclarationOfConformity;

        // Restore Date objects
        return {
            ...doc,
            issueDate: new Date(doc.issueDate),
            assessmentDate: new Date(doc.assessmentDate)
        };
    }
}

export const docRepository = new DocRepository();
