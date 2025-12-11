/**
 * Alert Service
 * Responsible for notifying responsible parties of compliance violations.
 * Supports swappable providers (Email, Slack, Webhook).
 */
import { ValidationResult, Risk } from '../entities/Conversation';

export interface AlertProvider {
    sendAlert(message: string, details: any): Promise<void>;
}

export class ConsoleAlertProvider implements AlertProvider {
    async sendAlert(message: string, details: any): Promise<void> {
        console.error(' [ALERT] 🚨 ' + message);
        console.error(' [ALERT DETAILS]', JSON.stringify(details, null, 2));
    }
}

export class AlertService {
    private provider: AlertProvider;

    constructor(provider: AlertProvider = new ConsoleAlertProvider()) {
        this.provider = provider;
    }

    async checkAndAlert(result: ValidationResult, context?: any): Promise<void> {
        if (!result.compliant) {
            const highRisks = result.risks.filter(r => r.severity === 'HIGH');

            if (highRisks.length > 0) {
                await this.notifyResponsibleParties(highRisks, context);
            }
        }
    }

    private async notifyResponsibleParties(risks: Risk[], context?: any) {
        const message = `Critical Compliance Violation Detected! Found ${risks.length} HIGH severity risks.`;
        const emailBody = {
            subject: '🚨 URGENT: ConvoGuard Policy Violation',
            recipient: 'compliance-officer@example.com', // Configurable
            timestamp: new Date().toISOString(),
            risks: risks.map(r => ({
                category: r.category,
                message: r.message,
                trigger: r.triggeredBy
            })),
            conversationContext: context
        };

        await this.provider.sendAlert(message, emailBody);
    }
}

export const alertService = new AlertService();
