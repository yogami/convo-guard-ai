/**
 * API Key Repository
 * Handles API key validation and rate limiting
 */
import { getSupabaseClient } from './SupabaseClient';

export interface ApiKey {
    id: string;
    key: string;
    name: string;
    tier: 'free' | 'pro' | 'enterprise';
    requestsCount: number;
    requestsLimit: number;
    enabled: boolean;
}

export interface IApiKeyRepository {
    validateKey(key: string): Promise<ApiKey | null>;
    incrementRequestCount(keyId: string): Promise<void>;
    isRateLimited(key: ApiKey): boolean;
}

// Rate limits by tier
const RATE_LIMITS: Record<ApiKey['tier'], number> = {
    free: 100,      // 100 requests/month
    pro: 10000,     // 10k requests/month  
    enterprise: 100000, // 100k requests/month
};

export class ApiKeyRepository implements IApiKeyRepository {
    // In-memory cache for demo/testing without Supabase
    private demoKeys: Map<string, ApiKey> = new Map([
        ['test-key-free', {
            id: 'demo-free',
            key: 'test-key-free',
            name: 'Demo Free Key',
            tier: 'free',
            requestsCount: 0,
            requestsLimit: RATE_LIMITS.free,
            enabled: true,
        }],
        ['test-key-pro', {
            id: 'demo-pro',
            key: 'test-key-pro',
            name: 'Demo Pro Key',
            tier: 'pro',
            requestsCount: 0,
            requestsLimit: RATE_LIMITS.pro,
            enabled: true,
        }],
    ]);

    async validateKey(key: string): Promise<ApiKey | null> {
        // Check demo keys first (for testing)
        if (this.demoKeys.has(key)) {
            return this.demoKeys.get(key)!;
        }

        const client = getSupabaseClient();

        if (!client) {
            // Allow any key in demo mode
            if (key && key.length > 5) {
                return {
                    id: 'demo-' + key.substring(0, 8),
                    key,
                    name: 'Demo Key',
                    tier: 'free',
                    requestsCount: 0,
                    requestsLimit: RATE_LIMITS.free,
                    enabled: true,
                };
            }
            return null;
        }

        try {
            const { data, error } = await client
                .from('api_keys')
                .select('*')
                .eq('key', key)
                .eq('enabled', true)
                .single();

            if (error || !data) return null;

            // Type assertion for the row data
            const row = data as unknown as {
                id: string;
                key: string;
                name: string;
                tier: 'free' | 'pro' | 'enterprise';
                requests_count: number;
                requests_limit: number;
                enabled: boolean;
            };

            return {
                id: row.id,
                key: row.key,
                name: row.name,
                tier: row.tier,
                requestsCount: row.requests_count,
                requestsLimit: row.requests_limit,
                enabled: row.enabled,
            };
        } catch {
            return null;
        }
    }

    async incrementRequestCount(keyId: string): Promise<void> {
        // Update demo key counter
        for (const [, apiKey] of this.demoKeys) {
            if (apiKey.id === keyId) {
                apiKey.requestsCount++;
                return;
            }
        }

        // In production with Supabase, would increment the counter
        // For now, demo mode tracks in memory
        console.log('Request count incremented for:', keyId);
    }

    isRateLimited(key: ApiKey): boolean {
        return key.requestsCount >= key.requestsLimit;
    }
}

// Singleton instance
export const apiKeyRepository = new ApiKeyRepository();
