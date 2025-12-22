import { NextResponse } from 'next/server';
import { docGeneratorService, DocGeneratorInput } from '@/domain/services/DocGeneratorService';
import { docRepository } from '@/infrastructure/supabase/DocRepository';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body: DocGeneratorInput = await request.json();

        // 1. Validate Input
        if (!body.systemInfo || !body.providerInfo || !body.assessmentResults) {
            return NextResponse.json(
                { error: 'Missing required fields: systemInfo, providerInfo, assessmentResults' },
                { status: 400 }
            );
        }

        // Convert string dates to Date objects if necessary
        if (typeof body.assessmentResults.lastAssessmentDate === 'string') {
            body.assessmentResults.lastAssessmentDate = new Date(body.assessmentResults.lastAssessmentDate);
        }

        // 2. Validate Compliance
        // Article 47: DoC can only be issued if the system is compliant
        if (!body.assessmentResults.compliant) {
            return NextResponse.json(
                {
                    error: 'Cannot issue Declaration of Conformity for non-compliant system.',
                    violations: body.assessmentResults.violations
                },
                { status: 422 } // Unprocessable Entity
            );
        }

        // 3. Generate DoC
        const doc = docGeneratorService.generateDoc(body);

        // 4. Save to Repository
        await docRepository.save(doc);

        // 5. Generate Output Formats
        // For this MVP, we return the JSON data and an HTML string
        // In a real app, we might generate a PDF and upload it to storage
        const html = docGeneratorService.exportToHTML(doc);

        return NextResponse.json({
            success: true,
            id: doc.id,
            doc: doc,
            html: html
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error generating Declaration of Conformity:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
