'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from './TenantContext';
import styles from './PolicyPackSelector.module.css';

interface PolicyPack {
    id: string;
    name: string;
    version: string;
    description: string;
    domain: string;
    jurisdiction: string;
    ruleCount: number;
}

interface PolicyPackSelectorProps {
    onPackChange?: (packId: string) => void;
}

export function PolicyPackSelector({ onPackChange }: PolicyPackSelectorProps) {
    const { currentTenant } = useTenant();
    const [packs, setPacks] = useState<PolicyPack[]>([]);
    const [selectedPackId, setSelectedPackId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchPacks() {
            try {
                const response = await fetch('/api/policy-packs');
                const data = await response.json();
                setPacks(data);

                // Set default based on tenant or first pack
                const defaultPack = currentTenant?.defaultPolicyPackId || data[0]?.id;
                if (defaultPack) {
                    setSelectedPackId(defaultPack);
                    onPackChange?.(defaultPack);
                }
            } catch (error) {
                console.error('Failed to fetch policy packs:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPacks();
    }, [currentTenant]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const packId = e.target.value;
        setSelectedPackId(packId);
        onPackChange?.(packId);
    };

    const selectedPack = packs.find(p => p.id === selectedPackId);

    if (isLoading) {
        return <div className={styles.loading}>Loading policy packs...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.selectorRow}>
                <label className={styles.label} htmlFor="policy-pack-selector">
                    Active Policy Pack:
                </label>
                <select
                    id="policy-pack-selector"
                    className={styles.select}
                    value={selectedPackId}
                    onChange={handleChange}
                >
                    {packs.map((pack) => (
                        <option key={pack.id} value={pack.id}>
                            {pack.name} ({pack.jurisdiction})
                        </option>
                    ))}
                </select>
            </div>

            {selectedPack && (
                <div className={styles.packInfo}>
                    <span className={styles.domain}>{selectedPack.domain}</span>
                    <span className={styles.rules}>{selectedPack.ruleCount} rules</span>
                    <span className={styles.version}>v{selectedPack.version}</span>
                </div>
            )}
        </div>
    );
}
