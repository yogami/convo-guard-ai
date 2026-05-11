'use client';

import React from 'react';
import styles from './IntentDriftGraph.module.css';

export function IntentDriftGraph() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h4 className={styles.title}>📈 Intent Drift Trajectory</h4>
                <span className={styles.badge}>Live Analysis</span>
            </div>
            
            <div className={styles.graphContainer}>
                <svg viewBox="0 0 400 150" className={styles.svg}>
                    {/* Grid lines */}
                    <line x1="0" y1="25" x2="400" y2="25" stroke="#e2e8f0" strokeDasharray="4" />
                    <line x1="0" y1="75" x2="400" y2="75" stroke="#e2e8f0" strokeDasharray="4" />
                    <line x1="0" y1="125" x2="400" y2="125" stroke="#e2e8f0" strokeDasharray="4" />
                    
                    {/* Trajectory Line */}
                    <path 
                        d="M 20 120 L 100 115 L 180 80 L 260 45 L 340 15" 
                        fill="none" 
                        stroke="#94a3b8" 
                        strokeWidth="3"
                        strokeLinecap="round"
                        className={styles.pathAnim}
                    />

                    {/* Nodes */}
                    <g className={styles.nodeGroup}>
                        <circle cx="20" cy="120" r="6" fill="#10b981" />
                        <text x="20" y="140" className={styles.nodeText}>Turn 1</text>
                        <text x="20" y="105" className={styles.intentText}>Benign</text>
                    </g>
                    
                    <g className={styles.nodeGroup}>
                        <circle cx="100" cy="115" r="6" fill="#10b981" />
                        <text x="100" y="140" className={styles.nodeText}>Turn 2</text>
                        <text x="100" y="100" className={styles.intentText}>Coping Skills</text>
                    </g>

                    <g className={styles.nodeGroup}>
                        <circle cx="180" cy="80" r="8" fill="#f59e0b" />
                        <text x="180" y="140" className={styles.nodeText}>Turn 3</text>
                        <text x="180" y="65" className={styles.intentText} fill="#b45309">Info Gathering</text>
                    </g>

                    <g className={styles.nodeGroup}>
                        <circle cx="260" cy="45" r="10" fill="#f97316" />
                        <text x="260" y="140" className={styles.nodeText}>Turn 4</text>
                        <text x="260" y="25" className={styles.intentText} fill="#c2410c">Acquire Means</text>
                    </g>

                    <g className={styles.nodeGroup}>
                        <circle cx="340" cy="15" r="12" fill="#ef4444" className={styles.pulseNode} />
                        <text x="340" y="140" className={styles.nodeText}>Turn 5</text>
                        <text x="340" y="40" className={styles.intentText} fill="#dc2626" style={{fontWeight: 'bold'}}>Action Plan</text>
                    </g>
                </svg>
            </div>
            
            <div className={styles.legend}>
                <div className={styles.legendItem}><span style={{background: '#10b981'}}></span> Safe</div>
                <div className={styles.legendItem}><span style={{background: '#f59e0b'}}></span> Elevated</div>
                <div className={styles.legendItem}><span style={{background: '#ef4444'}}></span> Critical</div>
            </div>
        </div>
    );
}
