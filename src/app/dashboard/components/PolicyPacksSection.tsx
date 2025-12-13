'use client';

import { useState, useEffect } from 'react';
import styles from './PolicyPacksSection.module.css';

interface PolicyPack {
    id: string;
    name: string;
    version: string;
    description: string;
    domain: string;
    jurisdiction: string;
    effectiveFrom?: string;
    ruleCount: number;
}

export function PolicyPacksSection() {
    const [packs, setPacks] = useState<PolicyPack[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/policy-packs')
            .then(res => res.json())
            .then(data => {
                setPacks(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className={styles.loading}>Loading policy packs...</div>;
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>📋 Available Policy Packs</h2>
            <div className={styles.packGrid}>
                {packs.map(pack => (
                    <div key={pack.id} className={styles.packCard}>
                        <div className={styles.packHeader}>
                            <span className={styles.packName}>{pack.name}</span>
                            <span className={styles.packVersion}>v{pack.version}</span>
                        </div>
                        <p className={styles.packDescription}>{pack.description}</p>
                        <div className={styles.packMeta}>
                            <span className={styles.badge}>{pack.domain}</span>
                            <span className={styles.badge}>{pack.jurisdiction}</span>
                            <span className={styles.ruleCount}>{pack.ruleCount} rules</span>
                        </div>
                        {pack.effectiveFrom && (
                            <div className={styles.effectiveDate}>
                                Effective from: {new Date(pack.effectiveFrom).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
