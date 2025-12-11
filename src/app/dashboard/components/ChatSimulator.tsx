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
    };
}

export function ChatSimulator() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your Mental Health Support Assistant. How are you feeling today?' }
    ]);
    const [input, setInput] = useState('');
    const [processing, setProcessing] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
                const highRisk = data.risks.find((r: any) => r.severity === 'HIGH');
                const riskMsg = highRisk ? highRisk.message : 'Policy Violation Detected';

                const blockedMsg: Message = {
                    id: crypto.randomUUID(),
                    role: 'system',
                    content: `🚫 MESSAGE BLOCKED BY CONVOGUARD\nReason: ${riskMsg}`,
                    status: 'blocked',
                    risk: {
                        severity: highRisk?.severity || 'HIGH',
                        category: highRisk?.category || 'UNKNOWN'
                    }
                };
                setMessages(prev => [...prev, blockedMsg]);
            } else {
                // ALLOWED - Simulate simple AI response
                // In a real app, we would pass the conversation to the LLM here.
                const aiResponse: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: "I hear you. That sounds important. Can you tell me more about what's going on?"
                };
                setMessages(prev => [...prev, aiResponse]);
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
                <h3>Live Client Interaction Demo</h3>
            </div>

            <div className={styles.messages}>
                {messages.map(msg => (
                    <div key={msg.id} className={`${styles.message} ${styles[msg.role]} ${msg.status === 'blocked' ? styles.blocked : ''}`}>
                        <div className={styles.bubble}>
                            {msg.content}
                        </div>
                        {msg.risk && (
                            <div className={styles.riskLabel}>
                                ⚠️ {msg.risk.category} ({msg.risk.severity})
                            </div>
                        )}
                    </div>
                ))}
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
        </div>
    );
}
