'use client';

import { Suspense, useState } from 'react';
import styles from './dashboard.module.css';
import { ComplianceStats } from './components/ComplianceStats';
import { ExportButton } from './components/ExportButton';
import { ChatSimulator } from './components/ChatSimulator';
import { PolicyPacksSection } from './components/PolicyPacksSection';
import { TenantProvider } from './components/TenantContext';
import { TenantSelector } from './components/TenantSelector';
import { PolicyPackSelector } from './components/PolicyPackSelector';
import { LifecycleView } from './components/LifecycleView';
import { CertificationStatus } from './components/CertificationStatus';
import { IntentDriftGraph } from './components/IntentDriftGraph';
import { ComplianceReplayViewer } from './components/ComplianceReplayViewer';

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
                            Clinical Circuit Breaker & Compliance Engine
                        </p>
                        <TenantSelector />
                    </div>
                </div>
                <ExportButton />
            </header>

            <main className={styles.main}>
                {/* Compliance Overview */}
                <section className={styles.statsSection}>
                    <Suspense fallback={<div className={styles.loading}>Loading stats...</div>}>
                        <ComplianceStats />
                    </Suspense>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Left Column: Clinical Feed & Intent Drift */}
                    <div>
                        <section className={styles.validationsSection}>
                            <IntentDriftGraph />
                            <h2 className={styles.sectionTitle}>Multimodal Therapy Simulation</h2>
                            <p style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                                Test "Window of Tolerance" and Gracious Circuit Breaks. Try typing <em>"I feel numb"</em> or <em>"I want to freeze"</em>.
                            </p>
                            <Suspense fallback={<div className={styles.loading}>Loading simulator...</div>}>
                                <ChatSimulator />
                            </Suspense>
                        </section>
                    </div>

                    {/* Right Column: Regulatory Audit & Compliance */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <section className={styles.complianceRow}>
                            <div className={styles.lifecyclePanel} style={{ width: '100%' }}>
                                <LifecycleView currentStage="DEVELOPMENT" systemId="HelloBetter-Multimodal-Agent" />
                            </div>
                        </section>
                        
                        <section className={styles.complianceRow}>
                            <div className={styles.certPanel} style={{ width: '100%' }}>
                                <CertificationStatus systemId="HelloBetter-Multimodal-Agent" />
                            </div>
                        </section>

                        <section>
                            <ComplianceReplayViewer />
                        </section>
                    </div>
                </div>

                {/* Policy Packs Grid */}
                <Suspense fallback={<div className={styles.loading}>Loading policy packs...</div>}>
                    <PolicyPacksSection />
                </Suspense>

            </main>

            <footer className={styles.footer}>
                <p>EU AI Act • DiGA • GDPR Compliant</p>
                <p className={styles.version}>v2.5.0 - HelloBetter Frontier Edition</p>
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
