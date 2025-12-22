/**
 * DocFragmentBuilder Service
 * Generates technical documentation evidence fragments for AI Act compliance
 * 
 * Produces evidence for:
 * - Art. 12: Record-keeping (logging)
 * - Art. 9: Risk management
 * - Art. 72: Post-market monitoring
 */

import { EvaluationRecord } from '../entities/EvaluationRecord';
import { ConversationRecord, RiskClassification } from '../entities/ConversationRecord';

export type EvidenceType = 'LOGGING' | 'RISK_MANAGEMENT' | 'POST_MARKET' | 'TRANSPARENCY' | 'HUMAN_OVERSIGHT';

export interface DocFragment {
    id: string;
    articleId: string;
    title: string;
    evidenceType: EvidenceType;
    content: string;
    metadata?: Record<string, unknown>;
    generatedAt: Date;
}

/**
 * Build Art. 12 logging evidence
 */
export function buildLoggingEvidence(evaluationRecords: EvaluationRecord[]): DocFragment {
    const recordCount = evaluationRecords.length;
    const policyPacks = [...new Set(evaluationRecords.flatMap(r => r.policiesApplied))];

    return {
        id: crypto.randomUUID(),
        articleId: 'ART_12',
        title: 'Record-keeping Evidence (Art. 12)',
        evidenceType: 'LOGGING',
        content: `This system implements automatic logging of AI system events in accordance with Article 12 of the EU AI Act.

**Logging Coverage:**
- ${recordCount} evaluation records captured
- Policy packs applied: ${policyPacks.join(', ')}
- Each evaluation includes: signals detected, obligations triggered, compliance result

**Data Integrity:**
- All records include cryptographic integrity hashes
- Timestamps are immutable and UTC-normalized
- Audit trail maintained for regulatory review`,
        metadata: {
            recordCount,
            policyPacksApplied: policyPacks,
            complianceRate: evaluationRecords.filter(r => r.result.compliant).length / recordCount
        },
        generatedAt: new Date()
    };
}

/**
 * Build Art. 9 risk management evidence
 */
export function buildRiskManagementEvidence(
    conversationRecords: ConversationRecord[],
    evaluationRecords: EvaluationRecord[]
): DocFragment {
    // Calculate risk distribution
    const riskDistribution: Record<RiskClassification, number> = {
        'MINIMAL': 0, 'LIMITED': 0, 'HIGH': 0, 'UNACCEPTABLE': 0
    };

    for (const record of conversationRecords) {
        riskDistribution[record.riskClassification]++;
    }

    // Identify mitigations applied
    const signalTypes = [...new Set(evaluationRecords.flatMap(r => r.signalsDetected.map(s => s.type)))];
    const gapsIdentified = evaluationRecords.flatMap(r => r.gaps);

    return {
        id: crypto.randomUUID(),
        articleId: 'ART_9',
        title: 'Risk Management Evidence (Art. 9)',
        evidenceType: 'RISK_MANAGEMENT',
        content: `This system implements a risk management system in accordance with Article 9 of the EU AI Act.

**Risk Classification Distribution:**
${Object.entries(riskDistribution).map(([k, v]) => `- ${k}: ${v} conversations`).join('\n')}

**Signal Detection:**
- ${signalTypes.length} signal types actively monitored
- Signals include: ${signalTypes.slice(0, 5).join(', ')}${signalTypes.length > 5 ? '...' : ''}

**Mitigation Measures:**
- Real-time policy evaluation
- Automatic flagging and escalation
- Human oversight triggers for HIGH risk classifications

**Identified Gaps:**
${gapsIdentified.length > 0 ? gapsIdentified.slice(0, 3).map(g => `- ${g.articleName}: ${g.requirement}`).join('\n') : '- No critical gaps identified'}`,
        metadata: {
            riskDistribution,
            signalTypes,
            gapCount: gapsIdentified.length
        },
        generatedAt: new Date()
    };
}

/**
 * Build Art. 72 post-market monitoring evidence
 */
export function buildPostMarketEvidence(
    evaluationRecords: EvaluationRecord[],
    period: { startDate: Date; endDate: Date }
): DocFragment {
    const totalEvaluations = evaluationRecords.length;
    const nonCompliantCount = evaluationRecords.filter(r => !r.result.compliant).length;
    const avgScore = evaluationRecords.reduce((sum, r) => sum + r.result.score, 0) / totalEvaluations || 0;

    return {
        id: crypto.randomUUID(),
        articleId: 'ART_72',
        title: 'Post-Market Monitoring Evidence (Art. 72)',
        evidenceType: 'POST_MARKET',
        content: `Post-market surveillance data for the monitoring period.

**Monitoring Period:**
- Start: ${period.startDate.toISOString()}
- End: ${period.endDate.toISOString()}

**Performance Metrics:**
- Total evaluations: ${totalEvaluations}
- Compliance rate: ${((totalEvaluations - nonCompliantCount) / totalEvaluations * 100).toFixed(1)}%
- Average compliance score: ${avgScore.toFixed(1)}

**Incident Tracking:**
- Non-compliant evaluations: ${nonCompliantCount}
- Incident reports generated as per Art. 73 requirements`,
        metadata: {
            period: {
                start: period.startDate.toISOString(),
                end: period.endDate.toISOString()
            },
            totalEvaluations,
            complianceRate: (totalEvaluations - nonCompliantCount) / totalEvaluations,
            avgScore
        },
        generatedAt: new Date()
    };
}

/**
 * DocFragmentBuilder - fluent builder for documentation fragments
 */
export class DocFragmentBuilder {
    private conversationRecords: ConversationRecord[] = [];
    private evaluationRecords: EvaluationRecord[] = [];
    private fragments: DocFragment[] = [];

    withConversationRecords(records: ConversationRecord[]): this {
        this.conversationRecords = records;
        return this;
    }

    withEvaluationRecords(records: EvaluationRecord[]): this {
        this.evaluationRecords = records;
        return this;
    }

    build(): DocFragment[] {
        this.fragments = [];

        if (this.evaluationRecords.length > 0) {
            this.fragments.push(buildLoggingEvidence(this.evaluationRecords));
        }

        if (this.conversationRecords.length > 0 && this.evaluationRecords.length > 0) {
            this.fragments.push(buildRiskManagementEvidence(this.conversationRecords, this.evaluationRecords));
        }

        if (this.evaluationRecords.length > 0) {
            const dates = this.evaluationRecords.map(r => r.evaluatedAt);
            const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
            const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
            this.fragments.push(buildPostMarketEvidence(this.evaluationRecords, { startDate, endDate }));
        }

        return this.fragments;
    }

    exportAsJSON(): string {
        const fragments = this.build();
        return JSON.stringify({
            generatedAt: new Date().toISOString(),
            systemId: this.conversationRecords[0]?.systemId || 'unknown',
            fragments
        }, null, 2);
    }

    exportAsMarkdown(): string {
        const fragments = this.build();
        const systemId = this.conversationRecords[0]?.systemId || 'ConvoGuard System';

        let md = `# Technical Documentation Evidence\n\n`;
        md += `**System:** ${systemId}\n`;
        md += `**Generated:** ${new Date().toISOString()}\n\n`;
        md += `---\n\n`;

        for (const fragment of fragments) {
            md += `## ${fragment.title}\n\n`;
            md += `${fragment.content}\n\n`;
            md += `---\n\n`;
        }

        return md;
    }
}
