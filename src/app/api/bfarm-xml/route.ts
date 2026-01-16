/**
 * POST /api/bfarm-xml
 * BfArM-compliant XML export for regulatory submission
 * 
 * Request: { transcript: string, appId?: string, auditDate?: string }
 * Response: XML document (Content-Type: application/xml)
 */
import { NextRequest, NextResponse } from 'next/server';
import { policyEngine } from '@/lib/compliance-engine/policy_engine/PolicyEngine';
import { createConversation, ConversationMessage } from '@/domain/entities/Conversation';

export const runtime = 'nodejs';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// German translations
const DE_TRANSLATIONS: Record<string, string> = {
    'SUICIDE_SELF_HARM': 'Suizid/Selbstverletzung',
    'NO_CRISIS_ESCALATION': 'Fehlende Krisenintervention',
    'MANIPULATION': 'Manipulation',
    'BIAS': 'Diskriminierung',
    'PII_EXPOSURE': 'Personenbezogene Daten',
    'HIGH': 'HOCH',
    'MEDIUM': 'MITTEL',
    'LOW': 'NIEDRIG',
    'CRITICAL': 'KRITISCH',
    'EU_AI_ACT_ART_5': 'EU KI-Verordnung Art. 5',
    'DIGA_DI_GUIDE': 'DiGAV Leitfaden',
    'GENERAL_SAFETY': 'Allgemeine Sicherheit',
};

function translate(key: string): string {
    return DE_TRANSLATIONS[key] || key;
}

