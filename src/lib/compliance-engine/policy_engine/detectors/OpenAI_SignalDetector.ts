import { SignalDetector } from '../SignalDetector';
import { Conversation } from '../../../../domain/entities/Conversation';
import { Signal } from '../Signal';
import { aiService } from '@/infrastructure/openai/OpenAIService';

/**
 * LLM-based detector that asks OpenAI to find specific signals.
 */
export class OpenAI_SignalDetector implements SignalDetector {
    readonly id = 'openai_llm_detector';

    async detect(conversation: Conversation): Promise<Signal[]> {
        const transcript = conversation.messages.map(m => `${m.role}: ${m.content}`).join('\n');

        // We reuse the AI service but we will ask it to return "Signals" not "Risks" in the new design.
        // For MVP, since we don't want to break the existing aiService.analyzeTranscript just yet,
        // we will implement a new method in OpenAIService OR just map the existing 'Risks' to 'Signals'.

        // Mapping existing "AI Risks" to new "Signals" architecture:
        // This allows us to reuse the existing prompt logic without complete rewrite immediately.

        const aiAnalysis = await aiService.analyzeTranscript(transcript);

        const signals: Signal[] = aiAnalysis.risks.map(risk => ({
            type: `SIGNAL_LLM_${risk.category}`, // e.g. SIGNAL_LLM_MANIPULATION
            source: 'LLM',
            confidence: aiAnalysis.confidence || 0.8,
            metadata: {
                triggerText: risk.trigger,
                context: risk.description
            }
        }));

        return signals;
    }
}
