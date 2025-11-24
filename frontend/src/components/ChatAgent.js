import React, { useState } from 'react';
import api from '../services/api';

const ChatAgent = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages([...messages, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.chatWithAgent(input);
            if (response.success) {
                const assistantMessage = { role: 'assistant', content: response.data.response };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (error) {
            const errorMessage = { role: 'assistant', content: 'Error: ' + error.message };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        'Summarize my inbox',
        'What tasks do I need to do?',
        'Show me all urgent emails',
        'How many unread emails do I have?'
    ];

    const handleQuickAction = (action) => {
        setInput(action);
    };

    return (
        <div className="chat-agent">
            <h2>💬 Email Agent Chat</h2>
            <p>Ask questions about your emails or request actions</p>

            <div className="chat-container">
                <div className="messages">
                    {messages.length === 0 && (
                        <div className="empty-chat">
                            <p> Hi! I'm your email assistant.</p>
                            <p>Ask me anything about your inbox!</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.role}`}>
                            <div className="message-content">{msg.content}</div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message assistant">
                            <div className="message-content typing">Thinking...</div>
                        </div>
                    )}
                </div>

                <div className="quick-actions-buttons">
                    {quickActions.map((action, idx) => (
                        <button key={idx} onClick={() => handleQuickAction(action)} className="quick-action-btn">
                            {action}
                        </button>
                    ))}
                </div>

                <div className="chat-input">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything..."
                        disabled={loading}
                    />
                    <button onClick={handleSend} disabled={loading || !input.trim()}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatAgent;