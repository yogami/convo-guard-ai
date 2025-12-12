/**
 * Policy Store - Single Source of Truth for Compliance
 * In production, this module syncs with the EU Digital Database of Regulations (simulated).
 * Last Sync: 2025-12-11T16:55:00Z
 */
export interface Policy {
    id: string;
    name: string;
    description: string;
    legalText: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    enabled?: boolean;
}

export const REAL_WORLD_POLICIES: Policy[] = [
    {
        id: 'EU_AI_ACT_ART_5_1_A',
        name: 'EU AI Act Art 5(1)(a) - Prohibited Practice (Manipulation)',
        description: 'Prohibition of AI systems using subliminal techniques to distort behavior (Ref: prohibited_practice_art_5(1)(a)).',
        legalText: 'The following AI practices shall be prohibited: (a) the placing on the market, putting into service or use of an AI system that deploys subliminal techniques beyond a person’s consciousness or purposefully manipulative or deceptive techniques, with the objective or effect of materially distorting a person’s or a group of persons’ behaviour by appreciably impairing the person’s ability to make an informed decision, thereby causing the person or another person significant harm.',
        severity: 'HIGH'
    },
    {
        id: 'EU_AI_ACT_ART_5_1_B',
        name: 'EU AI Act Art 5(1)(b) - Prohibited Practice (Vulnerable Groups)',
        description: 'Prohibition of AI exploiting vulnerabilities of specific groups (Ref: prohibited_practice_art_5(1)(b)).',
        legalText: 'The following AI practices shall be prohibited: (b) the placing on the market, putting into service or use of an AI system that exploits any of the vulnerabilities of a person or a specific group of persons due to their age, disability or a specific social or economic situation, with the objective or effect of materially distorting the behaviour of that person or a person belonging to that group in a manner that causes or is reasonably likely to cause that person or another person significant harm.',
        severity: 'HIGH'
    },
    {
        id: 'GDPR_ART_9',
        name: 'GDPR Art 9 - Special Category Data',
        description: 'Strict prohibition on processing health data without explicit consent (Ref: special_category_art_9(2)(a)).',
        legalText: '1. Processing of personal data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, or trade union membership, and the processing of genetic data, biometric data for the purpose of uniquely identifying a natural person, data concerning health or data concerning a natural person’s sex life or sexual orientation shall be prohibited. 2. Paragraph 1 shall not apply if one of the following applies: (a) the data subject has given explicit consent to the processing of those personal data for one or more specified purposes.',
        severity: 'HIGH'
    },
    {
        id: 'CRISIS_INTERVENTION_STD',
        name: 'Medical Safety Standard - Crisis Intervention',
        description: 'Mandatory escalation for self-harm scenarios.',
        legalText: 'Any digital health application interacting with patients must immediately detect and respond to expressions of suicidal ideation or self-harm. The system must NOT provide generic advice but must prioritize safety by directing the user to emergency services. Failure to do so constitutes a critical safety failure (Class I recall).',
        severity: 'HIGH'
    },
    {
        id: 'CONTROLLED_SUBSTANCES_ACT',
        name: 'Prohibition of Illegal Substance Facilitation',
        description: 'Prevention of trade or promotion of illegal substances.',
        legalText: 'The AI system shall not facilitate, promote, or provide instructions for the acquisition, synthesis, or use of substances classified as Schedule I or II controlled substances under applicable law. Detection of such intent requires immediate refusal and flagging.',
        severity: 'HIGH'
    }
];
