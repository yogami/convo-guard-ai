/**
 * POST /api/validate
 * Main API endpoint for conversation compliance validation
 * 
 * Request: { transcript: string, apiKey?: string, messages?: ConversationMessage[], policyPackId?: string }
 * Response: { compliant: boolean, score: number, risks: Risk[], audit_id: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { ConversationMessage, createConversation, createValidationResult, Risk } from '@/domain/entities/Conversation';
import { ValidateConversation } from '@/domain/usecases/ValidateConversation';
import { PolicyEngine, policyEngine } from '@/lib/compliance-engine/policy_engine/PolicyEngine';

// Repositories & Services
import { apiKeyRepository } from '@/infrastructure/supabase/ApiKeyRepository';
import { auditLogRepository } from '@/infrastructure/supabase/AuditLogRepository';
import { alertService } from '@/domain/services/AlertService';
import { createAuditLog } from '@/domain/entities/AuditLog';
import { safeLogger } from '@/lib/safeLogger';
import { errorReporter } from '@/lib/errorReporter';

export const runtime = 'nodejs'; // Ensure we use Node runtime for crypto support

export interface ValidateRequest {
    transcript?: string;
    messages?: ConversationMessage[];
    apiKey?: string;
    policyPackId?: string;
}

export interface ValidateResponse {
    compliant: boolean;
    score: number;
    policyPackId: string;
    risks: {
        category: string;
        severity: string;
        message: string;
        ruleId?: string;
        regulationIds?: string[];
    }[];
    audit_id: string;
    execution_time_ms: number;
}



export async function POST(request: Request) {
    const startTime = Date.now();
    try {
        const body: ValidateRequest = await request.json();

        // Validate request
        if (!body.transcript && !body.messages) {
            return NextResponse.json(
                { error: 'Either transcript or messages is required' },
                { status: 400 }
            );
        }

        // Validate API key if provided
        let apiKeyId: string | undefined;
        if (body.apiKey) {
            const apiKey = await apiKeyRepository.validateKey(body.apiKey);
            if (!apiKey) {
                return NextResponse.json(
                    { error: 'Invalid API key' },
                    { status: 401 }
                );
            }
            if (apiKeyRepository.isRateLimited(apiKey)) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded', limit: apiKey.requestsLimit },
                    { status: 429 }
                );
            }
            apiKeyId = apiKey.id;
            await apiKeyRepository.incrementRequestCount(apiKey.id);
        }

        // Create conversation from transcript or messages
        let messages: ConversationMessage[];
        let transcript: string;

        if (body.messages && body.messages.length > 0) {
            messages = body.messages.map(m => ({
                ...m,
                timestamp: new Date(m.timestamp),
            }));
            transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n');
        } else {
            transcript = body.transcript!;
            // Parse transcript into messages (simple heuristic)
            messages = parseTranscript(transcript);
        }

        const conversation = createConversation(messages);

        // --- NEW POLICY ENGINE EXECUTION ---
        // Use provided policyPackId or default to Mental Health EU V1
        const policyPackId = body.policyPackId || 'MENTAL_HEALTH_EU_V1';

        const evaluation = await policyEngine.evaluate(conversation, policyPackId);

        // Map Evaluation Violations to "Risks" for backward compatibility
        const mappedRisks: Risk[] = evaluation.violations.map(v => ({
            category: v.category as any,
            severity: v.severity,
            message: v.message,
            weight: v.scoreImpact,
            triggeredBy: v.triggerSignal?.metadata?.triggerText,
            regulationIds: v.regulationIds
        }));

        // --- END ---

        const executionTimeMs = Date.now() - startTime;

        // Reconstruct ValidationResult for persistence
        // (Note: PolicyEngine calculated score/compliant already, but we need to match the type expected by createAuditLog)
        const result = createValidationResult(mappedRisks, evaluation.auditId);

        // Override with engine's exact calculation if difference exists (should differ only by custom logic)
        // Actually createValidationResult re-calculates. 
        // For now, let's rely on createValidationResult to ensure consistency with passed risks.

        // Create and save audit log
        let auditLogId = evaluation.auditId;
        try {
            const auditLog = createAuditLog(conversation.id, result, {
                apiKeyId,
                clientIp: request.headers.get('x-forwarded-for') || undefined,
                userAgent: request.headers.get('user-agent') || undefined,
                requestDurationMs: executionTimeMs,
            });
            auditLogId = auditLog.id;

            // Trigger Alerts if necessary (Non-blocking)
            alertService.checkAndAlert(result, { auditId: auditLog.id, transcript }).catch(e => console.error('Alert failed:', e));

            // Save audit log (non-blocking)
            auditLogRepository.save(auditLog, transcript).catch(e => console.error('Audit save failed:', e));
        } catch (logError) {
            console.error('Audit log creation failed:', logError);
        }

        // Return response
        const response: ValidateResponse = {
            compliant: result.compliant,
            score: result.score,
            policyPackId: policyPackId,
            risks: evaluation.violations.map(v => ({
                category: v.category,
                severity: v.severity,
                message: v.message,
                ruleId: v.ruleId,
                regulationIds: v.regulationIds,
            })),
            audit_id: auditLogId,
            execution_time_ms: Math.round(executionTimeMs),
        };

        return NextResponse.json(response);

    } catch (error: any) {
        // Use safeLogger (CodeQL: js/log-injection)
        const errorMessage = error instanceof Error ? error.message : String(error);
        safeLogger.error(`Fatal Validation error: ${errorMessage}`);

        // Trigger Self-Healing Agent
        errorReporter.report(error, { endpoint: '/api/validate' });

        return NextResponse.json(
            { error: 'Internal server error', details: error?.message || String(error) },
            { status: 500 }
        );
    }
}

/**
 * Parse a transcript string into conversation messages
 */
function parseTranscript(transcript: string): ConversationMessage[] {
    const lines = transcript.split('\n').filter(line => line.trim());
    const messages: ConversationMessage[] = [];

    for (const line of lines) {
        // Use indexOf for role detection to avoid ReDoS (CodeQL: js/polynomial-redos)
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const prefix = line.substring(0, colonIndex).toLowerCase().trim();
            if (prefix === 'user' || prefix === 'assistant' || prefix === 'system') {
                messages.push({
                    role: prefix as 'user' | 'assistant' | 'system',
                    content: line.substring(colonIndex + 1).trim(),
                    timestamp: new Date(),
                });
                continue;
            }
        }
        // Default to user message if no valid role prefix
        messages.push({
            role: 'user',
            content: line.trim(),
            timestamp: new Date(),
        });
    }

    return messages.length > 0 ? messages : [{
        role: 'user',
        content: transcript,
        timestamp: new Date(),
    }];
}

function deduplicateRisks(risks: Risk[]): Risk[] {
    // Kept for reference but unused in new flow as simple dedupe happens in Engine
    const severityOrder: Record<Risk['severity'], number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const riskMap = new Map<string, Risk>();

    for (const risk of risks) {
        const existing = riskMap.get(risk.category);
        if (!existing || severityOrder[risk.severity] > severityOrder[existing.severity]) {
            riskMap.set(risk.category, risk);
        }
    }

    return Array.from(riskMap.values());
}
