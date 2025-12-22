'use client';

import React from 'react';
import { useTenant, Tenant } from './TenantContext';
import styles from './TenantSelector.module.css';

export function TenantSelector() {
    const { currentTenant, tenants, setCurrentTenant, isLoading } = useTenant();

    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = tenants.find(t => t.id === e.target.value);
        if (selected) {
            setCurrentTenant(selected);
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.label} htmlFor="tenant-selector">
                Organization:
            </label>
            <select
                id="tenant-selector"
                className={styles.select}
                value={currentTenant?.id || ''}
                onChange={handleChange}
                style={{
                    borderColor: currentTenant?.branding?.primaryColor || '#6366F1'
                }}
            >
                {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
