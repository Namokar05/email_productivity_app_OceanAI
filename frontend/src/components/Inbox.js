import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Inbox = ({ onStatsUpdate }) => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const navigate = useNavigate();

    const categories = ['All', 'Important', 'Newsletter', 'Spam', 'To-Do', 'Meeting', 'Invoice', 'Notification', 'General'];
    const categoryEmojis = {
        'Important': '🔴', 'Newsletter': '📰', 'Spam': '🗑️', 'To-Do': '✅',
        'Meeting': '📅', 'Invoice': '💰', 'Notification': '🔔', 'General': '📧', 'Uncategorized': '❓'
    };

    useEffect(() => {
        fetchEmails();
    }, [category, search]);

   
    useEffect(() => {
        const handleEmailUpdate = () => {
            console.log('📧 Emails updated, refreshing inbox...');
            fetchEmails();
        };

        window.addEventListener('emailsUpdated', handleEmailUpdate);

        return () => {
            window.removeEventListener('emailsUpdated', handleEmailUpdate);
        };
    }, [category, search]);

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const params = {};
            if (category !== 'All') params.category = category;
            if (search) params.search = search;
            const response = await api.getAllEmails(params);
            if (response.success) {
                setEmails(response.data);
                if (onStatsUpdate) {
                    onStatsUpdate();
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const truncate = (text, max = 150) => text.length <= max ? text : text.substring(0, max) + '...';

    return (
        <div className="inbox">
            <div className="inbox-header">
                <h2>📥 Email Inbox</h2>
                <p>{emails.length} email(s)</p>
            </div>

            <div className="filters">
                <input
                    type="text"
                    placeholder="🔍 Search emails..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-select">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="loading">Loading emails...</div>
            ) : emails.length === 0 ? (
                <div className="empty-state">
                    <p>📭 No emails found</p>
                    <p>Click "Load Inbox" to load sample emails</p>
                </div>
            ) : (
                <div className="email-list">
                    {emails.map(email => (
                        <div key={email.emailId} className="email-card" onClick={() => navigate(`/email/${email.emailId}`)}>
                            <div className="email-header">
                                <div className="email-sender">
                                    <strong>{email.senderName}</strong>
                                    <span className="email-address">{email.sender}</span>
                                </div>
                                <div className="email-meta">
                                    <span className="category-badge">
                                        {categoryEmojis[email.category] || '📧'} {email.category}
                                    </span>
                                    <span className="email-time">{formatDate(email.timestamp)}</span>
                                </div>
                            </div>
                            <div className="email-subject">
                                📌 {email.subject}
                                {email.hasAttachments && <span className="attachment-icon">📎</span>}
                            </div>
                            <div className="email-preview">{truncate(email.body)}</div>
                            {email.actionItems && email.actionItems.length > 0 && (
                                <div className="action-items-preview">
                                    <strong>✅ {email.actionItems.length} Action Item(s)</strong>
                                    <ul>
                                        {email.actionItems.slice(0, 2).map((item, idx) => (
                                            <li key={idx}>
                                                {item.priority === 'High' && '🔴'}
                                                {item.priority === 'Medium' && '🟡'}
                                                {item.priority === 'Low' && '🟢'}
                                                {' '}{truncate(item.task, 60)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Inbox;