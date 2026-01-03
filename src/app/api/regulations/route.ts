import { NextResponse } from 'next/server';
import { REGULATION_REGISTRY } from '@/lib/compliance-engine/policy_engine/Regulation';

/**
 * GET /api/regulations
 * Returns the full regulation registry for dashboard lookups
 */
export async function GET() {
    const regulations = Object.values(REGULATION_REGISTRY).map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        url: r.url,
        jurisdiction: r.jurisdiction
    }));

    return NextResponse.json(regulations);
}
