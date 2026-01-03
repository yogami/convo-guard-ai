/**
 * Guardian API - Scan Endpoint
 * POST /api/guardian/scan
 * 
 * Scans content for compliance using the specified policy profile.
 * Primary integration point for InstagramReelPoster and other projects.
 */
import { NextRequest, NextResponse } from 'next/server';
import { PolicyEngine } from '@/lib/compliance-engine/policy_engine/PolicyEngine';
import { createConversation } from '@/domain/entities/Conversation';
import {
    GuardianScanRequest,
    GuardianScanResponse,
    createScanResponse
} from '@/domain/entities/GuardianScanRequest';
import { POLICY_PACKS } from '@/lib/compliance-engine/policy_engine/registries/PolicyPackRegistry';

const policyEngine = new PolicyEngine();

export async function POST(request: NextRequest): Promise<NextResponse<GuardianScanResponse | { error: string }>> {
    try {
        const body: GuardianScanRequest = await request.json();

        // Validate required fields
        if (!body.projectId || !body.content?.text || !body.profileId) {
            return NextResponse.json(
                { error: 'Missing required fields: projectId, content.text, profileId' },
                { status: 400 }
            );
        }

        // Check if profile exists
        const profileId = body.profileId;
        if (!POLICY_PACKS[profileId]) {
            // Fall back to default mental health profile for now
            console.warn(`[Guardian] Profile ${profileId} not found, using MENTAL_HEALTH_EU_V1`);
        }

        // Convert content to conversation format for PolicyEngine
        const conversation = createConversation([
            {
                role: 'assistant',
                content: body.content.text,
                timestamp: new Date()
            }
        ]);

        // Run policy engine evaluation
        const result = await policyEngine.evaluate(
            conversation,
            POLICY_PACKS[profileId] ? profileId : 'MENTAL_HEALTH_EU_V1'
        );

        // Determine status based on score and violations
        let status: GuardianScanResponse['status'] = 'APPROVED';
        if (!result.compliant) {
            status = 'REJECTED';
        } else if (result.violations.length > 0 && result.score >= 70) {
            status = 'REVIEW_REQUIRED';
        }

        const response = createScanResponse(
            status,
            result.score,
            result.signals,
            result.violations,
            profileId
        );

        // Log for audit trail
        console.log(`[Guardian] Scan complete: project=${body.projectId}, status=${status}, score=${result.score}, auditId=${response.auditId}`);

        return NextResponse.json(response);

    } catch (error) {
        console.error('[Guardian] Scan error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
