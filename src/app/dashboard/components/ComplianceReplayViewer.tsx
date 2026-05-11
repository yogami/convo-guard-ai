'use client';

import React, { useState } from 'react';
import styles from './ComplianceReplayViewer.module.css';

interface InterventionEvent {
    id: string;
    timestamp: string;
    type: 'PASS' | 'MODIFY' | 'BLOCK';
    latency: string;
    description: string;
    policy: string;
    evidence: string;
}

export function ComplianceReplayViewer() {
    const [selectedEvent, setSelectedEvent] = useState<InterventionEvent | null>(null);

    const mockEvents: InterventionEvent[] = [
        { id: 'ev_1', timestamp: '14:31:12.012', type: 'PASS', latency: '82ms', description: 'Initial greeting passed', policy: 'None', evidence: 'Text sentiment: Neutral' },
        { id: 'ev_2', timestamp: '14:31:45.331', type: 'PASS', latency: '87ms', description: 'Coping inquiry passed', policy: 'None', evidence: 'Text sentiment: Positive' },
        { id: 'ev_3', timestamp: '14:32:01.105', type: 'MODIFY', latency: '110ms', description: 'Re-written to neutral tone', policy: 'Boundary Enforcement v2.1', evidence: 'Agent output exhibited excessive validation of avoidance.' },
        { id: 'ev_4', timestamp: '14:32:07.045', type: 'BLOCK', latency: '92ms', description: 'Pathological Dissociation Detected', policy: 'Trauma Protocol Annex A', evidence: 'Multimodal fusion: Gaze avoidance > 8s, Speech rate drop 40%, Blink rate < 2/min.' }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h4 className={styles.title}>🛡️ Compliance Replay Viewer</h4>
                <span className={styles.subtitle}>Regulatory-Grade Audit Trail</span>
            </div>

            <div className={styles.timeline}>
                {mockEvents.map(ev => (
                    <div 
                        key={ev.id} 
                        className={`${styles.eventMarker} ${styles[ev.type]}`}
                        onClick={() => setSelectedEvent(ev)}
                    >
                        <div className={styles.markerDot}></div>
                        <div className={styles.markerLine}></div>
                        <div className={styles.eventLabel}>{ev.timestamp}</div>
                    </div>
                ))}
            </div>

            {selectedEvent ? (
                <div className={styles.eventDetails}>
                    <div className={styles.detailHeader}>
                        <h5>Action: {selectedEvent.type}</h5>
                        <span className={styles.latency}>Latency: {selectedEvent.latency}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <strong>Policy:</strong> {selectedEvent.policy}
                    </div>
                    <div className={styles.detailRow}>
                        <strong>Evidence:</strong> <code>{selectedEvent.evidence}</code>
                    </div>
                    <div className={styles.detailRow}>
                        <strong>Result:</strong> {selectedEvent.description}
                    </div>
                </div>
            ) : (
                <div className={styles.emptyDetails}>
                    Select a timeline event to view regulatory audit trace.
                </div>
            )}
        </div>
    );
}
