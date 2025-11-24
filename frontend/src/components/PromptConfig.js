import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PromptConfig = () => {
    const [prompts, setPrompts] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [content, setContent] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            const response = await api.getAllPrompts();
            if (response.success) {
                setPrompts(response.data);
                if (response.data.length > 0) {
                    setSelectedPrompt(response.data[0]);
                    setContent(response.data[0].content);
                    setDescription(response.data[0].description);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSelectPrompt = (prompt) => {
        setSelectedPrompt(prompt);
        setContent(prompt.content);
        setDescription(prompt.description);
    };

    const handleSave = async () => {
        if (!selectedPrompt) return;
        setLoading(true);
        try {
            const response = await api.updatePrompt(selectedPrompt.name, { content, description });
            if (response.success) {
                alert('Prompt updated successfully!');
                fetchPrompts();
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadDefaults = async () => {
        setLoading(true);
        try {
            const response = await api.loadDefaultPrompts();
            if (response.success) {
                alert(`Loaded ${response.count} default prompts!`);
                fetchPrompts();
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="prompt-config">
            <h2>⚙️ Prompt Configuration</h2>
            <p>Customize AI behavior by editing prompts</p>

            <div className="prompt-container">
                <div className="prompt-list">
                    <h3>Available Prompts</h3>
                    {prompts.map((prompt) => (
                        <div
                            key={prompt.name}
                            className={`prompt-item ${selectedPrompt?.name === prompt.name ? 'active' : ''}`}
                            onClick={() => handleSelectPrompt(prompt)}
                        >
                            {prompt.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                    ))}
                    <button onClick={handleLoadDefaults} disabled={loading} className="load-defaults-btn">
                        ↺ Load Defaults
                    </button>
                </div>

                <div className="prompt-editor">
                    {selectedPrompt ? (
                        <>
                            <h3>Editing: {selectedPrompt.name}</h3>

                            <div className="form-group">
                                <label>Description:</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description"
                                />
                            </div>

                            <div className="form-group">
                                <label>Prompt Content:</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={15}
                                    placeholder="Enter prompt template..."
                                />
                                <small>Use placeholders: {'{sender}'}, {'{subject}'}, {'{body}'}</small>
                            </div>

                            <button onClick={handleSave} disabled={loading} className="save-btn">
                                {loading ? 'Saving...' : '💾 Save Changes'}
                            </button>
                        </>
                    ) : (
                        <div className="no-selection">Select a prompt to edit</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromptConfig;