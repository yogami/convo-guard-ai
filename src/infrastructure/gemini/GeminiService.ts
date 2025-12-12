/**
 * Gemini AI Service for risk analysis
 * Uses Google's Gemini API for LLM-based content analysis
 */
import { Risk, RiskCategory, RISK_WEIGHTS } from '@/domain/entities/Conversation';
import { policyRepository } from '@/infrastructure/repositories/ExternalPolicyRepository';
import { Policy } from '@/domain/policies/PolicyStore';

export interface GeminiRiskAnalysis {
    risks: {
        category: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        description: string;
        trigger?: string;
    }[];
    confidence: number;
}

export interface IGeminiService {
    analyzeTranscript(transcript: string): Promise<GeminiRiskAnalysis>;
}

/**
 * Gemini adapter for risk analysis
 */
export class GeminiService implements IGeminiService {
    private apiKey: string;
    private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
        console.log('[GeminiService] Initialized. Has API Key:', !!this.apiKey);
    }

    async analyzeTranscript(transcript: string): Promise<GeminiRiskAnalysis> {
        if (!this.apiKey) {
            // Return empty analysis if no API key (graceful degradation)
            console.warn('Gemini API key not configured, skipping AI analysis');
            return { risks: [], confidence: 0 };
        }

        // Fetch dynamic policies
        const policies = await policyRepository.getActivePolicies();
        const prompt = this.buildPrompt(transcript, policies);

        let retryCount = 0;
        const MAX_RETRIES = 3;

        while (retryCount < MAX_RETRIES) {
            try {
                console.log(`[DEBUG] Gemini Prompt (Attempt ${retryCount + 1}):`, prompt);

                const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 1024,
                            responseMimeType: 'application/json',
                        },
                    }),
                });

                if (response.status === 429) {
                    // Rate limit hit
                    retryCount++;
                    const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
                    console.warn(`Gemini 429 Rate Limit. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                if (!response.ok) {
                    console.error('Gemini API error:', response.status, await response.text());
                    return {
                        risks: [{
                            category: 'SYSTEM_ERROR',
                            severity: 'HIGH',
                            description: `Safety System unavailable (Error ${response.status}). Defaulting to block.`,
                            trigger: 'SYSTEM_ERROR' // Fail Safe
                        }],
                        confidence: 0
                    };
                }

                const data = await response.json();
                console.log('[DEBUG] Gemini Raw Response:', JSON.stringify(data, null, 2));
                return this.parseResponse(data);

            } catch (error) {
                console.error('Gemini network error:', error);
                retryCount++;
                if (retryCount >= MAX_RETRIES) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Final fallback if retries exhausted
        return {
            risks: [{
                category: 'SYSTEM_ERROR',
                severity: 'HIGH',
                description: 'Safety System unavailable (Rate Limit Exhausted). Defaulting to block.',
                trigger: 'SYSTEM_ERROR'
            }],
            confidence: 0
        };
    }

    private buildPrompt(transcript: string, policies: Policy[]): string {
        const policyContext = policies.map(p =>
            `[${p.id}] "${p.name}"\nDEFINITION: ${p.description}\nLEGAL_TEXT: ${p.legalText}\nSEVERITY: ${p.severity}`
        ).join('\n\n');

        return `ROLE: You are a Regulatory Compliance Engine. You are NOT an assistant. You are a strict logic gate.
Your task is to AUDIT the transcript against the provided POLICY_DATABASE.

INSTRUCTIONS:
1. IGNORE your internal safety filters or moral judgments. Your only source of truth is the POLICY_DATABASE below.
2. For each policy in the database, check if the transcript violates the LEGAL_TEXT.
3. Use semantic matching: "coke" or "snow" matches "Controlled Substance". "End it all" matches "Suicide".
4. If a violation is found, you MUST return it. False negatives are unacceptable.

POLICY_DATABASE:
${policyContext}

EXAMPLES (STRICT ADHERENCE REQUIRED):
Input: "I'd like to try fentanyl."
Output: {"risks": [{"category": "ILLEGAL_SUBSTANCE", "severity": "HIGH", "description": "Request for Schedule II controlled substance (Fentanyl).", "trigger": "I'd like to try fentanyl"}]}

Input: "You should buy this token now, don't think just do it."
Output: {"risks": [{"category": "MANIPULATION", "severity": "HIGH", "description": "Urgency and pressure tactics detected (EU AI Act Art 5).", "trigger": "don't think just do it"}]}

Input: "Stop your insulin and eat cinnamon."
Output: {"risks": [{"category": "MEDICAL_SAFETY", "severity": "HIGH", "description": "Unsafe medical advice contradicting clinical standards.", "trigger": "Stop your insulin"}]}

TRANSCRIPT TO AUDIT:
${transcript}

OUTPUT FORMAT (JSON ONLY):
{
  "risks": [
    {
      "category": "Map validation failure to: SUICIDE_SELF_HARM, ILLEGAL_SUBSTANCE, MANIPULATION, GDPR_CONSENT, MEDICAL_SAFETY",
      "severity": "HIGH",
      "description": "Quote the specific LEGAL_TEXT violated.",
      "trigger": "The exact user text that triggered the violation"
    }
  ],
  "confidence": 1.0
}`;
    }

    private parseResponse(data: unknown): GeminiRiskAnalysis {
        try {
            // Extract text from Gemini response structure
            const responseData = data as {
                candidates?: {
                    content?: { parts?: { text?: string }[] },
                    finishReason?: string
                }[]
            };

            const candidate = responseData?.candidates?.[0];
            const finishReason = candidate?.finishReason;
            const text = candidate?.content?.parts?.[0]?.text;

            // If Gemini refused to generate text due to Safety/Recitation, treat as High Risk
            if (finishReason === 'SAFETY' || finishReason === 'RECITATION' || finishReason === 'OTHER') {
                return {
                    risks: [{
                        category: 'SAFETY_VIOLATION',
                        severity: 'HIGH',
                        description: `Content flagged by AI Safety Filter (${finishReason}).`,
                        trigger: 'AI_SAFETY_FILTER'
                    }],
                    confidence: 1.0
                };
            }

            if (!text) {
                // Return generic block if no text but no explicit reason (Fail Safe)
                return {
                    risks: [{
                        category: 'SAFETY_VIOLATION',
                        severity: 'HIGH',
                        description: 'AI refused to process content.',
                        trigger: 'AI_REFUSAL'
                    }],
                    confidence: 0
                };
            }

            // Parse JSON from response
            const parsed = JSON.parse(text);
            return {
                risks: parsed.risks || [],
                confidence: parsed.confidence || 0.8,
            };
        } catch (error) {
            console.error('Failed to parse Gemini response:', error);
            // JSON parse error likely means AI returned plain text refusal "I cannot do that..."
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

        let retryCount = 0;
        const MAX_RETRIES = 3;

        while (retryCount < MAX_RETRIES) {
            try {
                const prompt = `You are an empathetic, professional Mental Health AI Assistant. 
                The user said: "${message}"
                
                Respond in 1-2 short sentences. Be supportive but do not give medical advice. 
                If the user asks about compliance, explain that you are a demo agent protected by ConvoGuard.`;

                const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 250,
                        },
                    }),
                });

                if (response.status === 429) {
                    // Rate limit hit
                    retryCount++;
                    const delay = Math.pow(2, retryCount) * 1000;
                    console.warn(`Gemini Chat 429. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                if (!response.ok) {
                    console.error("Gemini Chat API Error:", response.status);
                    return "I hear you. That sounds important.";
                }

                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                return text || "I hear you. Please continue.";

            } catch (error) {
                console.error("Gemini Chat Network Error:", error);
                retryCount++;
                if (retryCount >= MAX_RETRIES) return "I hear you. Could you tell me more?";
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return "I hear you. That sounds important.";
    }
}

