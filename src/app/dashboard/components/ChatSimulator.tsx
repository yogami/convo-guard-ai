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
    };
}

export function ChatSimulator() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your HelloBetter Mental Health Agent. How are you feeling today?' }
    ]);
    const [input, setInput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [selectedRisk, setSelectedRisk] = useState<Message['risk'] | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, processing]);

    const handleSend = async () => {
        if (!input.trim() || processing) return;

        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input, status: 'pending' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setProcessing(true);

        try {
            // Simulate AI processing + Policy Check
            const response = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: input })
            });
            const data = await response.json();

            // Update user message status
            setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'sent' } : m));

            if (!data.compliant) {
                // BLOCKED
                const highRisk = data.risks.find((r: any) => r.severity === 'HIGH') || data.risks[0];
                const riskMsg = highRisk ? highRisk.message : 'Policy Violation Detected';

                const blockedMsg: Message = {
                    id: crypto.randomUUID(),
                    role: 'system',
                    content: `🚫 CIRCUIT BROKEN: ${riskMsg}`,
                    status: 'blocked',
                    risk: {
                        severity: highRisk?.severity || 'HIGH',
                        category: highRisk?.category || 'UNKNOWN',
                        message: highRisk?.message,
                        ruleId: highRisk?.ruleId || 'N/A'
                    }
                };
                setMessages(prev => [...prev, blockedMsg]);
            } else {
                // ALLOWED - Fetch intelligent AI response
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
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.statusDot}></div>
                <h3>Live Clinical Feed (Multimodal)</h3>
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
                        {msg.status === 'blocked' && (
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
                    placeholder="Type a message (e.g. 'I feel sad' or 'I want fentanyl')..."
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
                                <span className={styles.xaiValue} style={{color: '#991b1b'}}>CIRCUIT_BROKEN (LLM response halted before generation to ensure patient safety)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
