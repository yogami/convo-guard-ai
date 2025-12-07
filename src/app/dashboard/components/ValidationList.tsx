/**
 * Validation List Component
 * Displays recent validation results in a table format
 */
import styles from './ValidationList.module.css';

// Demo data for MVP
const demoValidations = [
    {
        id: 'val-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        compliant: true,
        score: 100,
        risks: [],
    },
    {
        id: 'val-002',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        compliant: false,
        score: 50,
        risks: [{ category: 'SUICIDE_SELF_HARM', severity: 'HIGH' }],
    },
    {
        id: 'val-003',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        compliant: true,
        score: 85,
        risks: [{ category: 'GDPR_CONSENT', severity: 'MEDIUM' }],
    },
    {
        id: 'val-004',
        timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
        compliant: true,
        score: 95,
        risks: [{ category: 'TRANSPARENCY', severity: 'LOW' }],
    },
    {
        id: 'val-005',
        timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
        compliant: true,
        score: 100,
        risks: [],
    },
];

export function ValidationList() {
    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Risks</th>
                        <th>Audit ID</th>
                    </tr>
                </thead>
                <tbody>
                    {demoValidations.map((validation) => (
                        <tr key={validation.id}>
                            <td className={styles.time}>
                                {formatRelativeTime(validation.timestamp)}
                            </td>
                            <td>
                                <span
                                    className={`${styles.status} ${validation.compliant ? styles.pass : styles.fail
                                        }`}
                                >
                                    {validation.compliant ? 'PASS' : 'FAIL'}
                                </span>
                            </td>
                            <td>
                                <span className={getScoreClass(validation.score, styles)}>
                                    {validation.score}
                                </span>
                            </td>
                            <td>
                                {validation.risks.length === 0 ? (
                                    <span className={styles.noRisks}>—</span>
                                ) : (
                                    <div className={styles.risks}>
                                        {validation.risks.map((risk, i) => (
                                            <span
                                                key={i}
                                                className={`${styles.riskBadge} ${styles[risk.severity.toLowerCase()]
                                                    }`}
                                            >
                                                {formatRiskCategory(risk.category)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </td>
                            <td className={styles.auditId}>
                                <code>{validation.id}</code>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function formatRelativeTime(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function formatRiskCategory(category: string): string {
    return category
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getScoreClass(score: number, styles: Record<string, string>): string {
    if (score >= 90) return styles.scoreHigh;
    if (score >= 70) return styles.scoreMedium;
    return styles.scoreLow;
}