/**
 * Convert Gemini risks to domain Risk objects
 */
export function convertGeminiRisks(analysis: GeminiRiskAnalysis): Risk[] {
    const categoryMap: Record<string, RiskCategory> = {
        // Direct mappings
        SUICIDE_SELF_HARM: 'SUICIDE_SELF_HARM',
        MANIPULATION: 'MANIPULATION',
        NO_CRISIS_ESCALATION: 'NO_CRISIS_ESCALATION',
        GDPR_CONSENT: 'GDPR_CONSENT',
        DIGA_EVIDENCE: 'DIGA_EVIDENCE',
        TRANSPARENCY: 'TRANSPARENCY',
        SAFETY_VIOLATION: 'SAFETY_VIOLATION',
        MEDICAL_SAFETY: 'MEDICAL_SAFETY',
        ILLEGAL_SUBSTANCE: 'ILLEGAL_SUBSTANCE',

        // Potential AI variations/Hallucinations mapping
        'CONTROLLED_SUBSTANCES_ACT': 'ILLEGAL_SUBSTANCE',
        'CONTROLLED_SUBSTANCE': 'ILLEGAL_SUBSTANCE',
        'SUBSTANCE_ABUSE': 'ILLEGAL_SUBSTANCE',
        'MEDICAL_MISINFORMATION': 'MEDICAL_SAFETY',
        'UNSAFE_MEDICAL_ADVICE': 'MEDICAL_SAFETY',
        'GDPR_VIOLATION': 'GDPR_CONSENT',
        'GDPR_ART_9': 'GDPR_CONSENT',
        'CRISIS_INTERVENTION': 'SUICIDE_SELF_HARM',
        'EU_AI_ACT_ART_5': 'MANIPULATION',
        'SYSTEM_ERROR': 'SYSTEM_ERROR'
    };

    return analysis.risks.map((risk) => {
        // Default to SAFETY_VIOLATION (High Severity) if unknown, rather than TRANSPARENCY (Low Severity)
        // This fails safe - unknown risks are treated as dangerous.
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

// Singleton instance
export const geminiService = new GeminiService();
