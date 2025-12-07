/**
 * Compliance Stats Component
 * Displays key metrics in a visually appealing card layout
 */
import styles from './ComplianceStats.module.css';

// Demo stats for MVP (would come from API in production)
const demoStats = {
    totalValidations: 127,
    passRate: 92.4,
    avgScore: 87,
    topRisk: 'GDPR Consent',
};

export function ComplianceStats() {
    return (
        <div className={styles.grid}>
            <StatCard
                label="Total Validations"
                value={demoStats.totalValidations.toString()}
                icon="📊"
                color="blue"
            />
            <StatCard
                label="Pass Rate"
                value={`${demoStats.passRate}%`}
                icon="✅"
                color="green"
            />
            <StatCard
                label="Avg Score"
                value={demoStats.avgScore.toString()}
                icon="📈"
                color="purple"
            />
            <StatCard
                label="Top Risk"
                value={demoStats.topRisk}
                icon="⚠️"
                color="orange"
            />
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
    return (
        <div className={`${styles.card} ${styles[color]}`}>
            <span className={styles.icon}>{icon}</span>
            <div className={styles.content}>
                <span className={styles.value}>{value}</span>
                <span className={styles.label}>{label}</span>
            </div>
        </div>
    );
}
