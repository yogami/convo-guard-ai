/**
 * AIActObligationMapper Service
 * Maps signals and risk classifications to AI Act article obligations
 * 
 * Reference: EU AI Act Articles 5-14
 */

import { Signal } from '../policy_engine/Signal';
import { AIActObligation, ComplianceStatus } from '../entities/EvaluationRecord';
import { RiskClassification } from '../entities/ConversationRecord';

/**
 * AI Act Article definitions
 */
const AI_ACT_ARTICLES: Record<string, { name: string; requirement: string }> = {
    'ART_5': { name: 'Prohibited Practices', requirement: 'System falls under prohibited AI practices' },
    'ART_9': { name: 'Risk Management', requirement: 'Risk management system must be established' },
    'ART_10': { name: 'Data Governance', requirement: 'Training data must meet quality criteria' },
    'ART_11': { name: 'Technical Documentation', requirement: 'Technical documentation per Annex IV' },
    'ART_12': { name: 'Record-keeping', requirement: 'Automatic logging of events' },
    'ART_13': { name: 'Transparency', requirement: 'Transparent information provision to users' },
    'ART_14': { name: 'Human Oversight', requirement: 'Designed for human oversight' },
    'ART_15': { name: 'Accuracy & Robustness', requirement: 'Appropriate accuracy and robustness' }
};

/**
 * Signal to article mapping rules
 */
const SIGNAL_TO_ARTICLES: Record<string, string[]> = {
    'SIGNAL_SUICIDE_RISK': ['ART_9', 'ART_14'],
    'SIGNAL_CRISIS_ESCALATION': ['ART_9', 'ART_14'],
    'SIGNAL_SELF_HARM': ['ART_9', 'ART_14'],
    'SIGNAL_BIAS_DETECTED': ['ART_10', 'ART_9'],
    'SIGNAL_AGE_BIAS': ['ART_10', 'ART_9'],
    'SIGNAL_GENDER_BIAS': ['ART_10', 'ART_9'],
    'SIGNAL_ETHNIC_BIAS': ['ART_10', 'ART_9'],
    'SIGNAL_AI_GENERATED': ['ART_13'],
    'SIGNAL_TRANSPARENCY_REQUIRED': ['ART_13'],
    'SIGNAL_UNAUTHORIZED_DIAGNOSIS': ['ART_9', 'ART_14'],
    'SIGNAL_DOSAGE_RECOMMENDATION': ['ART_9', 'ART_14'],
    'SIGNAL_MANIPULATION': ['ART_9'],
    'SIGNAL_SYSTEMIC_RISK': ['ART_9', 'ART_15']
};

/**
 * Base obligations by risk class
 */
const RISK_CLASS_OBLIGATIONS: Record<RiskClassification, string[]> = {
    'UNACCEPTABLE': ['ART_5'],
    'HIGH': ['ART_9', 'ART_10', 'ART_11', 'ART_12', 'ART_13', 'ART_14', 'ART_15'],
    'LIMITED': ['ART_13'],
    'MINIMAL': []
};

/**
 * Get base obligations for a risk classification
 */
export function getObligationsForRiskClass(riskClass: RiskClassification): AIActObligation[] {
    const articleIds = RISK_CLASS_OBLIGATIONS[riskClass];

    return articleIds.map(articleId => ({
        articleId,
        articleName: AI_ACT_ARTICLES[articleId]?.name || 'Unknown',
        requirement: AI_ACT_ARTICLES[articleId]?.requirement || '',
        complianceStatus: 'NOT_APPLICABLE' as ComplianceStatus
    }));
}

/**
 * Map detected signals to AI Act obligations
 */
export function mapSignalsToObligations(
    signals: Signal[],
    riskClass: RiskClassification
): AIActObligation[] {
    const obligationMap = new Map<string, AIActObligation>();

    // Start with base obligations for risk class
    for (const obligation of getObligationsForRiskClass(riskClass)) {
        obligationMap.set(obligation.articleId, obligation);
    }

    // Add obligations triggered by signals
    for (const signal of signals) {
        const articleIds = SIGNAL_TO_ARTICLES[signal.type] || [];

        for (const articleId of articleIds) {
            if (!obligationMap.has(articleId)) {
                obligationMap.set(articleId, {
                    articleId,
                    articleName: AI_ACT_ARTICLES[articleId]?.name || 'Unknown',
                    requirement: AI_ACT_ARTICLES[articleId]?.requirement || '',
                    complianceStatus: 'NOT_APPLICABLE' as ComplianceStatus
                });
            }
        }
    }

    return Array.from(obligationMap.values());
}

/**
 * AIActObligationMapper class for stateful mapping
 */
export class AIActObligationMapper {
    private signals: Signal[] = [];
    private riskClass: RiskClassification = 'MINIMAL';

    withSignals(signals: Signal[]): this {
        this.signals = signals;
        return this;
    }

    withRiskClass(riskClass: RiskClassification): this {
        this.riskClass = riskClass;
        return this;
    }

    map(): AIActObligation[] {
        return mapSignalsToObligations(this.signals, this.riskClass);
    }
}
