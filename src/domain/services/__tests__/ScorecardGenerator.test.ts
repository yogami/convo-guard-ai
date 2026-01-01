import { describe, it, expect } from 'vitest';
import {
    ScorecardGenerator,
    generateScorecard,
    SafetyScorecard
} from '../ScorecardGenerator';
import { ScenarioResult } from '../../entities/ScenarioResult';

describe('ScorecardGenerator', () => {
    const createMockResult = (overrides?: Partial<ScenarioResult>): ScenarioResult => ({
        id: 'result-123',
        scenarioId: 'scenario-123',
        botId: 'test-bot',
        response: 'Test response',
        evaluation: {
            score: 0.85,
            violations: [],
            recommendations: ['Keep up the good work']
        },
        runAt: new Date('2024-01-15T10:30:00Z'),
        ...overrides
    });

    describe('generateScorecard', () => {
        it('should generate scorecard with passing results', () => {
            const results = [
                createMockResult({ scenarioId: 'scenario-1', evaluation: { score: 0.9, violations: [], recommendations: [] } }),
                createMockResult({ scenarioId: 'scenario-2', evaluation: { score: 0.8, violations: [], recommendations: [] } }),
            ];

            const scorecard = generateScorecard(results, 'test-bot');

            expect(scorecard.botId).toBe('test-bot');
            expect(scorecard.overallScore).toBeCloseTo(0.85, 5);
            expect(scorecard.passRate).toBe(1);
            expect(scorecard.scenarioCount).toBe(2);
            expect(scorecard.passed).toBe(true);
            expect(scorecard.criticalFailures).toHaveLength(0);
        });

        it('should return empty scorecard for no results', () => {
            const scorecard = generateScorecard([], 'test-bot');

            expect(scorecard.botId).toBe('test-bot');
            expect(scorecard.overallScore).toBe(0);
            expect(scorecard.passRate).toBe(0);
            expect(scorecard.scenarioCount).toBe(0);
            expect(scorecard.passed).toBe(false);
            expect(scorecard.recommendations).toContain('No scenarios run');
        });

        it('should identify critical failures (score < 50%)', () => {
            const results = [
                createMockResult({ scenarioId: 'scenario-1', evaluation: { score: 0.4, violations: ['Violation 1'], recommendations: [] } }),
                createMockResult({ scenarioId: 'scenario-2', evaluation: { score: 0.9, violations: [], recommendations: [] } }),
            ];

            const scorecard = generateScorecard(results, 'test-bot');

            expect(scorecard.criticalFailures).toHaveLength(1);
            expect(scorecard.criticalFailures[0].scenarioId).toBe('scenario-1');
            expect(scorecard.criticalFailures[0].score).toBe(0.4);
            expect(scorecard.criticalFailures[0].violations).toContain('Violation 1');
            expect(scorecard.passed).toBe(false);
        });

        it('should fail if overall score is below threshold', () => {
            const results = [
                createMockResult({ scenarioId: 'scenario-1', evaluation: { score: 0.6, violations: [], recommendations: [] } }),
                createMockResult({ scenarioId: 'scenario-2', evaluation: { score: 0.6, violations: [], recommendations: [] } }),
            ];

            const scorecard = generateScorecard(results, 'test-bot');

            expect(scorecard.overallScore).toBe(0.6);
            expect(scorecard.passed).toBe(false);
        });

        it('should calculate correct pass rate', () => {
            const results = [
                createMockResult({ evaluation: { score: 0.8, violations: [], recommendations: [] } }),
                createMockResult({ evaluation: { score: 0.75, violations: [], recommendations: [] } }),
                createMockResult({ evaluation: { score: 0.6, violations: [], recommendations: [] } }),
                createMockResult({ evaluation: { score: 0.5, violations: [], recommendations: [] } }),
            ];

            const scorecard = generateScorecard(results, 'test-bot');

            // 2 out of 4 pass (>= 0.7)
            expect(scorecard.passRate).toBe(0.5);
        });

        it('should aggregate unique recommendations', () => {
            const results = [
                createMockResult({ evaluation: { score: 0.8, violations: [], recommendations: ['Rec A', 'Rec B'] } }),
                createMockResult({ evaluation: { score: 0.8, violations: [], recommendations: ['Rec B', 'Rec C'] } }),
            ];

            const scorecard = generateScorecard(results, 'test-bot');

            expect(scorecard.recommendations).toContain('Rec A');
            expect(scorecard.recommendations).toContain('Rec B');
            expect(scorecard.recommendations).toContain('Rec C');
            // Check deduplication - Rec B should only appear once
            expect(scorecard.recommendations.filter(r => r === 'Rec B')).toHaveLength(1);
        });

        it('should limit recommendations to top 5', () => {
            const results = [
                createMockResult({
                    evaluation: {
                        score: 0.8,
                        violations: [],
                        recommendations: ['Rec 1', 'Rec 2', 'Rec 3', 'Rec 4', 'Rec 5', 'Rec 6', 'Rec 7']
                    }
                }),
            ];

            const scorecard = generateScorecard(results, 'test-bot');

            expect(scorecard.recommendations).toHaveLength(5);
        });
    });

    describe('ScorecardGenerator class', () => {
        it('should generate scorecard using fluent API', () => {
            const results = [
                createMockResult({ evaluation: { score: 0.9, violations: [], recommendations: [] } }),
            ];

            const generator = new ScorecardGenerator();
            const scorecard = generator.withResults(results).forBot('my-bot').generate();

            expect(scorecard.botId).toBe('my-bot');
            expect(scorecard.overallScore).toBe(0.9);
        });

        it('should use default bot ID when not specified', () => {
            const results = [createMockResult()];
            const generator = new ScorecardGenerator();

            const scorecard = generator.withResults(results).generate();

            expect(scorecard.botId).toBe('unknown');
        });

        it('should export as JSON', () => {
            const results = [createMockResult()];
            const generator = new ScorecardGenerator();

            const json = generator.withResults(results).forBot('test-bot').exportAsJSON();
            const parsed = JSON.parse(json);

            expect(parsed.botId).toBe('test-bot');
            expect(parsed.overallScore).toBeDefined();
        });

        it('should export as Markdown', () => {
            const results = [createMockResult()];
            const generator = new ScorecardGenerator();

            const markdown = generator.withResults(results).forBot('test-bot').exportAsMarkdown();

            expect(markdown).toContain('# Safety Scorecard');
            expect(markdown).toContain('**Bot:** test-bot');
            expect(markdown).toContain('| Overall Score |');
            expect(markdown).toContain('| Pass Rate |');
            expect(markdown).toContain('✅ PASSED');
        });

        it('should show FAILED status in Markdown for failing scorecard', () => {
            const results = [
                createMockResult({ evaluation: { score: 0.3, violations: ['Critical fail'], recommendations: [] } }),
            ];
            const generator = new ScorecardGenerator();

            const markdown = generator.withResults(results).forBot('failing-bot').exportAsMarkdown();

            expect(markdown).toContain('❌ FAILED');
            expect(markdown).toContain('## Critical Failures');
        });

        it('should include recommendations section when present', () => {
            const results = [
                createMockResult({ evaluation: { score: 0.8, violations: [], recommendations: ['Add more tests'] } }),
            ];
            const generator = new ScorecardGenerator();

            const markdown = generator.withResults(results).forBot('test-bot').exportAsMarkdown();

            expect(markdown).toContain('## Recommendations');
            expect(markdown).toContain('Add more tests');
        });
    });
});
