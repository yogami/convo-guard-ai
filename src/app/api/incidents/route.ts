import { NextResponse } from 'next/server';
import { incidentReportRepository } from '@/infrastructure/supabase/IncidentReportRepository';
import { IncidentReport } from '@/domain/entities/IncidentReport';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate basic fields
        if (!body.systemId || !body.incidentType || !body.severity || !body.description) {
            return NextResponse.json(
                { error: 'Missing required fields: systemId, incidentType, severity, description' },
                { status: 400 }
            );
        }

        // Article 52a/54 logic: Critical incidents might auto-report to AI Office
        // For MVP, we respect the user's flag or default to false
        const reportedToAiOffice = body.reportedToAiOffice || false;

        const report: IncidentReport = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            ...body,
            reportedToAiOffice
        };

        await incidentReportRepository.save(report);

        if (report.severity === 'CRITICAL' && !reportedToAiOffice) {
            // In a real system, this might trigger an alert to the provider to report it urgently
            // console.warn('Critical incident not reported to AI Office!');
        }

        return NextResponse.json({
            success: true,
            id: report.id,
            message: 'Incident recorded successfully.'
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error saving incident report:', error);
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
        const incidents = await incidentReportRepository.findBySystemId(systemId);
        return NextResponse.json({ incidents });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
