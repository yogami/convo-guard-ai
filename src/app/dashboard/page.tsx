'use client';

import { Suspense, useState } from 'react';
import styles from './dashboard.module.css';
import { ComplianceStats } from './components/ComplianceStats';
import { ExportButton } from './components/ExportButton';
import { PolicyStatus } from './components/PolicyStatus';
import { ChatSimulator } from './components/ChatSimulator';
import { PolicyPacksSection } from './components/PolicyPacksSection';
import { TenantProvider } from './components/TenantContext';
import { TenantSelector } from './components/TenantSelector';
import { PolicyPackSelector } from './components/PolicyPackSelector';
import { LifecycleView } from './components/LifecycleView';
import { CertificationStatus } from './components/CertificationStatus';

export const dynamic = 'force-dynamic';

function DashboardContent() {
    const [selectedPolicyPack, setSelectedPolicyPack] = useState<string>('MENTAL_HEALTH_EU_V1');

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        <span className={styles.logo}>🛡️</span>
                        ConvoGuard AI
                    </h1>
                    <div className={styles.headerMeta}>
                        <p className={styles.subtitle}>
                            AI Compliance Autopilot Dashboard
                        </p>
                        <TenantSelector />
                    </div>
                </div>
                <ExportButton />
            </header>

            <main className={styles.main}>
                {/* Policy Pack Selection */}
                <section className={styles.policySection}>
                    <PolicyPackSelector onPackChange={setSelectedPolicyPack} />
                </section>

                {/* Compliance Overview */}
                <section className={styles.statsSection}>
                    <Suspense fallback={<div className={styles.loading}>Loading stats...</div>}>
                        <ComplianceStats />
                    </Suspense>
                </section>

                {/* Lifecycle & Certification Row */}
                <section className={styles.complianceRow}>
                    <div className={styles.lifecyclePanel}>
                        <LifecycleView currentStage="DEVELOPMENT" systemId="ConvoGuard-Demo" />
                    </div>
                    <div className={styles.certPanel}>
                        <CertificationStatus systemId="ConvoGuard-Demo" />
                    </div>
                </section>

                {/* Policy Packs Grid */}
                <Suspense fallback={<div className={styles.loading}>Loading policy packs...</div>}>
                    <PolicyPacksSection />
                </Suspense>

                {/* Chat Simulator */}
                <section className={styles.validationsSection}>
                    <h2 className={styles.sectionTitle}>Compliance Demonstration</h2>
                    <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                        Test strict policy enforcement in real-time. Try inputs like <em>"I want fentanyl"</em> or <em>"I want to die"</em> to see the safeguards in action.
                    </p>
                    <Suspense fallback={<div className={styles.loading}>Loading simulator...</div>}>
                        <ChatSimulator />
                    </Suspense>
                </section>
            </main>

            <footer className={styles.footer}>
                <p>EU AI Act • DiGA • GDPR Compliant</p>
                <p className={styles.version}>v2.0.0 - White-Label Edition</p>
            </footer>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <TenantProvider>
            <DashboardContent />
        </TenantProvider>
    );
}
