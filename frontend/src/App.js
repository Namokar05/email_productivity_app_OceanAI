import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Inbox from './components/Inbox';
import EmailDetail from './components/EmailDetail';
import PromptConfig from './components/PromptConfig';
import ChatAgent from './components/ChatAgent';
import Drafts from './components/Drafts';
import Analytics from './components/Analytics';
import api from './services/api';
import './App.css';

function App() {
    const [stats, setStats] = useState({ total: 0, processed: 0, withActions: 0 });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLoadInbox = async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const response = await api.loadMockInbox();
            if (response.success) {
                setMessage({ text: `✅ Loaded ${response.count} emails!`, type: 'success' });

                await fetchStats();
                window.dispatchEvent(new Event('emailsUpdated'));
            }
        } catch (error) {
            setMessage({ text: `❌ Error: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleProcessAll = async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const response = await api.processAllEmails();
            if (response.success) {
                setMessage({ text: `✅ Processed ${response.data.processed} emails!`, type: 'success' });

                await fetchStats();
                window.dispatchEvent(new Event('emailsUpdated'));
            }
        } catch (error) {
            setMessage({ text: `❌ Error: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to delete all emails?')) return;

        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const response = await api.resetInbox();
            if (response.success) {
                setMessage({ text: `✅ Reset complete! Deleted ${response.count} emails`, type: 'success' });

                await fetchStats();
                window.dispatchEvent(new Event('emailsUpdated'));
            }
        } catch (error) {
            setMessage({ text: `❌ Error: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Router>
            <div className="app">
                <header className="app-header">
                    <h1> Email Productivity Agent</h1>
                    <p>AI-powered email management with customizable prompts</p>
                </header>

                <div className="app-container">
                    <aside className="sidebar">
                        <nav className="nav-menu">
                            <h3>Navigation</h3>
                            <Link to="/" className="nav-link">📥 Inbox</Link>
                            <Link to="/prompts" className="nav-link">⚙️ Prompt Config</Link>
                            <Link to="/chat" className="nav-link">💬 Email Agent</Link>
                            <Link to="/drafts" className="nav-link">📝 Drafts</Link>
                            <Link to="/analytics" className="nav-link">📊 Analytics</Link>
                        </nav>

                        <div className="quick-actions">
                            <h3>Quick Actions</h3>
                            <button onClick={handleLoadInbox} disabled={loading}>📤 Load Inbox</button>
                            <button onClick={handleProcessAll} disabled={loading}>🔮 Process Emails</button>
                            <button onClick={handleReset} disabled={loading} className="danger">🗑️ Reset Inbox</button>
                        </div>

                        <div className="stats">
                            <h3>Statistics</h3>
                            <div className="stat-item">
                                <span>Total Emails:</span>
                                <strong>{stats.total}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Processed:</span>
                                <strong>{stats.processed}</strong>
                            </div>
                            <div className="stat-item">
                                <span>With Actions:</span>
                                <strong>{stats.withActions}</strong>
                            </div>
                        </div>
                    </aside>

                    <main className="main-content">
                        {message.text && (
                            <div className={`message ${message.type}`}>
                                {message.text}
                                <button onClick={() => setMessage({ text: '', type: '' })}>×</button>
                            </div>
                        )}

                        {loading && (
                            <div className="loading-overlay">
                                <div>
                                    <div className="loader"></div>
                                    <p>Processing...</p>
                                </div>
                            </div>
                        )}

                        <Routes>
                            <Route path="/" element={<Inbox onStatsUpdate={fetchStats} />} />
                            <Route path="/email/:emailId" element={<EmailDetail />} />
                            <Route path="/prompts" element={<PromptConfig />} />
                            <Route path="/chat" element={<ChatAgent />} />
                            <Route path="/drafts" element={<Drafts />} />
                            <Route path="/analytics" element={<Analytics />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;