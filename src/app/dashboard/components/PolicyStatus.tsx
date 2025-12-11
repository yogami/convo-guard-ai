/**
 * Policy Status Component
 * Displays the current status of the Policy Engine connection.
 */
import styles from './PolicyStatus.module.css';

export function PolicyStatus() {
    // In a real app, this would fetch status from an API endpoint
    // For demo, we simulate a "Live" connection
    return (
        <div className={styles.container}>
            <div className={styles.indicator}>
                <span className={styles.pulse}></span>
                <span className={styles.text}>EU Regulatory Database: <strong>CONNECTED</strong></span>
            </div>
            <div className={styles.meta}>
                <span>Last Sync: Just now</span>
                <span className={styles.separator}>•</span>
                <span>Active Policies: 6</span>
            </div>
        </div>
    );
}
