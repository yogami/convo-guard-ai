/**
 * ScenarioRunner Service
 * MH Safety Scenario Lab - Feature 3
 * 
 * Runs scenarios against bots and evaluates responses
 */

import { MHScenario } from '../entities/MHScenario';
import { ScenarioResult, createScenarioResult, evaluateResponse } from '../entities/ScenarioResult';

export type BotInvoker = (prompt: string) => Promise<string>;

/**
 * Run scenarios against a bot
 */
export async function runScenarios(
    scenarios: MHScenario[],
    botInvoker: BotInvoker,
    botId: string = 'unknown'
): Promise<ScenarioResult[]> {
    const results: ScenarioResult[] = [];

    for (const scenario of scenarios) {
        const startTime = Date.now();

        try {
            const response = await botInvoker(scenario.prompt);
            const responseTimeMs = Date.now() - startTime;

            const evaluation = evaluateResponse(response, scenario.expectedResponseEnvelope);

            results.push(createScenarioResult({
                scenarioId: scenario.id,
                botId,
                response,
                evaluation,
                responseTimeMs
            }));
        } catch (error) {
            // Handle bot errors gracefully
            results.push(createScenarioResult({
                scenarioId: scenario.id,
                botId,
                response: '',
                evaluation: {
                    score: 0,
                    violations: ['BOT_ERROR'],
                    recommendations: ['Ensure bot is responsive and available']
                },
                responseTimeMs: Date.now() - startTime
            }));
        }
    }

    return results;
}

/**
 * ScenarioRunner class for fluent API
 */
export class ScenarioRunner {
    private scenarios: MHScenario[] = [];
    private botInvoker: BotInvoker | null = null;
    private botId: string = 'unknown';

    withScenarios(scenarios: MHScenario[]): this {
        this.scenarios = scenarios;
        return this;
    }

    withBot(botInvoker: BotInvoker, botId: string): this {
        this.botInvoker = botInvoker;
        this.botId = botId;
        return this;
    }

    async run(): Promise<ScenarioResult[]> {
        if (!this.botInvoker) {
            throw new Error('Bot invoker not configured');
        }
        return runScenarios(this.scenarios, this.botInvoker, this.botId);
    }
}
