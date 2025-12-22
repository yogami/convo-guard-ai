/**
 * IncidentReportBuilder
 * Builds regulatory-ready incident reports
 * 
 * Feature 2: Serious Incident Radar
 */

import { DetectedIncident } from './IncidentDetectionService';
import { IncidentCategory, IncidentSeverity, INCIDENT_TAXONOMY } from './IncidentTaxonomy';

export interface IncidentReport {
    incidentId: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    description: string;
    impactAssessment: string;
    mitigations: string[];
    timeline: {
        detected: string;
        reported?: string;
        resolved?: string;
    };
    versionInfo: {
        modelVersion?: string;
        promptVersion?: string;
        policyPackVersion?: string;
    };
    regulationRefs: string[];
    recurrenceRisk: 'HIGH' | 'MEDIUM' | 'LOW';
    generatedAt: string;
}

/**
 * Mitigation recommendations by category
 */
const MITIGATION_RECOMMENDATIONS: Record<IncidentCategory, string[]> = {
    'SELF_HARM_MISHANDLING': [
        'Review and strengthen crisis detection rules',
        'Implement immediate escalation to human counselor',
        'Add additional suicide risk signal patterns',
        'Review prompt engineering for crisis sensitivity'
    ],
    'DANGEROUS_MEDICAL_ADVICE': [
        'Block all dosage and prescription recommendations',
        'Add medical disclaimer to all health-related responses',
        'Implement clinical evidence verification',
        'Review integration with licensed healthcare providers'
    ],
    'DISCRIMINATORY_DECISION': [
        'Audit training data for bias',
        'Implement fairness metrics monitoring',
        'Review decision criteria for protected characteristics',
        'Add human oversight for high-stakes decisions'
    ],
    'SAFETY_PROTOCOL_VIOLATION': [
        'Review and strengthen safety guardrails',
        'Implement additional jailbreak detection',
        'Add prompt injection protection',
        'Conduct adversarial testing'
    ]
};

/**
 * Build incident report for regulatory submission
 */
export function buildIncidentReport(incident: DetectedIncident): IncidentReport {
    const taxonomy = INCIDENT_TAXONOMY[incident.category];

    return {
        incidentId: incident.id,
        category: incident.category,
        severity: incident.severity,
        description: incident.description,
        impactAssessment: generateImpactAssessment(incident),
        mitigations: MITIGATION_RECOMMENDATIONS[incident.category] || [],
        timeline: {
            detected: incident.detectedAt.toISOString()
        },
        versionInfo: {},
        regulationRefs: incident.regulationRefs,
        recurrenceRisk: assessRecurrenceRisk(incident),
        generatedAt: new Date().toISOString()
    };
}

function generateImpactAssessment(incident: DetectedIncident): string {
    const severityImpact: Record<IncidentSeverity, string> = {
        'CRITICAL': 'Immediate risk to user safety or fundamental rights. Requires urgent response.',
        'HIGH': 'Significant risk that could lead to harm if unaddressed. Priority remediation required.',
        'MEDIUM': 'Moderate impact on user experience or trust. Should be addressed in upcoming release.',
        'LOW': 'Minor issue with limited impact. Can be addressed as part of regular maintenance.'
    };

    return `${severityImpact[incident.severity]} Trigger: ${incident.triggerSignals[0]?.type || 'Unknown'}`;
}

function assessRecurrenceRisk(incident: DetectedIncident): 'HIGH' | 'MEDIUM' | 'LOW' {
    // Higher confidence signals indicate systematic issues
    const maxConfidence = Math.max(...incident.triggerSignals.map(s => s.confidence));
    if (maxConfidence > 0.9) return 'HIGH';
    if (maxConfidence > 0.7) return 'MEDIUM';
    return 'LOW';
}

/**
 * IncidentReportBuilder class
 */
export class IncidentReportBuilder {
    private incident: DetectedIncident | null = null;
    private additionalMitigations: string[] = [];

    forIncident(incident: DetectedIncident): this {
        this.incident = incident;
        return this;
    }

    addMitigation(mitigation: string): this {
        this.additionalMitigations.push(mitigation);
        return this;
    }

    build(): IncidentReport {
        if (!this.incident) {
            throw new Error('No incident provided');
        }

        const report = buildIncidentReport(this.incident);
        report.mitigations = [...report.mitigations, ...this.additionalMitigations];
        return report;
    }

    exportAsJSON(): string {
        return JSON.stringify(this.build(), null, 2);
    }

    exportAsMarkdown(): string {
        const report = this.build();

        return `# Serious Incident Report

**Incident ID:** ${report.incidentId}
**Category:** ${report.category}
**Severity:** ${report.severity}
**Detected:** ${report.timeline.detected}

---

## Description

${report.description}

## Impact Assessment

${report.impactAssessment}

## Mitigation Recommendations

${report.mitigations.map(m => `- ${m}`).join('\n')}

## Recurrence Risk

**${report.recurrenceRisk}**

## Regulatory References

${report.regulationRefs.map(r => `- ${r}`).join('\n')}

---

*Generated: ${report.generatedAt}*
`;
    }
}
