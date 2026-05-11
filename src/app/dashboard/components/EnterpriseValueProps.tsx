'use client';

import React from 'react';
import styles from './EnterpriseValueProps.module.css';

export function EnterpriseValueProps() {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>🛠️ Infrastructure MVP Benefits</h3>
            
            <div className={styles.propList}>
                <div className={styles.propItem} style={{ borderLeftColor: '#3b82f6' }}>
                    <div className={styles.propIcon}>⚙️</div>
                    <div className={styles.propContent}>
                        <h4>The Boring Rules Engine</h4>
                        <p>A drop-in, sub-200ms deterministic safety net. Instead of your ML engineers wasting sprints building a custom rules engine from scratch, configure hard-coded boundary constraints via simple JSON APIs.</p>
                    </div>
                </div>

                <div className={styles.propItem} style={{ borderLeftColor: '#10b981' }}>
                    <div className={styles.propIcon}>📋</div>
                    <div className={styles.propContent}>
                        <h4>The Boring Audit Logs</h4>
                        <p>We generate the exact forensic JSON logs and replay timelines that regulators and auditors demand, saving your team the hassle of building a compliant logging architecture.</p>
                    </div>
                </div>

                <div className={styles.propItem} style={{ borderLeftColor: '#f59e0b' }}>
                    <div className={styles.propIcon}>📊</div>
                    <div className={styles.propContent}>
                        <h4>The Boring Billing Extraction</h4>
                        <p>Sits on the conversation stream to passively extract SGB V AbEM outcome data and CPT codes, freeing your clinical researchers from writing text-parsing scripts.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
