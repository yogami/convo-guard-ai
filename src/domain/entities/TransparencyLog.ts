export interface TransparencyLog {
    id: string;
    timestamp: Date;
    systemId: string;
    decisionType: 'SCREENING' | 'EVALUATION' | 'REJECTION' | 'OFFER' | 'GENERAL';
    inputSummary: string;
    outputDecision: string;
    explanationProvided: boolean;
    humanOversight: boolean;
    auditTrail: string[];
    regulationReferences: string[];
}
