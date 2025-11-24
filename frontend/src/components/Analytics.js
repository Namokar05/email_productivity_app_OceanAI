import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, emailsRes] = await Promise.all([
                api.getStats(),
                api.getAllEmails()
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (emailsRes.success) setEmails(emailsRes.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading analytics...</div>;

    const chartData = stats?.categoryBreakdown || [];
    const actionEmails = emails.filter(e => e.actionItems && e.actionItems.length > 0);

    return (
        <div className="analytics">
            <h2>📊 Email Analytics</h2>
            <p>Visualize your inbox data</p>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{stats?.total || 0}</div>
                    <div className="stat-label">Total Emails</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats?.processed || 0}</div>
                    <div className="stat-label">Processed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats?.withActions || 0}</div>
                    <div className="stat-label">With Actions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats?.unprocessed || 0}</div>
                    <div className="stat-label">Unprocessed</div>
                </div>
            </div>

            <div className="chart-section">
                <h3>📂 Email Categories</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#667eea" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="action-items-summary">
                <h3>✅ Action Items Summary</h3>
                {actionEmails.length === 0 ? (
                    <p>No action items found</p>
                ) : (
                    actionEmails.map(email => (
                        <div key={email.emailId} className="action-email">
                            <strong>{email.subject}</strong>
                            <span className="action-count">{email.actionItems.length} task(s)</span>
                            <ul>
                                {email.actionItems.map((item, idx) => (
                                    <li key={idx}>
                                        {item.priority === 'High' && '🔴'}
                                        {item.priority === 'Medium' && '🟡'}
                                        {item.priority === 'Low' && '🟢'}
                                        {' '}{item.task} - <em>{item.deadline}</em>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Analytics;