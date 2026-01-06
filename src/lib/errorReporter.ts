
import { safeLogger } from './safeLogger';

// Configuration (should be Env Var)
const ERROR_WEBHOOK_URL = process.env.AGENT_TRIGGER_URL || 'http://localhost:4000/api/incidents/report';
const PROJECT_ID = 'convo-guard-ai';

interface ErrorReport {
    projectId: string;
    error: string;
    stackTrace?: string;
    metadata?: any;
    timestamp: string;
}

export const errorReporter = {
    report: async (error: any, metadata?: any) => {
        try {
            const report: ErrorReport = {
                projectId: PROJECT_ID,
                error: error instanceof Error ? error.message : String(error),
                stackTrace: error instanceof Error ? error.stack : undefined,
                metadata,
                timestamp: new Date().toISOString()
            };

            // Non-blocking fire-and-forget
            fetch(ERROR_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            }).then(res => {
                if (res.ok) {
                    safeLogger.info('[ErrorReporter] Incident reported to Agent Manager');
                } else {
                    safeLogger.warn(`[ErrorReporter] Failed to report incident: ${res.status}`);
                }
            }).catch(err => {
                safeLogger.warn(`[ErrorReporter] Network error reporting incident: ${err}`);
            });

        } catch (e) {
            // Never fail the app because of reporting failure
            safeLogger.error(`[ErrorReporter] Critical failure in reporter: ${e}`);
        }
    }
};
