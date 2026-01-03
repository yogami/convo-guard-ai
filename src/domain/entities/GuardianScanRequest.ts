/**
 * GuardianScanRequest - Domain entity for external compliance scan requests
 * Used by InstagramReelPoster and other projects to request content validation
 */

import { Signal } from '../../lib/compliance-engine/policy_engine/Signal';
import { PolicyViolation } from '../../lib/compliance-engine/policy_engine/Policy';

/**
 * Content payload for scanning
 */
export interface ContentPayload {
    /** Primary text content (e.g., script narration) */
    text: string;
    /** Optional image URLs for visual content scanning */
    imageUrls?: string[];
    /** Optional audio transcript for voice content */
    audioTranscript?: string;
    /** Language code (e.g., 'de', 'en') */
    language?: string;
}

/**
 * Request to scan content for compliance
 */
export interface GuardianScanRequest {
    /** Project identifier (e.g., "instagram-reel-poster") */
    projectId: string;
    /** Content to be scanned */
    content: ContentPayload;
    /** Policy profile to apply (e.g., "PROMO_SCRIPT_DE_V1") */
    profileId: string;
    /** Optional: Skip specific detectors */
    skipDetectors?: string[];
    /** Optional: Override formality check mode */
    formalityMode?: 'strict' | 'lenient' | 'skip';
}

/**
 * Response from compliance scan
 */
export interface GuardianScanResponse {
    /** Final verdict */
    status: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUIRED';
    /** Compliance score (0-100) */
    score: number;
    /** Detected signals from detectors */
    signals: Signal[];
    /** Policy violations triggered */
    violations: PolicyViolation[];
    /** Unique audit trail identifier */
    auditId: string;
    /** Actionable suggestions for content correction */
    correctionHints: string[];
    /** Processing timestamp */
    scannedAt: Date;
    /** Profile used for scanning */
    profileUsed: string;
}

/**
 * Available compliance profiles
 */
export interface ComplianceProfile {
    id: string;
    name: string;
    description: string;
    domain: string;
    jurisdiction: string;
    detectorCount: number;
    ruleCount: number;
}

/**
 * Factory to create a scan response
 */
export function createScanResponse(
    status: GuardianScanResponse['status'],
    score: number,
    signals: Signal[],
    violations: PolicyViolation[],
    profileUsed: string
): GuardianScanResponse {
    return {
        status,
        score,
        signals,
        violations,
        auditId: crypto.randomUUID(),
        correctionHints: generateCorrectionHints(violations),
        scannedAt: new Date(),
        profileUsed,
    };
}

/**
 * Generate correction hints from violations
 */
function generateCorrectionHints(violations: PolicyViolation[]): string[] {
    const hints: string[] = [];

    for (const v of violations) {
        switch (v.category) {
            case 'MANIPULATION':
                hints.push('Soften sales language; avoid urgency-inducing phrases like "Buy now!"');
                break;
            case 'GDPR_CONSENT':
                hints.push('Ensure explicit consent is obtained before collecting personal data.');
                break;
            case 'TRANSPARENCY':
                hints.push('Clearly disclose AI-generated content to viewers.');
                break;
            default:
                hints.push(v.message);
        }
    }

    return [...new Set(hints)]; // Deduplicate
}
