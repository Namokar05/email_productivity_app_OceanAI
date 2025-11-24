import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EmailDetail = () => {
    const { emailId } = useParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState(null);
    const [summary, setSummary] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchEmail();
    }, [emailId]);

    const fetchEmail = async () => {
        try {
            const response = await api.getEmail(emailId);
            if (response.success) setEmail(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReply = async () => {
        setProcessing(true);
        try {
            const response = await api.generateReply(emailId);
            if (response.success) {
                setReply(response.data);
                await api.createDraft({
                    subject: response.data.subject,
                    body: response.data.body,
                    to: email.sender,
                    inReplyTo: emailId
                });
                alert('Reply generated and saved as draft!');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleSummarize = async () => {
        setProcessing(true);
        try {
            const response = await api.summarizeEmail(emailId);
            if (response.success) setSummary(response.data.summary);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!email) return <div>Email not found</div>;

    return (
        <div className="email-detail">
            <button onClick={() => navigate(-1)} className="back-btn">← Back to Inbox</button>

            <div className="email-content">
                <h2>{email.subject}</h2>

                <div className="email-info">
                    <div className="info-row">
                        <strong>From:</strong> {email.senderName} ({email.sender})
                    </div>
                    <div className="info-row">
                        <strong>Category:</strong>
                        <span className="category-badge">{email.category}</span>
                    </div>
                    <div className="info-row">
                        <strong>Date:</strong> {new Date(email.timestamp).toLocaleString()}
                    </div>
                </div>

                <div className="email-body">
                    <strong>Message:</strong>
                    <pre>{email.body}</pre>
                </div>

                {email.actionItems && email.actionItems.length > 0 && (
                    <div className="action-items-section">
                        <h3>✅ Action Items</h3>
                        {email.actionItems.map((item, idx) => (
                            <div key={idx} className="action-item">
                                <strong>{item.task}</strong>
                                <div>Deadline: {item.deadline} | Priority: {item.priority}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="email-actions">
                    <button onClick={handleGenerateReply} disabled={processing}>
                        {processing ? 'Generating...' : '📝 Generate Reply'}
                    </button>
                    <button onClick={handleSummarize} disabled={processing}>
                        {processing ? 'Summarizing...' : '📄 Summarize'}
                    </button>
                </div>

                {reply && (
                    <div className="generated-content">
                        <h3>Generated Reply:</h3>
                        <p><strong>Subject:</strong> {reply.subject}</p>
                        <pre>{reply.body}</pre>
                    </div>
                )}

                {summary && (
                    <div className="generated-content">
                        <h3>Summary:</h3>
                        <p>{summary}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailDetail;