import { describe, it, expect } from 'vitest';
import {
    DeclarationOfConformity,
    createDeclarationOfConformity,
    SystemInfo,
    ProviderInfo,
    AssessmentResults
} from '../DeclarationOfConformity';

describe('DeclarationOfConformity Entity', () => {
    const sampleSystemInfo: SystemInfo = {
        name: 'HR Recruiting Bot',
        type: 'HIGH_RISK_HR',
        intendedPurpose: 'Automated screening of job applications',
        version: '1.0.0'
    };

    const sampleProviderInfo: ProviderInfo = {
        name: 'Acme Corp',
        address: 'Unter den Linden 1, 10117 Berlin, Germany',
        contactEmail: 'compliance@acme.example',
        euRepresentative: null
    };

    const passingAssessment: AssessmentResults = {
        compliant: true,
        score: 95,
        violations: [],
        lastAssessmentDate: new Date('2025-12-15')
    };

    const failingAssessment: AssessmentResults = {
        compliant: false,
        score: 45,
        violations: [{ ruleId: 'RULE_AGE_BIAS', message: 'Age bias detected' }],
        lastAssessmentDate: new Date('2025-12-15')
    };

    it('should create a valid Declaration of Conformity for compliant system', () => {
        const doc = createDeclarationOfConformity(
            sampleSystemInfo,
            sampleProviderInfo,
            passingAssessment
        );

        expect(doc.id).toBeDefined();
        expect(doc.systemName).toBe('HR Recruiting Bot');
        expect(doc.providerName).toBe('Acme Corp');
        expect(doc.conformsToAIAct).toBe(true);
        expect(doc.issueDate).toBeInstanceOf(Date);
        expect(doc.issuedUnderSoleResponsibility).toBe(true);
    });

    it('should NOT create DoC for non-compliant system', () => {
        expect(() => createDeclarationOfConformity(
            sampleSystemInfo,
            sampleProviderInfo,
            failingAssessment
        )).toThrow('Cannot issue Declaration of Conformity for non-compliant system');
    });

    it('should include harmonized standards reference', () => {
        const doc = createDeclarationOfConformity(
            sampleSystemInfo,
            sampleProviderInfo,
            passingAssessment
        );

        expect(doc.harmonizedStandards).toContain('ISO/IEC 42001');
        expect(doc.regulationReference).toBe('Regulation (EU) 2024/1689');
    });

    it('should include signatory information', () => {
        const doc = createDeclarationOfConformity(
            sampleSystemInfo,
            sampleProviderInfo,
            passingAssessment,
            { signatoryName: 'Jane Doe', signatoryRole: 'CEO' }
        );

        expect(doc.signatoryName).toBe('Jane Doe');
        expect(doc.signatoryRole).toBe('CEO');
    });

    it('should have unique ID for each declaration', () => {
        const doc1 = createDeclarationOfConformity(sampleSystemInfo, sampleProviderInfo, passingAssessment);
        const doc2 = createDeclarationOfConformity(sampleSystemInfo, sampleProviderInfo, passingAssessment);

        expect(doc1.id).not.toBe(doc2.id);
    });
});
