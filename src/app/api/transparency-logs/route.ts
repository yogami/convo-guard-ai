import { NextResponse } from 'next/server';
import { transparencyLogRepository } from '@/infrastructure/supabase/TransparencyLogRepository';
import { TransparencyLog } from '@/domain/entities/TransparencyLog';

const repository = transparencyLogRepository;

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.systemId || !body.decisionType) {
            return NextResponse.json(
                { error: 'Missing required fields: systemId, decisionType' },
                { status: 400 }
            );
        }

        const log: TransparencyLog = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            ...body
        };

        await repository.save(log);

        return NextResponse.json({ success: true, id: log.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error saving transparency log:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');

    if (!systemId) {
        return NextResponse.json(
            { error: 'Missing systemId parameter' },
            { status: 400 }
        );
    }

    try {
        const logs = await repository.findBySystemId(systemId);
        return NextResponse.json({ logs });
    } catch (error: any) {
        console.error('Error fetching transparency logs:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