function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transcript, appId = 'DIGA-TEST-001', auditDate } = body;

        if (!transcript) {
            return NextResponse.json(
                { error: 'Transcript ist erforderlich' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Parse transcript into messages
        const messages: ConversationMessage[] = [{
            role: 'user',
            content: transcript,
            timestamp: new Date(),
        }];

        const conversation = createConversation(messages);
        const evaluation = await policyEngine.evaluate(conversation, 'MENTAL_HEALTH_EU_V1');

        const now = new Date(auditDate || Date.now());
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toISOString().split('T')[1].split('.')[0];

        // Generate BfArM-compliant XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<BfArMKonformitaetsbericht 
    xmlns="urn:bfarm:diga:konformitaet:2026"
    version="1.0"
    erstellungsdatum="${dateStr}T${timeStr}Z">
    
    <!-- KOPFDATEN -->
    <Kopfdaten>
        <DiGAAppId>${escapeXml(appId)}</DiGAAppId>
        <PruefungsId>${evaluation.auditId}</PruefungsId>
        <PruefungsDatum>${dateStr}</PruefungsDatum>
        <PruefungsZeit>${timeStr}</PruefungsZeit>
        <PruefungsSystem>ConvoGuard AI v1.0</PruefungsSystem>
        <Hersteller>Berlin AI Labs GmbH</Hersteller>
    </Kopfdaten>

    <!-- ABSCHNITT 1: PRÜFERGEBNIS -->
    <Pruefergebnis>
        <Konform>${evaluation.compliant ? 'JA' : 'NEIN'}</Konform>
        <Konformitaetswert>${evaluation.score}</Konformitaetswert>
        <MaximalWert>100</MaximalWert>
        <Regelwerk>MENTAL_HEALTH_EU_V1</Regelwerk>
        <Verarbeitungszeit unit="ms">0</Verarbeitungszeit>
    </Pruefergebnis>

    <!-- ABSCHNITT 2: GEPRÜFTER INHALT -->
    <GepruefterInhalt>
        <Transkript><![CDATA[${transcript}]]></Transkript>
    </GepruefterInhalt>

    <!-- ABSCHNITT 3: FESTGESTELLTE VERSTÖSSE -->
    <Verstoesse anzahl="${evaluation.violations.length}">
        ${evaluation.violations.map((v, i) => `
        <Verstoss nummer="${i + 1}">
            <Kategorie>${escapeXml(translate(v.category))}</Kategorie>
            <KategorieCode>${escapeXml(v.category)}</KategorieCode>
            <Schweregrad>${escapeXml(translate(v.severity))}</Schweregrad>
            <SchweregradCode>${escapeXml(v.severity)}</SchweregradCode>
            <Beschreibung>${escapeXml(v.message)}</Beschreibung>
            <RegelId>${escapeXml(v.ruleId || 'UNKNOWN')}</RegelId>
            <Rechtsgrundlagen>
                ${(v.regulationIds || []).map(r => `<Rechtsgrundlage code="${escapeXml(r)}">${escapeXml(translate(r))}</Rechtsgrundlage>`).join('\n                ')}
            </Rechtsgrundlagen>
        </Verstoss>`).join('')}
    </Verstoesse>

    <!-- ABSCHNITT 4: EU KI-VERORDNUNG MAPPING -->
    <RegulatoritscheZuordnung>
        <Verordnung>
            <Name>EU KI-Verordnung (AI Act) Art. 5 - Verbotene Praktiken</Name>
            <Status>${evaluation.violations.some(v => v.regulationIds?.includes('EU_AI_ACT_ART_5')) ? 'VERSTOSS' : 'KONFORM'}</Status>
        </Verordnung>
        <Verordnung>
            <Name>DiGAV - Digitale Gesundheitsanwendungen Verordnung</Name>
            <Status>${evaluation.violations.some(v => v.regulationIds?.includes('DIGA_DI_GUIDE')) ? 'VERSTOSS' : 'KONFORM'}</Status>
        </Verordnung>
        <Verordnung>
            <Name>Allgemeine Patientensicherheit</Name>
            <Status>${evaluation.violations.some(v => v.regulationIds?.includes('GENERAL_SAFETY')) ? 'VERSTOSS' : 'KONFORM'}</Status>
        </Verordnung>
    </RegulatoritscheZuordnung>

    <!-- ABSCHNITT 5: EMPFEHLUNGEN -->
    <Empfehlungen>
        ${!evaluation.compliant ? `
        <Empfehlung prioritaet="1">Sofortige Überprüfung des KI-Systems durch das klinische Team</Empfehlung>
        <Empfehlung prioritaet="2">Dokumentation des Vorfalls im Qualitätsmanagement-System</Empfehlung>
        <Empfehlung prioritaet="3">Ggf. Meldung an zuständige Aufsichtsbehörde (BfArM)</Empfehlung>
        <Empfehlung prioritaet="4">Anpassung der Sicherheitsfilter im KI-Modell</Empfehlung>
        ` : `
        <Empfehlung prioritaet="1">Keine sofortigen Maßnahmen erforderlich</Empfehlung>
        <Empfehlung prioritaet="2">Weiterhin regelmäßige Überwachung empfohlen</Empfehlung>
        `}
    </Empfehlungen>

    <!-- ABSCHNITT 6: UNTERSCHRIFTEN -->
    <Unterschriften>
        <Unterschrift>
            <Rolle>Prüfer</Rolle>
            <Datum></Datum>
            <Name></Name>
        </Unterschrift>
        <Unterschrift>
            <Rolle>QM-Beauftragter</Rolle>
            <Datum></Datum>
            <Name></Name>
        </Unterschrift>
    </Unterschriften>

    <!-- PRÜFSIEGEL -->
    <Pruefsiegel>
        <Text>AUTOMATISIERTE PRÜFUNG</Text>
        <System>ConvoGuard AI Compliance Engine</System>
        <ProtokollId>${evaluation.auditId}</ProtokollId>
    </Pruefsiegel>

</BfArMKonformitaetsbericht>`;

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Content-Disposition': `attachment; filename="bfarm_konformitaetsbericht_${evaluation.auditId.slice(0, 8)}.xml"`,
                ...corsHeaders,
            },
        });

    } catch (error: any) {
        console.error('BfArM XML generation error:', error);
        return NextResponse.json(
            { error: 'Interner Serverfehler', details: error?.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
