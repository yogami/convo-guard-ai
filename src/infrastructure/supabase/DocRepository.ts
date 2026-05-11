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

        try {
            const { error } = await client
                .from('declarations_of_conformity')
                .insert({
                    id: doc.id,
                    created_at: new Date().toISOString(),
                    system_name: doc.systemName,
                    provider_name: doc.providerName,
                    provider_address: doc.providerAddress,
                    issue_date: doc.issueDate.toISOString(),
                    doc_json: doc,
                    pdf_url: null
                });

            if (error) {
                console.warn(`Failed to save Declaration of Conformity to Supabase: ${error.message}. Falling back to memory.`);
                this.memoryStore.set(doc.id, doc);
            }
        } catch (ex: any) {
            console.warn(`Exception when saving Declaration of Conformity to Supabase: ${ex.message}. Falling back to memory.`);
            this.memoryStore.set(doc.id, doc);
        }
    }

    async findById(id: string): Promise<DeclarationOfConformity | null> {
        const client = getSupabaseClient();
        if (!client) {
            return this.memoryStore.get(id) || null;
        }

        try {
            const { data, error } = await client
                .from('declarations_of_conformity')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                console.warn(`Failed to fetch Declaration of Conformity from Supabase (or not found). Falling back to memory.`);
                return this.memoryStore.get(id) || null;
            }

            const doc = data.doc_json as DeclarationOfConformity;

            return {
                ...doc,
                issueDate: new Date(doc.issueDate),
                assessmentDate: new Date(doc.assessmentDate)
            };
        } catch (ex: any) {
            console.warn(`Exception when fetching Declaration of Conformity from Supabase. Falling back to memory.`);
            return this.memoryStore.get(id) || null;
        }
    }
}

export const docRepository = new DocRepository();
