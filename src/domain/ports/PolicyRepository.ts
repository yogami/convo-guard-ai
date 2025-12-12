import { Policy } from '../policies/PolicyStore';

/**
 * Interface for accessing compliance policies.
 * In a real production system, this connects to a live regulatory database.
 */
export interface PolicyRepository {
    /**
     * Get all policies (enabled and disabled) for configuration.
     */
    getAllPolicies(): Promise<Policy[]>;

    /**
     * Get only ENABLED policies for validation.
     */
    getActivePolicies(): Promise<Policy[]>;

    /**
     * Force a synchronization with the external regulatory source.
     */
    syncWithRegistry(): Promise<void>;

    /**
     * Toggle a policy's enabled state.
     */
    togglePolicy(id: string, enabled: boolean): Promise<void>;
}
