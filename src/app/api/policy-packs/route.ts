import { NextResponse } from 'next/server';
import { POLICY_PACKS } from '@/domain/policy_engine/registries/PolicyPackRegistry';

export async function GET() {
    // Return list of available policy packs (metadata only)
    const packs = Object.values(POLICY_PACKS).map(p => ({
        id: p.id,
        name: p.name,
        version: p.version,
        description: p.description,
        domain: p.domain,
        jurisdiction: p.jurisdiction,
        effectiveFrom: p.effectiveFrom?.toISOString(),
        ruleCount: p.rules.length
    }));

    return NextResponse.json(packs);
}

