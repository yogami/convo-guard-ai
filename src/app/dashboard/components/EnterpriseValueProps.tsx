'use client';

import React from 'react';
import styles from './EnterpriseValueProps.module.css';

export function EnterpriseValueProps() {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>🏢 Enterprise Operational Leverage</h3>
            
            <div className={styles.propList}>
                <div className={styles.propItem} style={{ borderLeftColor: '#10b981' }}>
                    <div className={styles.propIcon}>📈</div>
                    <div className={styles.propContent}>
                        <h4>Automated AbEM Data Extraction</h4>
                        <p>Protects your 20% performance-linked DiGA reimbursement by passively extracting SGB V compliant real-world outcome data from the multimodal stream, eliminating PHQ-9 survey friction.</p>
                    </div>
                </div>

                <div className={styles.propItem} style={{ borderLeftColor: '#f59e0b' }}>
                    <div className={styles.propIcon}>🛡️</div>
                    <div className={styles.propContent}>
                        <h4>Strict Liability Risk Transfer (PLD)</h4>
                        <p>Under the 2026 EU Product Liability Directive, building a safety layer in-house subjects you to strict civil liability. Deploying ConvoGuard acts as a legal shield, transferring risk and reducing cyber-insurance premiums.</p>
                    </div>
                </div>

                <div className={styles.propItem} style={{ borderLeftColor: '#3b82f6' }}>
                    <div className={styles.propIcon}>🏥</div>
                    <div className={styles.propContent}>
                        <h4>AI-Augmented Medical Coding</h4>
                        <p>Automatically executes NLP to extract clinical details and maps them to 2026 ICD-10 and CPT codes (e.g., 90834), preventing technical claims denials and accelerating your Revenue Cycle Management.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
