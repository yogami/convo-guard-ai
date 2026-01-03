/**
 * Guardian API - Health Endpoint
 * GET /api/guardian/health
 * 
 * Health check endpoint for monitoring and load balancers.
 */
import { NextResponse } from 'next/server';
import { POLICY_PACKS } from '@/lib/compliance-engine/policy_engine/registries/PolicyPackRegistry';

interface HealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    timestamp: string;
    policyPacksLoaded: number;
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
    const policyPackCount = Object.keys(POLICY_PACKS).length;

    return NextResponse.json({
        status: policyPackCount > 0 ? 'healthy' : 'degraded',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        policyPacksLoaded: policyPackCount,
    });
}
