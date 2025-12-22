import { NextResponse } from 'next/server';
import { mapSignalsToObligations, getObligationsForRiskClass } from '@/domain/services/AIActObligationMapper';
import { RiskClassification } from '@/domain/entities/ConversationRecord';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');
    const riskClass = (searchParams.get('riskClass') as RiskClassification) || 'HIGH';

    // Get base obligations for risk class
    const obligations = getObligationsForRiskClass(riskClass);

    return NextResponse.json({
        systemId: systemId || 'unknown',
        riskClass,
        obligations,
        count: obligations.length,
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { signals, riskClass } = body;

        if (!signals || !riskClass) {
            return NextResponse.json(
                { error: 'Missing signals or riskClass' },
                { status: 400 }
            );
        }

        const obligations = mapSignalsToObligations(signals, riskClass);

        return NextResponse.json({
            obligations,
            count: obligations.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
