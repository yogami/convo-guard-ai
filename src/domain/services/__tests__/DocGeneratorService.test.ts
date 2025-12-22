import { describe, it, expect, beforeEach } from 'vitest';
import { DocGeneratorService } from '../DocGeneratorService';
import {
    createDeclarationOfConformity,
    SystemInfo,
    ProviderInfo,
    AssessmentResults
} from '../../entities/DeclarationOfConformity';

describe('DocGeneratorService', () => {
    let service: DocGeneratorService;

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

    beforeEach(() => {
        service = new DocGeneratorService();
    });

    describe('generateDoc', () => {
        it('should generate a Declaration of Conformity from valid input', () => {
            const doc = service.generateDoc({
                systemInfo: sampleSystemInfo,
                providerInfo: sampleProviderInfo,
                assessmentResults: passingAssessment
            });

            expect(doc.id).toBeDefined();
            expect(doc.conformsToAIAct).toBe(true);
            expect(doc.providerName).toBe('Acme Corp');
        });
    });

    describe('exportToJSON', () => {
        it('should export DoC to valid JSON string', () => {
            const doc = createDeclarationOfConformity(
                sampleSystemInfo,
                sampleProviderInfo,
                passingAssessment
            );

            const json = service.exportToJSON(doc);
            const parsed = JSON.parse(json);

            expect(parsed.systemName).toBe('HR Recruiting Bot');
            expect(parsed.conformsToAIAct).toBe(true);
        });
    });

    describe('exportToHTML', () => {
        it('should export DoC to HTML document', () => {
            const doc = createDeclarationOfConformity(
                sampleSystemInfo,
                sampleProviderInfo,
                passingAssessment
            );

            const html = service.exportToHTML(doc);

            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('EU Declaration of Conformity');
            expect(html).toContain('HR Recruiting Bot');
            expect(html).toContain('Acme Corp');
            expect(html).toContain('Regulation (EU) 2024/1689');
        });
    });
});
