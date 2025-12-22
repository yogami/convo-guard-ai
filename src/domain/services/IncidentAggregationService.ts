/**
 * IncidentAggregationService
 * Aggregates incidents for trends and reporting
 * 
 * Feature 2: Serious Incident Radar
 */

import { DetectedIncident } from './IncidentDetectionService';
import { IncidentCategory, IncidentSeverity } from './IncidentTaxonomy';

export interface IncidentTrend {
    period: string;
    count: number;
    changePercent?: number;
}

export interface AggregatedIncidents {
    total: number;
    byCategory: Partial<Record<IncidentCategory, number>>;
    bySeverity: Partial<Record<IncidentSeverity, number>>;
    bySystem: Record<string, number>;
    trend?: IncidentTrend[];
    periodStart?: Date;
    periodEnd?: Date;
}

export interface AggregationOptions {
    periodDays?: number;
    groupByWeek?: boolean;
}

/**
 * Aggregate incidents for reporting and trends
 */
export function aggregateIncidents(
    incidents: DetectedIncident[],
    options: AggregationOptions = {}
): AggregatedIncidents {
    const { periodDays = 30 } = options;

    // Filter by period if specified
    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const periodEnd = new Date();

    const filtered = incidents.filter(i => i.detectedAt >= periodStart);

    // Aggregate by category
    const byCategory: Partial<Record<IncidentCategory, number>> = {};
    for (const incident of filtered) {
        byCategory[incident.category] = (byCategory[incident.category] || 0) + 1;
    }

    // Aggregate by severity
    const bySeverity: Partial<Record<IncidentSeverity, number>> = {};
    for (const incident of filtered) {
        bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;
    }

    // Aggregate by system
    const bySystem: Record<string, number> = {};
    for (const incident of filtered) {
        bySystem[incident.systemId] = (bySystem[incident.systemId] || 0) + 1;
    }

    // Calculate trend (weekly buckets)
    const trend: IncidentTrend[] = [];
    if (options.groupByWeek) {
        // Group by week
        for (let week = 0; week < Math.ceil(periodDays / 7); week++) {
            const weekStart = new Date(Date.now() - (week + 1) * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(Date.now() - week * 7 * 24 * 60 * 60 * 1000);
            const weekIncidents = filtered.filter(
                i => i.detectedAt >= weekStart && i.detectedAt < weekEnd
            );
            trend.push({
                period: `Week -${week + 1}`,
                count: weekIncidents.length
            });
        }
    }

    return {
        total: filtered.length,
        byCategory,
        bySeverity,
        bySystem,
        trend: trend.length > 0 ? trend.reverse() : undefined,
        periodStart,
        periodEnd
    };
}

/**
 * IncidentAggregationService class
 */
export class IncidentAggregationService {
    private incidents: DetectedIncident[] = [];
    private options: AggregationOptions = {};

    withIncidents(incidents: DetectedIncident[]): this {
        this.incidents = incidents;
        return this;
    }

    withPeriod(days: number): this {
        this.options.periodDays = days;
        return this;
    }

    groupByWeek(): this {
        this.options.groupByWeek = true;
        return this;
    }

    aggregate(): AggregatedIncidents {
        return aggregateIncidents(this.incidents, this.options);
    }

    /**
     * Get systems with most incidents
     */
    getTopSystems(limit: number = 5): Array<{ systemId: string; count: number }> {
        const aggregated = this.aggregate();
        return Object.entries(aggregated.bySystem)
            .map(([systemId, count]) => ({ systemId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * Get critical incident count
     */
    getCriticalCount(): number {
        return this.incidents.filter(i => i.severity === 'CRITICAL').length;
    }
}
