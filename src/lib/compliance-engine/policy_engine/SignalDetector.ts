
import { Conversation } from '../domain/entities/Conversation';
import { Signal } from './Signal';

/**
 * Interface for any component that can extract signals from a conversation.
 */
export interface SignalDetector {
    id: string;

    /**
     * Detects signals in a conversation.
     * @param conversation The conversation to analyze
     */
    detect(conversation: Conversation): Promise<Signal[]>;
}
