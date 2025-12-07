/**
 * Export Button Component
 * Client component for CSV export functionality
 */
'use client';

import { useState } from 'react';
import styles from './ExportButton.module.css';

export function ExportButton() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch('/api/audit-logs?format=csv');
            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            className={styles.button}
            onClick={handleExport}
            disabled={isExporting}
        >
            {isExporting ? (
                <>
                    <span className={styles.spinner}></span>
                    Exporting...
                </>
            ) : (
                <>
                    <span className={styles.icon}>📥</span>
                    Export CSV
                </>
            )}
        </button>
    );
}
