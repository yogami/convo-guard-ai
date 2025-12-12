'use client';
/**
 * Policy Status Component
 * Displays the current status of the Policy Engine connection.
 */
import { useState, useEffect } from 'react';
import styles from './PolicyStatus.module.css';

interface Policy {
    id: string;
    name: string;
    description: string;
    enabled?: boolean;
}

export function PolicyStatus() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/policies')
            .then(res => res.json())
            .then(data => {
                if (data.policies) setPolicies(data.policies);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const togglePolicy = async (id: string, currentEnabled: boolean) => {
        const newEnabled = !currentEnabled;
        // Optimistic update
        setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: newEnabled } : p));

        try {
            await fetch('/api/policies', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, enabled: newEnabled })
            });
        } catch (error) {
            // Revert on error
            setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: currentEnabled } : p));
        }
    };

    // Default to true if undefined
    const activeCount = policies.filter(p => p.enabled !== false).length;

    return (
        <div className={styles.container}>
            <div
                className={styles.indicator}
                onClick={() => setExpanded(!expanded)}
                style={{ cursor: 'pointer' }}
                title="Click to configure policies"
            >
                <span className={styles.pulse}></span>
                <span className={styles.text}>EU Regulatory Database: <strong>CONNECTED</strong></span>
                <span className={styles.caret}>{expanded ? '▼' : '▶'}</span>
            </div>
            <div className={styles.meta}>
                <span>Active Policies: {activeCount}/{policies.length}</span>
                <span className={styles.separator}>•</span>
                <span onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Configure</span>
            </div>

            {expanded && (
                <div className={styles.policyList}>
                    {loading && <div className={styles.policyDesc}>Loading regulations...</div>}
                    {policies.map(p => (
                        <div key={p.id} className={styles.policyItem}>
                            <input
                                type="checkbox"
                                checked={p.enabled !== false}
                                onChange={() => togglePolicy(p.id, p.enabled !== false)}
                                style={{ cursor: 'pointer', marginTop: '3px' }}
                            />
                            <div className={styles.policyInfo}>
                                <div className={styles.policyName}>{p.name}</div>
                                <div className={styles.policyDesc}>{p.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
