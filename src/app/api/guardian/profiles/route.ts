/**
 * Guardian API - Profiles Endpoint
 * GET /api/guardian/profiles
 * 
 * Returns available compliance profiles for content scanning.
 */
import { NextResponse } from 'next/server';
import { POLICY_PACKS } from '@/domain/policy_engine/registries/PolicyPackRegistry';
import { ComplianceProfile } from '@/domain/entities/GuardianScanRequest';

export async function GET(): Promise<NextResponse<{ profiles: ComplianceProfile[] }>> {
    const profiles: ComplianceProfile[] = Object.values(POLICY_PACKS).map(pack => ({
        id: pack.id,
        name: pack.name,
        description: pack.description,
        domain: pack.domain,
        jurisdiction: pack.jurisdiction,
        detectorCount: pack.detectors.length,
        ruleCount: pack.rules.length,
    }));

    return NextResponse.json({ profiles });
}
