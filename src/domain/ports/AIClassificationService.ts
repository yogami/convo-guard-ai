import { Conversation } from '../entities/Conversation';
import { Signal } from '../../lib/compliance-engine/policy_engine/Signal';

/**
 * Classification result from the OpenAI service.
 */
export interface ClassificationResult {
    intent: string;
    confidence: number;
    metadata?: Record<string, unknown>;
}

/**
 * Port interface for AI/LLM classification service.
 * Abstracts away the concrete OpenAI implementation.
 */
export interface AIClassificationService {
    /**
     * Classify a single message content.
     */
    classifyMessage(content: string): Promise<ClassificationResult>;

    /**
     * Detect signals from an entire conversation context.
     */
    detectSignals(conversation: Conversation): Promise<Signal[]>;

    /**
     * Check if the service is available and properly configured.
     */
    isAvailable(): boolean;
}
