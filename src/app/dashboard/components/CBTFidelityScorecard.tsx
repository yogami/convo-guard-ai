'use client';

import React, { useState } from 'react';
import styles from './CBTFidelityScorecard.module.css';

export function CBTFidelityScorecard() {
    const [isExporting, setIsExporting] = useState(false);
    const [exported, setExported] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        // Simulate API generation delay
        setTimeout(() => {
            const blob = new Blob(['Mock SOAP Note Data'], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SOAP_Note_Export_${new Date().getTime()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setIsExporting(false);
            setExported(true);
        }, 1500);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>🧠 CBT Protocol Fidelity</h3>
                <div className={styles.scoreBadge}>94% Adherent</div>
            </div>

            <div className={styles.driftSection}>
                <div className={styles.driftTitle}>Session Telemetry & Drift Tags</div>
                <div className={styles.tagList}>
                    <span className={`${styles.tag} ${styles.adherent}`}>✓ Psychoeducation</span>
                    <span className={`${styles.tag} ${styles.adherent}`}>✓ Cognitive Restructuring</span>
                    <span className={`${styles.tag} ${styles.drift}`}>⚠️ Off-label Nutrition Drift</span>
                    <span className={`${styles.tag} ${styles.correction}`}>⟲ Auto-Corrected to Protocol</span>
                    <span className={`${styles.tag} ${styles.adherent}`}>✓ Homework Assignment</span>
                </div>
            </div>

            <div className={styles.exportSection}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Extracted Billing Codes</div>
                    <div className={styles.cptCode}>CPT: 989X2 / ICD-10: F32.9</div>
                </div>
                <button 
                    className={styles.exportBtn}
                    onClick={handleExport}
                    disabled={isExporting}
                >
                    {isExporting ? 'Generating...' : exported ? '✓ Note Exported' : 'Generate SOAP Note'}
                </button>
            </div>
        </div>
    );
}
