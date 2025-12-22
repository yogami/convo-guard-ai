'use client';

import React from 'react';
import styles from './LifecycleView.module.css';

export type LifecycleStage =
    | 'DESIGN'
    | 'DEVELOPMENT'
    | 'VALIDATION'
    | 'MARKET'
    | 'POST_MARKET';

interface LifecycleViewProps {
    currentStage?: LifecycleStage;
    systemId?: string;
}

const STAGES: { id: LifecycleStage; label: string; icon: string }[] = [
    { id: 'DESIGN', label: 'Design', icon: '📐' },
    { id: 'DEVELOPMENT', label: 'Development', icon: '⚙️' },
    { id: 'VALIDATION', label: 'Validation', icon: '✅' },
    { id: 'MARKET', label: 'Market', icon: '🚀' },
    { id: 'POST_MARKET', label: 'Post-Market', icon: '📊' }
];

export function LifecycleView({ currentStage = 'DEVELOPMENT', systemId }: LifecycleViewProps) {
    const currentIndex = STAGES.findIndex(s => s.id === currentStage);

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>
                Compliance Lifecycle
                {systemId && <span className={styles.systemId}>{systemId}</span>}
            </h3>

            <div className={styles.pipeline}>
                {STAGES.map((stage, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isPending = index > currentIndex;

                    return (
                        <React.Fragment key={stage.id}>
                            <div
                                className={`${styles.stage} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''} ${isPending ? styles.pending : ''}`}
                                data-testid={`stage-${stage.id.toLowerCase()}`}
                            >
                                <span className={styles.icon}>{stage.icon}</span>
                                <span className={styles.label}>{stage.label}</span>
                                {isCompleted && <span className={styles.check}>✓</span>}
                            </div>
                            {index < STAGES.length - 1 && (
                                <div className={`${styles.connector} ${isCompleted ? styles.completedConnector : ''}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className={styles.stageDetails}>
                <p className={styles.currentStageLabel}>
                    Current Stage: <strong>{STAGES[currentIndex]?.label || 'Unknown'}</strong>
                </p>
                <p className={styles.stageDescription}>
                    {getStageDescription(currentStage)}
                </p>
            </div>
        </div>
    );
}

function getStageDescription(stage: LifecycleStage): string {
    switch (stage) {
        case 'DESIGN':
            return 'Initial risk assessment and compliance planning phase.';
        case 'DEVELOPMENT':
            return 'Active development with continuous compliance monitoring.';
        case 'VALIDATION':
            return 'Conformity assessment and testing before market entry.';
        case 'MARKET':
            return 'Product is live. Active monitoring and incident reporting required.';
        case 'POST_MARKET':
            return 'Ongoing post-market surveillance and periodic reviews.';
        default:
            return '';
    }
}
