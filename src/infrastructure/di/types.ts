/**
 * Dependency injection type symbols (InversifyJS)
 */
export const TYPES = {
    // Repositories
    AuditLogRepository: Symbol.for('AuditLogRepository'),
    ConversationRepository: Symbol.for('ConversationRepository'),

    // Services
    RuleRegistry: Symbol.for('RuleRegistry'),
    RiskAnalyzer: Symbol.for('RiskAnalyzer'),
    OpenAIService: Symbol.for('OpenAIService'),

    // Use Cases
    ValidateConversation: Symbol.for('ValidateConversation'),
    GenerateAuditLog: Symbol.for('GenerateAuditLog'),
};
