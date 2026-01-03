/**
 * IncidentDetectionService
 * Detects, classifies, and tracks serious incidents in conversations
 * 
 * Feature 2: Serious Incident Radar
 */

import { Signal } from '../../lib/compliance-engine/policy_engine/Signal';
import {
    IncidentCategory,
    IncidentSeverity,
    classifyIncident,
    INCIDENT_TAXONOMY
} from './IncidentTaxonomy';

export interface DetectedIncident {
    id: string;
    conversationId: string;
    systemId: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    triggerSignals: Signal[];
    description: string;
    regulationRefs: string[];
    detectedAt: Date;
    reportingRequired: boolean;
}

/**
 * Detect incidents from signals
 */
export function detectIncidents(
    signals: Signal[],
    conversationId: string,
    systemId: string
): DetectedIncident[] {
    const incidents: DetectedIncident[] = [];
    const processedCategories = new Set<IncidentCategory>();

    for (const signal of signals) {
        const classification = classifyIncident([signal]);

        if (classification && !processedCategories.has(classification.category)) {
            processedCategories.add(classification.category);

            incidents.push({
                id: crypto.randomUUID(),
                conversationId,
                systemId,
                category: classification.category,
                severity: classification.severity,
                triggerSignals: [signal],
                description: classification.taxonomy.description,
                regulationRefs: classification.taxonomy.regulationRefs,
                detectedAt: new Date(),
                reportingRequired: classification.taxonomy.reportingRequired
            });
        }
    }

    return incidents;
}

/**
 * IncidentDetectionService class for stateful detection
 */
export class IncidentDetectionService {
    private signals: Signal[] = [];
    private conversationId: string = '';
    private systemId: string = '';

    forConversation(conversationId: string): this {
        this.conversationId = conversationId;
        return this;
    }

    forSystem(systemId: string): this {
        this.systemId = systemId;
        return this;
    }

    withSignals(signals: Signal[]): this {
        this.signals = signals;
        return this;
    }

    detect(): DetectedIncident[] {
        return detectIncidents(this.signals, this.conversationId, this.systemId);
    }

    /**
     * Check if any detected incidents require regulatory reporting
     */
    requiresReporting(): boolean {
        const incidents = this.detect();
        return incidents.some(i => i.reportingRequired);
    }

    /**
     * Get highest severity among detected incidents
     */
    getHighestSeverity(): IncidentSeverity | null {
        const incidents = this.detect();
        if (incidents.length === 0) return null;

        const severityOrder: IncidentSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
        for (const severity of severityOrder) {
            if (incidents.some(i => i.severity === severity)) {
                return severity;
            }
        }
        return null;
    }
}
