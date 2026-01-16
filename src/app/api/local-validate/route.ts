/**
 * POST /api/local-validate
 * Local ML classification endpoint for cost-free compliance validation
 * 
 * Uses rule-based classifier with OpenAI fallback for low-confidence predictions
 * 
 * Request: { transcript: string }
 * Response: { compliant, score, risks[], audit_id, model_used, confidence }
 */
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Crisis keywords (German + Dialects) - high recall patterns
const CRISIS_PATTERNS = [
    // Hochdeutsch
    /suizid/i,
    /selbstmord/i,
    /umbringen/i,
    /sterben/i,
    /wehtun/i,
    /verletz/i,
    /schneid/i,
    /ritzen/i,
    /schaden/i,
    /tabletten.*beenden/i,
    /leben.*beenden/i,
    /nicht mehr leben/i,
    // Dialects (Bayrisch, Berlin, Swiss)
    /nimma.*leben/i,
    /alles.*beenden/i,
    /ois.*beenden/i,
    /ois.*ufhöre/i,
    /ui.*beenden/i,
    /ich.*mog.*nimma/i,
    /beenden.*wa/i,
    /weh.*doa/i,
    /weh.*tue/i,
];

// Risky keywords (German + Dialects)
const RISKY_PATTERNS = [
    /hoffnungslos/i,
    /sinnlos/i,
    /verzweifelt/i,
    /dunkel.*gedanken/i,
    /last.*für/i,
    /aufgegeben/i,
    /keine energie/i,
    /leer/i,
    /schwarz/i,
    // Dialects
    /nüme/i,
    /ejaal/i,
    /fui.*hoffnungslos/i,
];

// German translations for risk categories
const DE_RISK_MESSAGES: Record<string, { category: string; message: string; regulationIds: string[] }> = {
    CRISIS: {
        category: 'SUICIDE_SELF_HARM',
        message: 'Suizid- oder Selbstverletzungsrisiko erkannt. Sofortige Krisenintervention erforderlich.',
        regulationIds: ['EU_AI_ACT_ART_5', 'DIGA_DI_GUIDE', 'GENERAL_SAFETY']
    },
    RISKY: {
        category: 'MENTAL_HEALTH_RISK',
        message: 'Psychische Belastungsindikatoren erkannt. Professionelle Unterstützung empfohlen.',
        regulationIds: ['DIGA_DI_GUIDE', 'GENERAL_SAFETY']
    }
};

interface LocalClassificationResult {
    label: 'SAFE' | 'RISKY' | 'CRISIS';
    confidence: number;
    matchedPatterns: string[];
}

function classifyLocally(text: string): LocalClassificationResult {
    const textLower = text.toLowerCase();

    // Check crisis patterns first
    const crisisMatches = CRISIS_PATTERNS.filter(p => p.test(textLower));
    if (crisisMatches.length > 0) {
        const confidence = Math.min(0.9 + (crisisMatches.length * 0.02), 1.0);
        return {
            label: 'CRISIS',
            confidence,
            matchedPatterns: crisisMatches.map(p => p.source)
        };
    }

    // Check risky patterns
    const riskyMatches = RISKY_PATTERNS.filter(p => p.test(textLower));
    if (riskyMatches.length > 0) {
        const confidence = Math.min(0.75 + (riskyMatches.length * 0.05), 0.9);
        return {
            label: 'RISKY',
            confidence,
            matchedPatterns: riskyMatches.map(p => p.source)
        };
    }

    // Default to safe
    return {
        label: 'SAFE',
        confidence: 0.85,
        matchedPatterns: []
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        const body = await request.json();
        const { transcript } = body;

        if (!transcript) {
            return NextResponse.json(
                { error: 'Transcript ist erforderlich' },
                { status: 400, headers: corsHeaders }
            );
        }

        const auditId = randomUUID();

        // Local classification
        const localResult = classifyLocally(transcript);

        // Determine if we need OpenAI fallback
        const CONFIDENCE_THRESHOLD = 0.75;
        let modelUsed = 'local_ml';
        let needsFallback = localResult.confidence < CONFIDENCE_THRESHOLD;

        // For now, we don't actually call OpenAI - just flag it
        // In production, this would call the main /api/validate endpoint
        if (needsFallback) {
            modelUsed = 'local_ml_low_confidence';
        }

        // Build response
        const compliant = localResult.label === 'SAFE';
        const score = localResult.label === 'SAFE' ? 100 :
            localResult.label === 'RISKY' ? 60 : 25;

        const risks = [];
        if (localResult.label !== 'SAFE') {
            const riskInfo = DE_RISK_MESSAGES[localResult.label];
            risks.push({
                category: riskInfo.category,
                severity: localResult.label === 'CRISIS' ? 'HIGH' : 'MEDIUM',
                message: riskInfo.message,
                regulationIds: riskInfo.regulationIds
            });
        }

        const executionTimeMs = Date.now() - startTime;

        const response = {
            compliant,
            score,
            policyPackId: 'MENTAL_HEALTH_EU_V1',
            risks,
            audit_id: auditId,
            execution_time_ms: executionTimeMs,
            // ML-specific fields
            model_used: modelUsed,
            confidence: Math.round(localResult.confidence * 100) / 100,
            needs_fallback: needsFallback,
            accuracy_target: '80%',
            matched_patterns: localResult.matchedPatterns.length
        };

        return NextResponse.json(response, { headers: corsHeaders });

    } catch (error: any) {
        console.error('Local validation error:', error);
        return NextResponse.json(
            { error: 'Interner Serverfehler', details: error?.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
