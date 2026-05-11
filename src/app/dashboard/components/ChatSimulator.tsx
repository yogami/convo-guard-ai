'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatSimulator.module.css';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    status?: 'pending' | 'sent' | 'blocked';
    risk?: {
        severity: string;
        category: string;
        message?: string;
        ruleId?: string;
        actionTaken?: string;
    };
}

export function ChatSimulator() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your AcmeTherapy Mental Health Agent. How are you feeling today?' }
    ]);
    const [input, setInput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [selectedRisk, setSelectedRisk] = useState<Message['risk'] | null>(null);
    
    // Telemetry State
    const [gazeFixation, setGazeFixation] = useState(2); // seconds
    const [voiceStress, setVoiceStress] = useState(15); // %
    const [toleranceLevel, setToleranceLevel] = useState(20); // 0-100
    const [toleranceColor, setToleranceColor] = useState('#10b981'); // green
    
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, processing]);

    // Simulate telemetry drift based on input length/keywords
    useEffect(() => {
        if (input.length > 0) {
            const isDistressed = input.toLowerCase().includes('die') || input.toLowerCase().includes('freeze') || input.toLowerCase().includes('numb');
            setGazeFixation(isDistressed ? 8.5 : Math.min(10, input.length / 5));
            setVoiceStress(isDistressed ? 85 : Math.min(100, input.length));
            const newTol = isDistressed ? 90 : Math.min(100, input.length * 1.5);
            setToleranceLevel(newTol);
            setToleranceColor(newTol > 80 ? '#ef4444' : newTol > 50 ? '#f59e0b' : '#10b981');
        } else {
            setGazeFixation(2);
            setVoiceStress(15);
            setToleranceLevel(20);
            setToleranceColor('#10b981');
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || processing) return;

        const isDissociation = input.toLowerCase().includes('numb') || input.toLowerCase().includes('freeze');

        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input, status: 'pending' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setProcessing(true);

        try {
            const response = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: input })
            });
            const data = await response.json();

            setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'sent' } : m));

            if (isDissociation || !data.compliant) {
                // BLOCKED OR DISSOCIATION DETECTED
                let blockedMsg: Message;
                
                if (isDissociation) {
                    blockedMsg = {
                        id: crypto.randomUUID(),
                        role: 'system',
                        content: `⚡ GRACIOUS CIRCUIT BREAK (Grounding Script Injected):\n"I notice things might be feeling overwhelming or disconnected right now. Let's pause. Notice the chair under you, press your feet into the floor, and name three things you can hear."`,
                        status: 'blocked',
                        risk: {
                            severity: 'CRITICAL',
                            category: 'PATHOLOGICAL_DISSOCIATION',
                            message: 'Multimodal fusion detected freeze response (flattened prosody, gaze fixation).',
                            ruleId: 'RULE_TRAUMA_EXPOSURE_TOLERANCE',
                            actionTaken: 'Interrupted exposure narrative (<200ms) and injected sensory grounding script.'
                        }
                    };
                } else {
                    const highRisk = data.risks?.find((r: any) => r.severity === 'HIGH') || data.risks?.[0];
                    const riskMsg = highRisk ? highRisk.message : 'Policy Violation Detected';
                    blockedMsg = {
                        id: crypto.randomUUID(),
                        role: 'system',
                        content: `🚫 CIRCUIT BROKEN: ${riskMsg}`,
                        status: 'blocked',
                        risk: {
                            severity: highRisk?.severity || 'HIGH',
                            category: highRisk?.category || 'UNKNOWN',
                            message: highRisk?.message,
                            ruleId: highRisk?.ruleId || 'N/A',
                            actionTaken: 'CIRCUIT_BROKEN (LLM response halted before generation to ensure patient safety)'
                        }
                    };
                }
                setMessages(prev => [...prev, blockedMsg]);
            } else {
                try {
                    const chatResponse = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: input })
                    });
                    const chatData = await chatResponse.json();

                    const aiResponse: Message = {
                        id: crypto.randomUUID(),
                        role: 'assistant',
                        content: chatData.reply || "I hear you. That sounds important."
                    };
                    setMessages(prev => [...prev, aiResponse]);
                } catch (e) {
                    const aiResponse: Message = {
                        id: crypto.randomUUID(),
                        role: 'assistant',
                        content: "I hear you. That sounds important. Can you tell me more?"
                    };
                    setMessages(prev => [...prev, aiResponse]);
                }
            }

        } catch (error) {
            console.error('Validation failed', error);
            setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'system', content: 'Error connecting to policy server.' }]);
        } finally {
            setProcessing(false);
            setGazeFixation(2);
            setVoiceStress(15);
            setToleranceLevel(20);
            setToleranceColor('#10b981');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.statusDot}></div>
                <h3>Live Clinical Feed (Multimodal)</h3>
            </div>
            
            <div className={styles.telemetryPanel}>
                <div className={styles.telemetryTitle}>Multimodal Telemetry Feed</div>
                <div className={styles.telemetryRow}>
                    <span>Gaze Fixation:</span>
                    <span className={styles.telemetryValue} style={{color: gazeFixation > 6 ? '#ef4444' : '#10b981'}}>{gazeFixation.toFixed(1)}s</span>
                </div>
                <div className={styles.telemetryRow}>
                    <span>Voice Stress (Pitch Variance):</span>
                    <span className={styles.telemetryValue} style={{color: voiceStress > 70 ? '#ef4444' : '#10b981'}}>{voiceStress}%</span>
                </div>
                <div>
                    <div className={styles.telemetryRow}>
                        <span>Window of Tolerance:</span>
                        <span className={styles.telemetryValue}>{toleranceLevel.toFixed(0)}%</span>
                    </div>
                    <div className={styles.gaugeContainer}>
                        <div className={styles.gaugeBar} style={{ width: `${toleranceLevel}%`, backgroundColor: toleranceColor }}></div>
                    </div>
                </div>
            </div>

            <div className={styles.messages}>
                {messages.map(msg => (
                    <div key={msg.id} className={`${styles.message} ${styles[msg.role]} ${msg.status === 'blocked' ? styles.blocked : ''}`}>
                        <div 
                            className={`${styles.bubble} ${msg.status === 'blocked' ? styles.clickable : ''}`}
                            onClick={() => {
                                if (msg.status === 'blocked' && msg.risk) {
                                    setSelectedRisk(msg.risk);
                                }
                            }}
                        >
                            {msg.content}
                            {msg.status === 'blocked' && (
                                <div style={{marginTop: '10px', fontSize: '0.8rem', fontStyle: 'italic', color: '#dc2626'}}>
                                    (Click for XAI Trace)
                                </div>
                            )}
                        </div>
                        {msg.risk && (
                            <div className={styles.riskLabel}>
                                ⚠️ {msg.risk.category} ({msg.risk.severity})
                            </div>
                        )}
                        {msg.status === 'blocked' && msg.risk?.severity === 'CRITICAL' && (
                            <button className={styles.escalateBtn} style={{backgroundColor: '#f59e0b'}} onClick={() => alert('Clinical Supervisor Pinged.')}>
                                Ping Clinical Supervisor
                            </button>
                        )}
                        {msg.status === 'blocked' && msg.risk?.severity !== 'CRITICAL' && (
                            <button className={styles.escalateBtn} onClick={() => alert('Escalated to clinical staff.')}>
                                Escalate to Human Moderator
                            </button>
                        )}
                    </div>
                ))}
                
                {processing && (
                    <div className={`${styles.message} ${styles.user}`}>
                        <div className={styles.bubble} style={{background: 'transparent', border: 'none'}}>
                            <div className={styles.audioWaveform}>
                                <div className={styles.bar}></div>
                                <div className={styles.bar}></div>
                                <div className={styles.bar}></div>
                                <div className={styles.bar}></div>
                                <div className={styles.bar}></div>
                            </div>
                            <span style={{fontSize: '0.75rem', color: '#64748b'}}>Transcribing audio...</span>
                        </div>
                    </div>
                )}
                
                <div ref={bottomRef} />
            </div>

            <div className={styles.inputArea}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type 'I feel numb' to simulate pathological dissociation..."
                    disabled={processing}
                />
                <button onClick={handleSend} disabled={processing || !input.trim()}>
                    {processing ? '...' : 'Send'}
                </button>
            </div>

            {/* XAI Inspector Modal */}
            {selectedRisk && (
                <div className={styles.modalOverlay} onClick={() => setSelectedRisk(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setSelectedRisk(null)}>×</button>
                        <div className={styles.xaiHeader}>
                            <h4 className={styles.xaiTitle}>🔍 Explainability (XAI) Trace</h4>
                            <p style={{margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b'}}>ConvoGuard AI Policy Engine</p>
                        </div>
                        <div className={styles.xaiDetails}>
                            <div className={styles.xaiRow}>
                                <span className={styles.xaiLabel}>Trigger Category:</span>
                                <span className={styles.xaiValue}>{selectedRisk.category}</span>
                            </div>
                            <div className={styles.xaiRow}>
                                <span className={styles.xaiLabel}>Severity Level:</span>
                                <span className={styles.xaiValue} style={{color: '#dc2626'}}>{selectedRisk.severity}</span>
                            </div>
                            <div className={styles.xaiRow}>
                                <span className={styles.xaiLabel}>Enforced Rule:</span>
                                <span className={styles.xaiValue}>{selectedRisk.ruleId}</span>
                            </div>
                            <div className={styles.xaiRow}>
                                <span className={styles.xaiLabel}>System Response:</span>
                                <span className={styles.xaiValue}>{selectedRisk.message}</span>
                            </div>
                            <div className={styles.xaiRow} style={{flexDirection: 'column', alignItems: 'flex-start', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca'}}>
                                <span className={styles.xaiLabel}>Action Taken:</span>
                                <span className={styles.xaiValue} style={{color: '#991b1b'}}>{selectedRisk.actionTaken || 'CIRCUIT_BROKEN'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
