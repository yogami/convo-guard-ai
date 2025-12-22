
export interface Regulation {
    id: string; // e.g., "EU_AI_ACT_ART_83"
    name: string; // e.g., "EU AI Act Article 83"
    description: string;
    url: string;
    jurisdiction: 'EU' | 'US' | 'GLOBAL' | 'DE';
}

export const REGULATION_REGISTRY: Record<string, Regulation> = {
    'EU_AI_ACT_ART_5': {
        id: 'EU_AI_ACT_ART_5',
        name: 'EU AI Act Article 5',
        description: 'Prohibition of manipulative or exploitative AI practices.',
        url: 'https://artificialintelligenceact.eu/article/5/',
        jurisdiction: 'EU'
    },
    'EU_AI_ACT_ART_6': {
        id: 'EU_AI_ACT_ART_6',
        name: 'EU AI Act Article 6',
        description: 'Classification rules for high-risk AI systems (Employment, HR, Recruitment).',
        url: 'https://artificialintelligenceact.eu/article/6/',
        jurisdiction: 'EU'
    },
    'EU_AI_ACT_ART_47': {
        id: 'EU_AI_ACT_ART_47',
        name: 'EU AI Act Article 47',
        description: 'EU Declaration of Conformity requirements for high-risk AI.',
        url: 'https://artificialintelligenceact.eu/article/47/',
        jurisdiction: 'EU'
    },
    'EU_AI_ACT_ART_52': {
        id: 'EU_AI_ACT_ART_52',
        name: 'EU AI Act Article 52',
        description: 'Transparency obligations for certain AI systems (Chatbots must disclose they are AI).',
        url: 'https://artificialintelligenceact.eu/article/52/',
        jurisdiction: 'EU'
    },
    'GDPR_ART_7': {
        id: 'GDPR_ART_7',
        name: 'GDPR Article 7',
        description: 'Conditions for consent.',
        url: 'https://gdpr-info.eu/art-7-gdpr/',
        jurisdiction: 'EU'
    },
    'DIGA_DI_GUIDE': {
        id: 'DIGA_DI_GUIDE',
        name: 'DiGA Fast-Track Guide',
        description: 'Positive healthcare effect evidence requirements (Clinical monitoring).',
        url: 'https://www.bfarm.de/EN/Medical-Devices/DiGA/_node.html',
        jurisdiction: 'DE'
    },
    'GENERAL_SAFETY': {
        id: 'GENERAL_SAFETY',
        name: 'General Safety Standards',
        description: 'General obligation to prevent harm to users.',
        url: 'https://example.com/safety',
        jurisdiction: 'GLOBAL'
    }
};
