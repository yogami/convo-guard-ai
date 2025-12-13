import { Suspense } from 'react';
import styles from './dashboard.module.css';
import { ComplianceStats } from './components/ComplianceStats';
import { ExportButton } from './components/ExportButton';
import { PolicyStatus } from './components/PolicyStatus';
import { ChatSimulator } from './components/ChatSimulator';
import { PolicyPacksSection } from './components/PolicyPacksSection';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
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
                            Conversation Policy Engine Dashboard
                        </p>
                        <PolicyStatus />
                    </div>
                </div>
                <ExportButton />
            </header>

            <main className={styles.main}>
                <section className={styles.statsSection}>
                    <Suspense fallback={<div className={styles.loading}>Loading stats...</div>}>
                        <ComplianceStats />
                    </Suspense>
                </section>

                <Suspense fallback={<div className={styles.loading}>Loading policy packs...</div>}>
                    <PolicyPacksSection />
                </Suspense>

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
                <p className={styles.version}>v1.0.0</p>
            </footer>
        </div>
    );
}

