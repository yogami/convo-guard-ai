import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export interface LifecycleStatus {
    systemId: string;
    currentStage: 'DESIGN' | 'DEVELOPMENT' | 'VALIDATION' | 'MARKET' | 'POST_MARKET';
    stageHistory: {
        stage: string;
        enteredAt: string;
        completedAt?: string;
    }[];
    complianceScore: number;
    nextMilestone?: string;
}

// In-memory store for demo purposes
const lifecycleStore: Map<string, LifecycleStatus> = new Map();

// Initialize with demo data
lifecycleStore.set('ConvoGuard-Demo', {
    systemId: 'ConvoGuard-Demo',
    currentStage: 'DEVELOPMENT',
    stageHistory: [
        { stage: 'DESIGN', enteredAt: '2024-01-15T00:00:00Z', completedAt: '2024-03-01T00:00:00Z' },
        { stage: 'DEVELOPMENT', enteredAt: '2024-03-01T00:00:00Z' }
    ],
    complianceScore: 92,
    nextMilestone: 'Complete adversarial testing suite'
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');

    if (!systemId) {
        // Return all systems
        const allSystems = Array.from(lifecycleStore.values());
        return NextResponse.json({ systems: allSystems });
    }

    const status = lifecycleStore.get(systemId);

    if (!status) {
        // Return default for unknown system
        return NextResponse.json({
            systemId,
            currentStage: 'DESIGN',
            stageHistory: [],
            complianceScore: 0,
            nextMilestone: 'Begin compliance assessment'
        });
    }

    return NextResponse.json(status);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.systemId || !body.stage) {
            return NextResponse.json(
                { error: 'Missing systemId or stage' },
                { status: 400 }
            );
        }

        const existing = lifecycleStore.get(body.systemId);

        const newStatus: LifecycleStatus = {
            systemId: body.systemId,
            currentStage: body.stage,
            stageHistory: existing?.stageHistory || [],
            complianceScore: body.complianceScore || existing?.complianceScore || 0,
            nextMilestone: body.nextMilestone
        };

        // Add to history
        newStatus.stageHistory.push({
            stage: body.stage,
            enteredAt: new Date().toISOString()
        });

        lifecycleStore.set(body.systemId, newStatus);

        return NextResponse.json({ success: true, status: newStatus });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
