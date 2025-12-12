import { PolicyRepository } from '@/domain/ports/PolicyRepository';
import { Policy, REAL_WORLD_POLICIES } from '@/domain/policies/PolicyStore';

/**
 * Implementation of Policy Repository that simulates fetching from an external Government/Regulatory API.
 * In a real scenario, this would call 'https://api.europa.eu/regulations' or a commercial compliance feed.
 */
export class ExternalPolicyRepository implements PolicyRepository {
    private cachedPolicies: Policy[] = [];
    private lastSync: Date | null = null;
    private readonly CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

    constructor() {
        // Initialize with default store, but ready to overwrite
        this.cachedPolicies = [...REAL_WORLD_POLICIES];
    }

    async getAllPolicies(): Promise<Policy[]> {
        // simple stale-while-revalidate strategy
        if (!this.lastSync || (Date.now() - this.lastSync.getTime() > this.CACHE_TTL_MS)) {
            await this.syncWithRegistry();
        }
        return this.cachedPolicies;
    }

    async getActivePolicies(): Promise<Policy[]> {
        const policies = await this.getAllPolicies();
        return policies.filter(p => p.enabled !== false);
    }

    async syncWithRegistry(): Promise<void> {
        console.log(' [POLICY SYNC] Connecting to EU Regulatory Database (Simulated)...');
        console.log(' [POLICY SYNC] Fetching latest updates for AI Act & GDPR...');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // In a real app, this would be:
        // const response = await fetch('https://compliance-feed.com/api/v1/policies');
        // this.cachedPolicies = await response.json();

        // For demo, we just ensure we have the static ones + maybe a dynamic one to prove the point?
        // Let's pretend we fetched a new "Emergency" policy.

        const dynamicPolicy: Policy = {
            id: 'EMERGENCY_AI_STOP_ORDER',
            name: 'Emergency Order 2025-X',
            description: 'Immediate cessation of unmonitored medical advice.',
            legalText: 'Effective immediately: No AI system shall provide specific dosage recommendations for psychiatric medication without human-in-the-loop verification.',
            severity: 'HIGH',
            enabled: true
        };

        // Load static policies if cache is empty, else merge (to preserve enabled state)
        const newPolicies = [...REAL_WORLD_POLICIES, dynamicPolicy];

        if (this.cachedPolicies.length === 0) {
            this.cachedPolicies = newPolicies.map(p => ({ ...p, enabled: true }));
        } else {
            // Smart merge: keep enabled state from cache if exists
            const policyMap = new Map(this.cachedPolicies.map(p => [p.id, p]));
            this.cachedPolicies = newPolicies.map(p => {
                const existing = policyMap.get(p.id);
                return { ...p, enabled: existing ? existing.enabled : true };
            });
        }

        this.lastSync = new Date();
        console.log(` [POLICY SYNC] Synchronization Complete. ${this.cachedPolicies.length} Active Policies loaded.`);
    }

    async togglePolicy(id: string, enabled: boolean): Promise<void> {
        const policy = this.cachedPolicies.find(p => p.id === id);
        if (policy) {
            policy.enabled = enabled;
            console.log(`[POLICY] Config Update: ${id} -> ${enabled ? 'ENABLED' : 'DISABLED'}`);
        }
    }
}

export const policyRepository = new ExternalPolicyRepository();
