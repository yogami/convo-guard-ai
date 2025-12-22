import { NextResponse } from 'next/server';
import { DocFragmentBuilder } from '@/domain/services/DocFragmentBuilder';
import { createConversationRecord } from '@/domain/entities/ConversationRecord';
import { createEvaluationRecord } from '@/domain/entities/EvaluationRecord';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const systemId = searchParams.get('systemId') || 'ConvoGuard-Demo';

    // Create demo records for demonstration
    const mockConversationRecord = createConversationRecord({
        conversationId: 'demo-conv-1',
        systemId,
        riskClassification: 'HIGH',
        decisions: [{ type: 'ALLOW', reason: 'Compliant', confidence: 0.95, timestamp: new Date() }],
        modelVersion: 'gpt-4-0613',
        promptVersion: 'mh-v2.1',
        policyPackVersion: 'MENTAL_HEALTH_EU_V1'
    });

    const mockEvaluationRecord = createEvaluationRecord({
        conversationRecordId: mockConversationRecord.id,
        policiesApplied: ['MENTAL_HEALTH_EU_V1'],
        signalsDetected: [],
        obligationsTriggered: [
            { articleId: 'ART_9', articleName: 'Risk Management', requirement: 'Risk mgmt', complianceStatus: 'COMPLIANT' },
            { articleId: 'ART_12', articleName: 'Record-keeping', requirement: 'Logging', complianceStatus: 'COMPLIANT' }
        ],
        result: { compliant: true, score: 92, risks: [], auditId: 'demo-audit-001' }
    });

    const builder = new DocFragmentBuilder()
        .withConversationRecords([mockConversationRecord])
        .withEvaluationRecords([mockEvaluationRecord]);

    if (format === 'markdown') {
        const markdown = builder.exportAsMarkdown();
        return new NextResponse(markdown, {
            headers: { 'Content-Type': 'text/markdown' }
        });
    }

    const json = builder.exportAsJSON();
    return NextResponse.json(JSON.parse(json));
}
