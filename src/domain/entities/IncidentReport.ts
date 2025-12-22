export interface IncidentReport {
    id: string;
    timestamp: Date;
    systemId: string;
    incidentType: 'CORRECTIVE_ACTION_FAILURE' | 'SYSTEMIC_RISK_MATERIALIZED' | 'UNEXPECTED_BEHAVIOR' | 'SECURITY_BREACH';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    correctiveMeasures?: string;
    reportedToAiOffice: boolean;
    metadata?: Record<string, unknown>;
}
