/**
 * Dashboard Page - Compliance Validation Dashboard
 * Shows recent validations, trends, and export functionality
 */
import { Suspense } from 'react';
import styles from './dashboard.module.css';
import { ValidationList } from './components/ValidationList';
import { ComplianceStats } from './components/ComplianceStats';
import { ExportButton } from './components/ExportButton';
import { PolicyStatus } from './components/PolicyStatus';

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
                            Mental Health AI Compliance Dashboard
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

                <section className={styles.validationsSection}>
                    <h2 className={styles.sectionTitle}>Recent Validations</h2>
                    <Suspense fallback={<div className={styles.loading}>Loading validations...</div>}>
                        <ValidationList />
                    </Suspense>
                </section>
            </main>

            <footer className={styles.footer}>
                <p>EU AI Act • DiGA • GDPR Compliant</p>
                <p className={styles.version}>v0.1.0 MVP</p>
            </footer>
        </div>
    );
}
