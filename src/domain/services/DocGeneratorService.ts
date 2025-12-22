/**
 * DocGeneratorService
 * 
 * Generates EU Declaration of Conformity documents in various formats.
 * Complies with EU AI Act Article 47 + Annex V requirements.
 */

import {
    DeclarationOfConformity,
    createDeclarationOfConformity,
    SystemInfo,
    ProviderInfo,
    AssessmentResults,
    DocSignatoryOptions
} from '../entities/DeclarationOfConformity';

export interface DocGeneratorInput {
    systemInfo: SystemInfo;
    providerInfo: ProviderInfo;
    assessmentResults: AssessmentResults;
    options?: DocSignatoryOptions;
}

export class DocGeneratorService {
    /**
     * Generate a Declaration of Conformity from input data
     */
    generateDoc(input: DocGeneratorInput): DeclarationOfConformity {
        return createDeclarationOfConformity(
            input.systemInfo,
            input.providerInfo,
            input.assessmentResults,
            input.options
        );
    }

    /**
     * Export Declaration of Conformity to JSON string
     */
    exportToJSON(doc: DeclarationOfConformity): string {
        return JSON.stringify(doc, null, 2);
    }

    /**
     * Export Declaration of Conformity to HTML document
     * Suitable for printing or PDF conversion
     */
    exportToHTML(doc: DeclarationOfConformity): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>EU Declaration of Conformity - ${doc.systemName}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { text-align: center; border-bottom: 2px solid #003399; padding-bottom: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .eu-flag { font-size: 48px; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; color: #003399; border-bottom: 1px solid #ccc; }
        .field { margin: 10px 0; }
        .field-label { font-weight: bold; display: inline-block; width: 250px; }
        .signature { margin-top: 40px; border-top: 1px solid #000; padding-top: 20px; }
        .standards { background: #f0f0f0; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="eu-flag">🇪🇺</div>
        <h1>EU Declaration of Conformity</h1>
        <p><strong>Regulation (EU) 2024/1689 - Artificial Intelligence Act</strong></p>
    </div>

    <div class="section">
        <p class="section-title">1. AI System Information</p>
        <div class="field"><span class="field-label">System Name:</span> ${doc.systemName}</div>
        <div class="field"><span class="field-label">System Type:</span> ${doc.systemType}</div>
        <div class="field"><span class="field-label">Version:</span> ${doc.systemVersion}</div>
        <div class="field"><span class="field-label">Intended Purpose:</span> ${doc.intendedPurpose}</div>
    </div>

    <div class="section">
        <p class="section-title">2. Provider Information</p>
        <div class="field"><span class="field-label">Provider Name:</span> ${doc.providerName}</div>
        <div class="field"><span class="field-label">Address:</span> ${doc.providerAddress}</div>
        ${doc.euRepresentative ? `<div class="field"><span class="field-label">EU Representative:</span> ${doc.euRepresentative}</div>` : ''}
    </div>

    <div class="section">
        <p class="section-title">3. Declaration</p>
        <p>This declaration of conformity is issued under the sole responsibility of <strong>${doc.providerName}</strong>.</p>
        <p>The AI system described above conforms to:</p>
        <ul>
            <li><strong>${doc.regulationReference}</strong> (EU AI Act)</li>
            ${doc.conformsToGDPR ? '<li><strong>Regulation (EU) 2016/679</strong> (GDPR)</li>' : ''}
        </ul>
    </div>

    <div class="section">
        <p class="section-title">4. Harmonized Standards Applied</p>
        <div class="standards">
            <ul>
                ${doc.harmonizedStandards.map(s => `<li>${s}</li>`).join('\n                ')}
            </ul>
        </div>
    </div>

    <div class="section">
        <p class="section-title">5. Conformity Assessment</p>
        <div class="field"><span class="field-label">Assessment Score:</span> ${doc.assessmentScore}%</div>
        <div class="field"><span class="field-label">Assessment Date:</span> ${doc.assessmentDate.toISOString().split('T')[0]}</div>
    </div>

    <div class="signature">
        <p class="section-title">6. Signature</p>
        <div class="field"><span class="field-label">Signed at:</span> ${doc.issuePlace}, ${doc.issueDate.toISOString().split('T')[0]}</div>
        <div class="field"><span class="field-label">Name:</span> ${doc.signatoryName}</div>
        <div class="field"><span class="field-label">Role:</span> ${doc.signatoryRole}</div>
        <div style="margin-top: 40px; border-bottom: 1px solid #000; width: 300px;"></div>
        <p><em>Signature</em></p>
    </div>

    <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        <p>Document ID: ${doc.id}</p>
        <p>Generated by ConvoGuard AI Compliance Platform</p>
    </footer>
</body>
</html>`;
    }
}

// Export singleton instance
export const docGeneratorService = new DocGeneratorService();
