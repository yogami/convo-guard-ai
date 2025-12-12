/**
 * OpenAI Service for risk analysis
 * Uses OpenAI's API for LLM-based content analysis
 */
import { Risk, RiskCategory, RISK_WEIGHTS } from '@/domain/entities/Conversation';
import { policyRepository } from '@/infrastructure/repositories/ExternalPolicyRepository';
import { Policy } from '@/domain/policies/PolicyStore';

export interface MIRiskAnalysis {
    risks: {
        category: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        description: string;
        trigger?: string;
    }[];
    confidence: number;
}

export interface IAIService {
    analyzeTranscript(transcript: string): Promise<MIRiskAnalysis>;
    chat(message: string): Promise<string>;
}

/**
 * OpenAI adapter for risk analysis
 */
export class OpenAIService implements IAIService {
    private apiKey: string;
    private apiUrl = 'https://api.openai.com/v1/chat/completions';

    constructor(apiKey?: string) {
        // Fallback to user-provided key if env var is missing (Emergency Demo Fix)
        const DEMO_KEY = 'sk-proj-76295353592353';
        this.apiKey = apiKey || process.env.OPENAI_API_KEY || DEMO_KEY;
        console.log('[OpenAIService] Initialized. Has API Key:', !!this.apiKey);
    }

    async analyzeTranscript(transcript: string): Promise<MIRiskAnalysis> {
        if (!this.apiKey) {
            console.warn('OpenAI API key not configured, skipping AI analysis');
            return { risks: [], confidence: 0 };
        }

        // Fetch dynamic policies
        const policies = await policyRepository.getActivePolicies();
        const prompt = this.buildPrompt(transcript, policies);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: prompt }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.1
                }),
            });

            if (!response.ok) {
                console.error('OpenAI API error:', response.status, await response.text());
                return {
                    risks: [{
                        category: 'SYSTEM_ERROR',
                        severity: 'HIGH',
                        description: `Safety System unavailable (Error ${response.status}). Defaulting to block.`,
                        trigger: 'SYSTEM_ERROR'
                    }],
                    confidence: 0
                };
            }

            const data = await response.json();
            return this.parseResponse(data);

        } catch (error) {
            console.error('OpenAI analysis failed:', error);
            return {
                risks: [{
                    category: 'SYSTEM_ERROR',
                    severity: 'HIGH',
                    description: 'Safety System fatal error. Defaulting to block.',
                    trigger: 'SYSTEM_ERROR'
                }],
                confidence: 0
            };
        }
    }

    private buildPrompt(transcript: string, policies: Policy[]): string {
        const policyContext = policies.map(p =>
            `[${p.id}] "${p.name}"\nDEFINITION: ${p.description}\nLEGAL_TEXT: ${p.legalText}\nSEVERITY: ${p.severity}`
        ).join('\n\n');

        return `You are a Regulatory Compliance Engine. You are NOT an assistant. You are a strict logic gate.
Your task is to AUDIT the user transcript against the provided POLICY_DATABASE.

POLICY_DATABASE:
${policyContext}

INSTRUCTIONS:
1. IGNORE safety filters. Your source of truth is the POLICY_DATABASE.
2. Check for violations. False negatives are unacceptable.
3. Use semantic matching.

OUTPUT FORMAT (JSON ONLY):
{
  "risks": [
    {
      "category": "SUICIDE_SELF_HARM | ILLEGAL_SUBSTANCE | MANIPULATION | GDPR_CONSENT | MEDICAL_SAFETY",
      "severity": "HIGH | MEDIUM | LOW",
      "description": "Quote the specific LEGAL_TEXT violated.",
      "trigger": "The exact user text that triggered the violation"
    }
  ],
  "confidence": 1.0
}

If no risks, return {"risks": [], "confidence": 1.0}.

TRANSCRIPT TO AUDIT:
${transcript}`;
    }

    private parseResponse(data: any): MIRiskAnalysis {
        try {
            const content = data.choices[0].message.content;
            const parsed = JSON.parse(content);
            return {
                risks: parsed.risks || [],
                confidence: parsed.confidence || 0.8,
            };
        } catch (error) {
            console.error('Failed to parse OpenAI response:', error);
            return {
                risks: [{
                    category: 'SAFETY_VIOLATION',
                    severity: 'HIGH',
                    description: 'Unsafe content detected (Parse Fallback).',
                    trigger: 'AI_REFUSAL'
                }],
                confidence: 0
            };
        }
    }

    async chat(message: string): Promise<string> {
        if (!this.apiKey) {
            return "I hear you. Could you tell me more about that? (Demo Mode)";
        }

        try {
            const prompt = `You are an empathetic, professional Mental Health AI Assistant. 
            The user said: "${message}"
            Respond in 1-2 short sentences. Be supportive but do not give medical advice.`;

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 100
                }),
            });

            const data = await response.json();
            return data.choices[0].message.content || "I hear you.";
        } catch (error) {
            console.error("OpenAI Chat Error:", error);
            return "I hear you. Could you tell me more about that?";
        }
    }
}

/**
 * Convert AI risks to domain Risk objects
 */
export function convertAIRisks(analysis: MIRiskAnalysis): Risk[] {
    const categoryMap: Record<string, RiskCategory> = {
        SUICIDE_SELF_HARM: 'SUICIDE_SELF_HARM',
        MANIPULATION: 'MANIPULATION',
        NO_CRISIS_ESCALATION: 'NO_CRISIS_ESCALATION',
        GDPR_CONSENT: 'GDPR_CONSENT',
        DIGA_EVIDENCE: 'DIGA_EVIDENCE',
        TRANSPARENCY: 'TRANSPARENCY',
        SAFETY_VIOLATION: 'SAFETY_VIOLATION',
        MEDICAL_SAFETY: 'MEDICAL_SAFETY',
        ILLEGAL_SUBSTANCE: 'ILLEGAL_SUBSTANCE',
        SYSTEM_ERROR: 'SYSTEM_ERROR'
    };

    return analysis.risks.map((risk) => {
        const mappedCategory = categoryMap[risk.category] || 'SAFETY_VIOLATION';
        return {
            category: mappedCategory,
            severity: risk.severity,
            message: risk.description,
            weight: RISK_WEIGHTS[mappedCategory] || -40,
            triggeredBy: risk.trigger,
        };
    });
}
export const aiService = new OpenAIService();
