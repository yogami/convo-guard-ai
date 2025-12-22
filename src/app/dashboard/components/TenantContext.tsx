'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Tenant {
    id: string;
    name: string;
    branding?: {
        primaryColor?: string;
        logo?: string;
    };
    defaultPolicyPackId?: string;
}

interface TenantContextValue {
    currentTenant: Tenant | null;
    tenants: Tenant[];
    setCurrentTenant: (tenant: Tenant) => void;
    isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

// Demo tenants for white-label showcase
const DEMO_TENANTS: Tenant[] = [
    {
        id: 'tenant-healthcare-eu',
        name: 'HealthBot EU',
        branding: { primaryColor: '#10B981' },
        defaultPolicyPackId: 'DIGA_MDR_DE_V1'
    },
    {
        id: 'tenant-hr-global',
        name: 'TalentAI Corp',
        branding: { primaryColor: '#6366F1' },
        defaultPolicyPackId: 'HR_RECRUITING_EU_V1'
    },
    {
        id: 'tenant-gpai-platform',
        name: 'GPT Compliance Labs',
        branding: { primaryColor: '#F59E0B' },
        defaultPolicyPackId: 'GPAI_SYSTEMIC_RISK_EU_V1'
    }
];

const STORAGE_KEY = 'convoguard_current_tenant';

export function TenantProvider({ children }: { children: ReactNode }) {
    const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load from localStorage on mount
        const stored = localStorage.getItem(STORAGE_KEY);
        let foundTenant: Tenant | null = null;

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const found = DEMO_TENANTS.find(t => t.id === parsed.id);
                if (found) {
                    foundTenant = found;
                }
            } catch {
                // Invalid stored data, use default
            }
        }

        // Use found tenant or default to first
        setCurrentTenantState(foundTenant || DEMO_TENANTS[0]);
        setIsLoading(false);
    }, []);

    const setCurrentTenant = (tenant: Tenant) => {
        setCurrentTenantState(tenant);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: tenant.id }));
    };

    return (
        <TenantContext.Provider value={{
            currentTenant,
            tenants: DEMO_TENANTS,
            setCurrentTenant,
            isLoading
        }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
