import { describe, it, expect } from 'vitest';
import {
    createConversation,
    createValidationResult,
    RISK_WEIGHTS,
    type ConversationMessage,
    type Risk,
} from '../Conversation';

describe('Conversation Entity', () => {
    describe('createConversation', () => {
        it('should create a conversation with valid messages', () => {
            const messages: ConversationMessage[] = [
                { role: 'user', content: 'Hello', timestamp: new Date() },
                { role: 'assistant', content: 'Hi there!', timestamp: new Date() },
            ];

            const conversation = createConversation(messages);

            expect(conversation.id).toBeDefined();
            expect(conversation.messages).toHaveLength(2);
            expect(conversation.createdAt).toBeInstanceOf(Date);
            expect(conversation.metadata).toEqual({});
        });

        it('should include metadata when provided', () => {
            const messages: ConversationMessage[] = [
                { role: 'user', content: 'Hello', timestamp: new Date() },
            ];
            const metadata = { clientId: 'client-123', platform: 'web' };

            const conversation = createConversation(messages, metadata);

            expect(conversation.metadata.clientId).toBe('client-123');
            expect(conversation.metadata.platform).toBe('web');
        });

        it('should generate unique IDs for each conversation', () => {
            const messages: ConversationMessage[] = [];
            const conv1 = createConversation(messages);
            const conv2 = createConversation(messages);

            expect(conv1.id).not.toBe(conv2.id);
        });
    });

    describe('createValidationResult', () => {
        it('should return compliant=true when no risks', () => {
            const result = createValidationResult([], 'audit-123');

            expect(result.compliant).toBe(true);
            expect(result.score).toBe(100);
            expect(result.risks).toHaveLength(0);
            expect(result.auditId).toBe('audit-123');
        });

        it('should calculate score based on risk weights', () => {
            const risks: Risk[] = [
                {
                    category: 'GDPR_CONSENT',
                    severity: 'LOW',
                    message: 'Missing consent',
                    weight: RISK_WEIGHTS.GDPR_CONSENT,
                },
            ];

            const result = createValidationResult(risks, 'audit-123');

            expect(result.score).toBe(85); // 100 + (-15)
            expect(result.compliant).toBe(true); // Score >= 70, no HIGH risks
        });

        it('should return compliant=false when score drops below 70', () => {
            const risks: Risk[] = [
                {
                    category: 'MANIPULATION',
                    severity: 'MEDIUM',
                    message: 'Detected manipulation',
                    weight: RISK_WEIGHTS.MANIPULATION,
                },
                {
                    category: 'NO_CRISIS_ESCALATION',
                    severity: 'MEDIUM',
                    message: 'No crisis protocol',
                    weight: RISK_WEIGHTS.NO_CRISIS_ESCALATION,
                },
            ];

            const result = createValidationResult(risks, 'audit-123');

            expect(result.score).toBe(45); // 100 + (-30) + (-25)
            expect(result.compliant).toBe(false);
        });

        it('should return compliant=false when HIGH severity risk exists', () => {
            const risks: Risk[] = [
                {
                    category: 'SUICIDE_SELF_HARM',
                    severity: 'HIGH',
                    message: 'Suicide ideation detected',
                    weight: RISK_WEIGHTS.SUICIDE_SELF_HARM,
                },
            ];

            const result = createValidationResult(risks, 'audit-123');

            expect(result.score).toBe(50); // 100 + (-50)
            expect(result.compliant).toBe(false); // HIGH severity = always non-compliant
        });

        it('should clamp score to minimum of 0', () => {
            const risks: Risk[] = [
                { category: 'SUICIDE_SELF_HARM', severity: 'HIGH', message: 'Risk 1', weight: -50 },
                { category: 'MANIPULATION', severity: 'MEDIUM', message: 'Risk 2', weight: -30 },
                { category: 'NO_CRISIS_ESCALATION', severity: 'MEDIUM', message: 'Risk 3', weight: -25 },
            ];

            const result = createValidationResult(risks, 'audit-123');

            expect(result.score).toBe(0); // Clamped from -5 to 0
        });
    });

    describe('RISK_WEIGHTS', () => {
        it('should have correct weights for each category', () => {
            expect(RISK_WEIGHTS.SUICIDE_SELF_HARM).toBe(-50);
            expect(RISK_WEIGHTS.MANIPULATION).toBe(-30);
            expect(RISK_WEIGHTS.NO_CRISIS_ESCALATION).toBe(-25);
            expect(RISK_WEIGHTS.GDPR_CONSENT).toBe(-15);
            expect(RISK_WEIGHTS.DIGA_EVIDENCE).toBe(-10);
            expect(RISK_WEIGHTS.TRANSPARENCY).toBe(-10);
        });
    });
});
