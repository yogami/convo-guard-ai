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

export function CertificationStatus({ systemId = 'ConvoGuard-Demo' }: CertificationStatusProps) {
    const [doc, setDoc] = useState<DeclarationOfConformity | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // For demo purposes, we'll show a mock certification
    // In production, this would fetch from /api/declarations
    const mockDoc: DeclarationOfConformity = {
        id: 'DOC-2024-001',
        systemName: systemId,
        issueDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        conformsToAIAct: true,
        harmonizedStandards: ['ISO 42001:2023', 'ISO 27001:2022'],
        notifiedBodyId: 'NB-1234'
    };

    useEffect(() => {
        // Simulate loading
        setIsLoading(true);
        setTimeout(() => {
            setDoc(mockDoc);
            setIsLoading(false);
        }, 500);
    }, [systemId]);

    if (isLoading) {
        return <div className={styles.loading}>Loading certification status...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!doc) {
        return (
            <div className={styles.container}>
                <div className={styles.noDoc}>
                    <span className={styles.warningIcon}>⚠️</span>
                    <p>No Declaration of Conformity found</p>
                    <button className={styles.generateBtn}>
                        Generate DoC
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
                    {doc.conformsToAIAct ? '✓ Compliant' : '✗ Non-Compliant'}
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
                    {doc.harmonizedStandards.map((std) => (
                        <span key={std} className={styles.standardBadge}>{std}</span>
                    ))}
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.viewBtn}>View Full DoC</button>
                <button className={styles.exportBtn}>Export PDF</button>
            </div>
        </div>
    );
}
