/**
 * EU AI Act Article 47 + Annex V - Declaration of Conformity
 * 
 * This entity represents the EU Declaration of Conformity required for
 * high-risk AI systems under the EU AI Act.
 */

export interface SystemInfo {
    name: string;
    type: string;
    intendedPurpose: string;
    version: string;
}

export interface ProviderInfo {
    name: string;
    address: string;
    contactEmail: string;
    euRepresentative: string | null;
}

export interface AssessmentResults {
    compliant: boolean;
    score: number;
    violations: { ruleId: string; message: string }[];
    lastAssessmentDate: Date;
}

export interface DeclarationOfConformity {
    id: string;
    systemName: string;
    systemType: string;
    systemVersion: string;
    intendedPurpose: string;

    providerName: string;
    providerAddress: string;
    euRepresentative: string | null;

    issuedUnderSoleResponsibility: boolean;
    conformsToAIAct: boolean;
    conformsToGDPR: boolean;

    regulationReference: string;
    harmonizedStandards: string[];

    notifiedBodyName?: string;
    notifiedBodyId?: string;
    conformityProcedure?: string;
    certificateId?: string;

    issueDate: Date;
    issuePlace: string;

    signatoryName: string;
    signatoryRole: string;
    signature?: string;

    assessmentScore: number;
    assessmentDate: Date;
}

export interface DocSignatoryOptions {
    signatoryName?: string;
    signatoryRole?: string;
    issuePlace?: string;
}

/**
 * Factory function to create a Declaration of Conformity
 * Throws if the system is not compliant
 */
export function createDeclarationOfConformity(
    systemInfo: SystemInfo,
    providerInfo: ProviderInfo,
    assessmentResults: AssessmentResults,
    options: DocSignatoryOptions = {}
): DeclarationOfConformity {
    if (!assessmentResults.compliant) {
        throw new Error('Cannot issue Declaration of Conformity for non-compliant system');
    }

    return {
        id: crypto.randomUUID(),
        systemName: systemInfo.name,
        systemType: systemInfo.type,
        systemVersion: systemInfo.version,
        intendedPurpose: systemInfo.intendedPurpose,

        providerName: providerInfo.name,
        providerAddress: providerInfo.address,
        euRepresentative: providerInfo.euRepresentative,

        issuedUnderSoleResponsibility: true,
        conformsToAIAct: true,
        conformsToGDPR: true,

        regulationReference: 'Regulation (EU) 2024/1689',
        harmonizedStandards: ['ISO/IEC 42001', 'ISO/IEC 23894'],

        issueDate: new Date(),
        issuePlace: options.issuePlace || 'Berlin, Germany',

        signatoryName: options.signatoryName || 'Authorized Representative',
        signatoryRole: options.signatoryRole || 'Compliance Officer',

        assessmentScore: assessmentResults.score,
        assessmentDate: assessmentResults.lastAssessmentDate
    };
}
