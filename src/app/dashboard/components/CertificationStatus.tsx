'use client';

import React, { useState, useEffect } from 'react';
import styles from './CertificationStatus.module.css';

interface DeclarationOfConformity {
    id: string;
    systemName: string;
    issueDate: string;
    expiryDate?: string;
    conformsToAIAct: boolean;
    harmonizedStandards: string[];
    notifiedBodyId?: string;
}

interface CertificationStatusProps {
    systemId?: string;
}

export function CertificationStatus({ systemId = 'HelloBetter-Multimodal-Agent' }: CertificationStatusProps) {
    const [doc, setDoc] = useState<DeclarationOfConformity | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial check (mock logic for demo)
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setDoc(null);
            setIsLoading(false);
        }, 500);
    }, [systemId]);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const payload = {
                systemInfo: {
                    name: systemId,
                    version: '2.0.0',
                    description: 'Multimodal Therapeutic Agent with ConvoGuard AI Circuit Breaker',
                    classification: 'HIGH_RISK_ANNEX_III',
                    intendedPurpose: 'Mental health support and intervention'
                },
                providerInfo: {
                    name: 'HelloBetter GmbH',
                    address: 'Berlin, Germany',
                    contactEmail: 'compliance@hellobetter.de',
                    authorizedRepresentative: 'David Ebert'
                },
                assessmentResults: {
                    compliant: true,
                    lastAssessmentDate: new Date().toISOString(),
                    violations: []
                }
            };

            const res = await fetch('/api/generate-doc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to generate DoC');
            
            const data = await res.json();
            setDoc(data.doc);
            
            // Trigger automatic download of the HTML version for the demo
            const blob = new Blob([data.html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `EU_AI_Act_DoC_${systemId}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (err) {
            setError('Failed to generate documentation.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className={styles.container}><div className={styles.loading}>Generating EU AI Act Documentation...</div></div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!doc) {
        return (
            <div className={styles.container}>
                <div className={styles.noDoc}>
                    <span className={styles.warningIcon}>⚠️</span>
                    <p>No EU AI Act Declaration of Conformity found for <strong>{systemId}</strong>.</p>
                    <button className={styles.generateBtn} onClick={handleGenerate} style={{marginTop: '10px', background: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        Generate Official DoC
                    </button>
                </div>
            </div>
        );
    }

    const daysUntilExpiry = doc.expiryDate
        ? Math.floor((new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.statusBadge} data-status={doc.conformsToAIAct ? 'valid' : 'invalid'}>
                    {doc.conformsToAIAct ? '✓ EU AI Act Compliant' : '✗ Non-Compliant'}
                </div>
                <span className={styles.docId}>{doc.id}</span>
            </div>

            <div className={styles.details}>
                <div className={styles.detailRow}>
                    <span className={styles.label}>System:</span>
                    <span className={styles.value}>{doc.systemName}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.label}>Issued:</span>
                    <span className={styles.value}>{new Date(doc.issueDate).toLocaleDateString()}</span>
                </div>
                {doc.expiryDate && (
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Expires:</span>
                        <span className={`${styles.value} ${daysUntilExpiry && daysUntilExpiry < 30 ? styles.expiringSoon : ''}`}>
                            {new Date(doc.expiryDate).toLocaleDateString()}
                            {daysUntilExpiry !== null && (
                                <span className={styles.daysLeft}>({daysUntilExpiry} days)</span>
                            )}
                        </span>
                    </div>
                )}
            </div>

            <div className={styles.standards}>
                <span className={styles.label}>Standards:</span>
                <div className={styles.standardsList}>
                    {doc.harmonizedStandards?.map((std) => (
                        <span key={std} className={styles.standardBadge}>{std}</span>
                    ))}
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.viewBtn}>View File</button>
                <button className={styles.exportBtn} onClick={handleGenerate}>Re-Export PDF</button>
            </div>
        </div>
    );
}
