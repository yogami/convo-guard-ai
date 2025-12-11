import { Policy } from '../policies/PolicyStore';

/**
 * Interface for accessing compliance policies.
 * In a real production system, this connects to a live regulatory database.
 */
export interface PolicyRepository {
    /**
     * Get all active policies for the current region/context.
     */
    getActivePolicies(): Promise<Policy[]>;

    /**
     * Force a synchronization with the external regulatory source.
     */
    syncWithRegistry(): Promise<void>;
}
