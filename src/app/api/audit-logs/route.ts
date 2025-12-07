/**
 * GET /api/audit-logs
 * Retrieve recent audit logs for dashboard
 */
import { NextRequest, NextResponse } from 'next/server';
import { auditLogRepository, exportAuditLogsToCSV } from '@/infrastructure/supabase/AuditLogRepository';
import { apiKeyRepository } from '@/infrastructure/supabase/ApiKeyRepository';
import { formatAuditLogForExport } from '@/domain/entities/AuditLog';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const apiKey = searchParams.get('apiKey') || request.headers.get('x-api-key');

    // Validate API key for audit access
    if (apiKey) {
        const key = await apiKeyRepository.validateKey(apiKey);
        if (!key) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
        }
    }

    try {
        const logs = await auditLogRepository.findRecent(limit);

        // Export as CSV if requested
        if (format === 'csv') {
            const csv = exportAuditLogsToCSV(logs);
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
                },
            });
        }

        // Return JSON by default
        return NextResponse.json({
            logs: logs.map(formatAuditLogForExport),
            count: logs.length,
        });
    } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch audit logs' },
            { status: 500 }
        );
    }
}
