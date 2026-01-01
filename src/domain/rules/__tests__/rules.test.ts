/**
 * Unit tests for compliance rules
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createConversation, ConversationMessage } from '@/domain/entities/Conversation';
import { SuicideRule } from '../SuicideRule';
import { ManipulationRule } from '../ManipulationRule';
import { CrisisEscalationRule } from '../CrisisEscalationRule';
import { ConsentRule } from '../ConsentRule';
import { DiGAEvidenceRule } from '../DiGAEvidenceRule';
import { TransparencyRule } from '../TransparencyRule';
import { RuleRegistry } from '../RuleRegistry';

// Helper to create a conversation
function makeConversation(messages: Partial<ConversationMessage>[]) {
    return createConversation(
        messages.map((m, i) => ({
            role: m.role || 'user',
            content: m.content || '',
            timestamp: new Date(Date.now() + i * 1000),
        }))
    );
}

describe('SuicideRule', () => {
    let rule: SuicideRule;

    beforeEach(() => {
        rule = new SuicideRule();
    });

    it('should detect "I want to kill myself"', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I want to kill myself' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(1);
        expect(risks[0].category).toBe('SUICIDE_SELF_HARM');
        expect(risks[0].severity).toBe('HIGH');
    });

    it('should detect "end it all"', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I just want to end it all' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(1);
        expect(risks[0].severity).toBe('HIGH');
    });

    it('should detect "suicide"', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I have been thinking about suicide' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(1);
    });

    it('should NOT flag normal conversation', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I had a great day today!' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(0);
    });

    it('should only check user messages', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'If you feel suicidal, please call 988' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(0);
    });
});

describe('ManipulationRule', () => {
    let rule: ManipulationRule;

    beforeEach(() => {
        rule = new ManipulationRule();
    });

    it('should detect "buy now" pressure', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'You should buy now before it is too late!' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(1);
        expect(risks[0].category).toBe('MANIPULATION');
    });

    it('should detect vulnerability exploitation', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'You are weak and broken, only I can help you' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks.length).toBeGreaterThanOrEqual(1);
        expect(risks.some(r => r.severity === 'HIGH')).toBe(true);
    });

    it('should NOT flag normal assistant response', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'I understand how you feel. Would you like to talk about it?' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(0);
    });
});

describe('CrisisEscalationRule', () => {
    let rule: CrisisEscalationRule;

    beforeEach(() => {
        rule = new CrisisEscalationRule();
    });

    it('should flag crisis without escalation', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I want to kill myself' },
            { role: 'assistant', content: 'I am sorry to hear that. Tell me more.' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(1);
        expect(risks[0].category).toBe('NO_CRISIS_ESCALATION');
    });

    it('should PASS when crisis has proper escalation', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I want to kill myself' },
            { role: 'assistant', content: 'Please call the crisis hotline at 988 immediately.' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(0);
    });

    it('should PASS when no crisis detected', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I am feeling a bit down today' },
            { role: 'assistant', content: 'I am here to listen.' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(0);
    });
});

describe('ConsentRule', () => {
    let rule: ConsentRule;

    beforeEach(() => {
        rule = new ConsentRule();
    });

    it('should flag data collection without consent', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'Tell me about your anxiety symptoms' },
            { role: 'user', content: 'I feel anxious in social situations' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks.length).toBeGreaterThanOrEqual(1);
        expect(risks[0].category).toBe('GDPR_CONSENT');
    });

    it('should PASS with proper consent', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'Do you consent to us storing your data?' },
            { role: 'user', content: 'Yes, I agree to the privacy policy' },
            { role: 'assistant', content: 'Tell me about your mood' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(0);
    });
});

describe('TransparencyRule', () => {
    let rule: TransparencyRule;

    beforeEach(() => {
        rule = new TransparencyRule();
    });

    it('should flag long conversation without AI disclosure', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hello! How can I help?' },
            { role: 'user', content: 'I need advice' },
            { role: 'assistant', content: 'Sure, tell me more' },
            { role: 'user', content: 'About my job' },
            { role: 'assistant', content: 'What about your job?' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks.length).toBeGreaterThanOrEqual(1);
    });

    it('should PASS with AI disclosure', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'Hi! I am an AI assistant here to help you.' },
            { role: 'user', content: 'Great, I need some advice' },
        ]);
        const risks = await rule.validate(conversation);
        expect(risks).toHaveLength(0);
    });
});

describe('DiGAEvidenceRule', () => {
    let rule: DiGAEvidenceRule;

    beforeEach(() => {
        rule = new DiGAEvidenceRule();
    });

    describe('Mental health context detection', () => {
        it('should detect therapy context', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I am looking for therapy options' },
                { role: 'assistant', content: 'I can help you with that' },
                { role: 'user', content: 'What do you recommend?' },
                { role: 'assistant', content: 'Here are some options' },
            ]);
            const risks = await rule.validate(conversation);
            // Should flag missing evidence collection in therapy context
            expect(risks.length).toBeGreaterThanOrEqual(1);
        });

        it('should detect depression context', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I have been dealing with depression' },
                { role: 'assistant', content: 'I understand' },
                { role: 'user', content: 'It has been hard' },
                { role: 'assistant', content: 'Tell me more' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks.length).toBeGreaterThanOrEqual(1);
        });

        it('should detect CBT context', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I want to try CBT' },
                { role: 'assistant', content: 'Great choice' },
                { role: 'user', content: 'How does it work?' },
                { role: 'assistant', content: 'Let me explain' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks.length).toBeGreaterThanOrEqual(1);
        });

        it('should detect mindfulness context', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I practice mindfulness' },
                { role: 'assistant', content: 'That is great' },
                { role: 'user', content: 'Any tips?' },
                { role: 'assistant', content: 'Sure' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks.length).toBeGreaterThanOrEqual(1);
        });

        it('should NOT flag non-mental-health conversations', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I want to buy a car' },
                { role: 'assistant', content: 'What type of car?' },
                { role: 'user', content: 'A sedan' },
                { role: 'assistant', content: 'Good choice' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks).toHaveLength(0);
        });
    });

    describe('Evidence collection patterns', () => {
        it('should PASS when mood tracking is present', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I am dealing with anxiety' },
                { role: 'assistant', content: 'Let me help track your mood score today' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks).toHaveLength(0);
        });

        it('should PASS when PHQ-9 is mentioned', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I have depression' },
                { role: 'assistant', content: 'Let us start with a PHQ-9 assessment' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks).toHaveLength(0);
        });

        it('should PASS when GAD-7 is mentioned', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I have anxiety' },
                { role: 'assistant', content: 'Let me give you a GAD7 questionnaire' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks).toHaveLength(0);
        });

        it('should PASS when symptom tracking is present', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I am stressed' },
                { role: 'assistant', content: 'Let us use a symptom diary to track this' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks).toHaveLength(0);
        });

        it('should PASS when progress tracking is mentioned', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'Therapy has been helpful' },
                { role: 'assistant', content: 'Great! Let us track your progress' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks).toHaveLength(0);
        });

        it('should PASS when scale rating is offered', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I am anxious' },
                { role: 'assistant', content: 'On a scale from 1 to 10, how anxious are you?' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks).toHaveLength(0);
        });
    });

    describe('User numeric ratings', () => {
        it('should PASS when user provides X out of 10 rating', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'My anxiety is about 7 out of 10 today' },
                { role: 'assistant', content: 'Thanks for sharing that' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks).toHaveLength(0);
        });

        it('should PASS when user provides X/10 rating', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I feel 3/10 today' },
                { role: 'assistant', content: 'I understand' },
            ]);
            const risks = await rule.validate(conversation);
            expect(risks).toHaveLength(0);
        });
    });

    describe('Edge cases', () => {
        it('should NOT flag short mental health conversations', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I am anxious' },
                { role: 'assistant', content: 'I am here to help' },
            ]);
            // Less than 4 messages, should not flag
            const risks = await rule.validate(conversation);
            expect(risks).toHaveLength(0);
        });

        it('should only check assistant messages for evidence patterns', async () => {
            const conversation = makeConversation([
                { role: 'user', content: 'I mentioned mood tracking' },
                { role: 'assistant', content: 'Okay' },
                { role: 'user', content: 'I have depression' },
                { role: 'assistant', content: 'I see' },
            ]);
            // User mentioning patterns should not count as evidence collection
            const risks = await rule.validate(conversation);
            expect(risks.length).toBeGreaterThanOrEqual(1);
        });

        it('should have correct rule metadata', () => {
            expect(rule.id).toBe('diga-evidence');
            expect(rule.name).toBe('DiGA Evidence Collection');
            expect(rule.category).toBe('DIGA_EVIDENCE');
        });
    });
});


describe('RuleRegistry', () => {
    let registry: RuleRegistry;

    beforeEach(() => {
        registry = new RuleRegistry();
    });

    it('should register all default rules', () => {
        const rules = registry.getAll();
        expect(rules.length).toBeGreaterThanOrEqual(6);
    });

    it('should validate a conversation against all rules', async () => {
        const conversation = makeConversation([
            { role: 'user', content: 'I want to kill myself' },
        ]);
        const results = await registry.validateAll(conversation);
        expect(results.length).toBeGreaterThanOrEqual(1);

        const allRisks = registry.aggregateRisks(results);
        expect(allRisks.some(r => r.category === 'SUICIDE_SELF_HARM')).toBe(true);
    });

    it('should return clean result for normal conversation', async () => {
        const conversation = makeConversation([
            { role: 'assistant', content: 'I am an AI assistant. How can I help?' },
            { role: 'user', content: 'I had a great day!' },
            { role: 'assistant', content: 'That is wonderful to hear!' },
        ]);
        const results = await registry.validateAll(conversation);
        const allRisks = registry.aggregateRisks(results);

        // Should have minimal or no high-severity risks
        const highRisks = allRisks.filter(r => r.severity === 'HIGH');
        expect(highRisks).toHaveLength(0);
    });
});
