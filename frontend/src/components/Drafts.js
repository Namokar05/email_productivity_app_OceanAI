import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Drafts = () => {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRequest, setUserRequest] = useState('');
    const [generating, setGenerating] = useState(false);

    // Editing states
    const [editingDraftId, setEditingDraftId] = useState(null);
    const [editSubject, setEditSubject] = useState('');
    const [editBody, setEditBody] = useState('');

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        try {
            const response = await api.getAllDrafts();
            if (response.success) setDrafts(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!userRequest.trim()) return;
        setGenerating(true);

        try {
            const response = await api.generateDraft(userRequest);
            if (response.success) {
                alert('Draft generated successfully!');
                setUserRequest('');
                fetchDrafts();
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (draftId) => {
        if (!window.confirm('Delete this draft?')) return;

        try {
            const response = await api.deleteDraft(draftId);
            if (response.success) {
                alert('Draft deleted!');
                fetchDrafts();
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const startEditing = (draft) => {
        setEditingDraftId(draft.draftId);
        setEditSubject(draft.subject);
        setEditBody(draft.body);
    };

    const saveEditing = async (draftId) => {
        try {
            const response = await api.updateDraft(draftId, {
                subject: editSubject,
                body: editBody
            });

            if (response.success) {
                alert("Draft updated successfully!");
                setEditingDraftId(null);
                fetchDrafts();
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    const cancelEditing = () => {
        setEditingDraftId(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="loading">Loading drafts...</div>;

    return (
        <div className="drafts">
            <h2> Email Drafts</h2>
            <p>Create, edit and manage your drafts</p>

            {/* Generate New Draft */}
            <div className="generate-draft">
                <h3> Generate New Email</h3>
                <textarea
                    value={userRequest}
                    onChange={(e) => setUserRequest(e.target.value)}
                    rows={4}
                    placeholder="E.g., 'Write a professional email asking for a deadline extension'"
                />
                <button
                    onClick={handleGenerate}
                    disabled={generating || !userRequest.trim()}
                >
                    {generating ? 'Generating...' : ' Generate Draft'}
                </button>
            </div>

            {/* Drafts List */}
            <div className="drafts-list">
                <h3>Saved Drafts ({drafts.length})</h3>

                {drafts.length === 0 ? (
                    <div className="empty-state">
                        <p>📭 No drafts yet</p>
                        <p>Generate a draft above to begin</p>
                    </div>
                ) : (
                    drafts.map(draft => (
                        <div key={draft.draftId} className="draft-card">

                            {/* Header */}
                            <div className="draft-header">
                                <div>
                                    {editingDraftId === draft.draftId ? (
                                        <input
                                            className="draft-edit-title-input"
                                            value={editSubject}
                                            onChange={(e) => setEditSubject(e.target.value)}
                                        />
                                    ) : (
                                        <strong>{draft.subject}</strong>
                                    )}

                                    <span className="draft-meta">
                                        {formatDate(draft.createdAt)}
                                    </span>
                                </div>

                                <div className="draft-actions">
                                    {editingDraftId === draft.draftId ? (
                                        <>
                                            <button
                                                className="save-draft-btn"
                                                onClick={() => saveEditing(draft.draftId)}
                                            >
                                                💾 Save
                                            </button>
                                            <button className="cancel-draft-btn" onClick={cancelEditing}>
                                                ✖ Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="edit-btn" onClick={() => startEditing(draft)}>
                                                ✏️ Edit
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDelete(draft.draftId)}>
                                                🗑️
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {draft.to && <div className="draft-to">To: {draft.to}</div>}

                            {/* Body */}
                            <div className="draft-body">
                                {editingDraftId === draft.draftId ? (
                                    <textarea
                                        className="draft-edit-textarea"
                                        value={editBody}
                                        onChange={(e) => setEditBody(e.target.value)}
                                        rows={12}
                                    />
                                ) : (
                                    <pre>{draft.body}</pre>
                                )}
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Drafts;
