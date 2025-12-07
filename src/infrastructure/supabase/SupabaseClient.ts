/**
 * Supabase client configuration
 * Handles database connections for audit logs and API keys
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use a generic Supabase client to avoid complex type inference issues
// In production, you would generate types from your Supabase schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseClient: SupabaseClient<any, 'public', any> | null = null;

/**
 * Get or create Supabase client
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseClient(): SupabaseClient<any, 'public', any> | null {
    if (supabaseClient) {
        return supabaseClient;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase credentials not configured');
        return null;
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
    return supabaseClient;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL &&
        (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}

/**
 * Database table types for reference
 * These match the Supabase schema we expect
 */
export interface AuditLogRow {
    id: string;
    conversation_id: string;
    transcript: string;
    score: number;
    compliant: boolean;
    risks: unknown;
    hash: string;
    api_key_id: string | null;
    created_at: string;
}

export interface ApiKeyRow {
    id: string;
    key: string;
    name: string;
    tier: 'free' | 'pro' | 'enterprise';
    requests_count: number;
    requests_limit: number;
    enabled: boolean;
    created_at: string;
}
