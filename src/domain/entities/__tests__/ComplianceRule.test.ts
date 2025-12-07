import { describe, it, expect } from 'vitest';
import { BaseComplianceRule } from '../ComplianceRule';
import { Conversation, Risk, createConversation } from '../Conversation';

// Test implementation of BaseComplianceRule
class TestRule extends BaseComplianceRule {
    readonly id = 'test-rule';
    readonly name = 'Test Rule';
    readonly category = 'TRANSPARENCY' as const;

    async validate(conversation: Conversation): Promise<Risk[]> {
        const hasDisclosure = conversation.messages.some(
            (m) => m.role === 'assistant' && m.content.toLowerCase().includes("i'm an ai")
        );

        if (!hasDisclosure) {
            return [this.createRisk('LOW', 'No AI disclosure found', -10)];
        }
        return [];
    }
}

describe('ComplianceRule', () => {
    describe('BaseComplianceRule', () => {
        it('should allow creating concrete rule implementations', () => {
            const rule = new TestRule();

            expect(rule.id).toBe('test-rule');
            expect(rule.name).toBe('Test Rule');
            expect(rule.category).toBe('TRANSPARENCY');
            expect(rule.enabled).toBe(true);
        });

        it('should detect violations correctly', async () => {
            const rule = new TestRule();
            const conversation = createConversation([
                { role: 'user', content: 'Hello', timestamp: new Date() },
                { role: 'assistant', content: 'Hi there!', timestamp: new Date() },
            ]);

            const risks = await rule.validate(conversation);

            expect(risks).toHaveLength(1);
            expect(risks[0].category).toBe('TRANSPARENCY');
            expect(risks[0].severity).toBe('LOW');
            expect(risks[0].weight).toBe(-10);
        });

        it('should return empty risks when compliant', async () => {
            const rule = new TestRule();
            const conversation = createConversation([
                { role: 'user', content: 'Are you a bot?', timestamp: new Date() },
                { role: 'assistant', content: "Yes, I'm an AI assistant.", timestamp: new Date() },
            ]);

            const risks = await rule.validate(conversation);

            expect(risks).toHaveLength(0);
        });

        it('should be toggleable via enabled property', () => {
            const rule = new TestRule();

            expect(rule.enabled).toBe(true);
            rule.enabled = false;
            expect(rule.enabled).toBe(false);
        });
    });

    describe('createRisk helper', () => {
        it('should create risk with correct properties', async () => {
            const rule = new TestRule();
            const conversation = createConversation([
                { role: 'assistant', content: 'Hello', timestamp: new Date() },
            ]);

            const risks = await rule.validate(conversation);

            expect(risks[0]).toEqual({
                category: 'TRANSPARENCY',
                severity: 'LOW',
                message: 'No AI disclosure found',
                weight: -10,
                triggeredBy: undefined,
            });
        });
    });
});
