/**
 * POST /api/validate
 * Main API endpoint for conversation compliance validation
 * 
 * Request: { transcript: string, apiKey?: string, messages?: ConversationMessage[] }
 * Response: { compliant: boolean, score: number, risks: Risk[], audit_id: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { createConversation, ConversationMessage, createValidationResult, Risk } from '@/domain/entities/Conversation';
import { createAuditLog } from '@/domain/entities/AuditLog';
import { RuleRegistry } from '@/domain/rules/RuleRegistry';
import { apiKeyRepository } from '@/infrastructure/supabase/ApiKeyRepository';
import { auditLogRepository } from '@/infrastructure/supabase/AuditLogRepository';
import { aiService, convertAIRisks } from '@/infrastructure/openai/OpenAIService';
import { randomUUID } from 'crypto';
import { alertService } from '@/domain/services/AlertService';

export interface ValidateRequest {
    transcript?: string;
    messages?: ConversationMessage[];
    apiKey?: string;
}

export interface ValidateResponse {
    compliant: boolean;
    score: number;
    risks: {
        category: string;
        severity: string;
        message: string;
    }[];
    audit_id: string;
    execution_time_ms: number;
}

export const runtime = 'edge';

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

        // Run rule-based validation
        let ruleRisks: Risk[] = [];
        try {
            const registry = new RuleRegistry();
            const ruleResults = await registry.validateAll(conversation);
            ruleRisks = registry.aggregateRisks(ruleResults);
        } catch (ruleError) {
            console.error('Rule validation failed:', ruleError);
            // Don't crash, just proceed without rules? Or generic error?
            // For now, proceed.
        }

        // Run AI-based analysis (if API key configured)
        let aiRisks: Risk[] = [];
        try {
            const aiAnalysis = await aiService.analyzeTranscript(transcript);
            aiRisks = convertAIRisks(aiAnalysis);
        } catch (aiError) {
            console.error('AI analysis failed:', aiError);
            // Proceed without AI risks
        }

        // Combine and deduplicate risks
        const allRisks = deduplicateRisks([...ruleRisks, ...aiRisks]);

        // Create validation result
        const auditId = crypto.randomUUID();
        const result = createValidationResult(allRisks, auditId);

        const executionTimeMs = Date.now() - startTime;

        // Create and save audit log
        let auditLogId = auditId;
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
            risks: result.risks.map(r => ({
                category: r.category,
                severity: r.severity,
                message: r.message,
            })),
            audit_id: auditLogId,
            execution_time_ms: Math.round(executionTimeMs),
        };

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Fatal Validation error:', error);
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
        const match = line.match(/^(user|assistant|system):\s*(.+)$/i);
        if (match) {
            messages.push({
                role: match[1].toLowerCase() as 'user' | 'assistant' | 'system',
                content: match[2].trim(),
                timestamp: new Date(),
            });
        } else {
            // Default to user message if no role prefix
            messages.push({
                role: 'user',
                content: line.trim(),
                timestamp: new Date(),
            });
        }
    }

    return messages.length > 0 ? messages : [{
        role: 'user',
        content: transcript,
        timestamp: new Date(),
    }];
}

/**
 * Deduplicate risks by category, keeping highest severity
 */
function deduplicateRisks(risks: Risk[]): Risk[] {
    const severityOrder: Record<Risk['severity'], number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const riskMap = new Map<string, Risk>();

    for (const risk of risks) {
        const existing = riskMap.get(risk.category);
        if (!existing || severityOrder[risk.severity] > severityOrder[existing.severity]) {
            riskMap.set(risk.category, risk);
        }
    }

    return Array.from(riskMap.values());
}
