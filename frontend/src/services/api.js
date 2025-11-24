import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
    getAllEmails: async (params = {}) => {
        const response = await axios.get(`${API_URL}/emails`, { params });
        return response.data;
    },

    getEmail: async (emailId) => {
        const response = await axios.get(`${API_URL}/emails/${emailId}`);
        return response.data;
    },

    loadMockInbox: async () => {
        const response = await axios.post(`${API_URL}/emails/load-mock`);
        return response.data;
    },

    processAllEmails: async () => {
        const response = await axios.post(`${API_URL}/emails/process-all`);
        return response.data;
    },

    processEmail: async (emailId) => {
        const response = await axios.post(`${API_URL}/emails/process/${emailId}`);
        return response.data;
    },

    generateReply: async (emailId) => {
        const response = await axios.post(`${API_URL}/emails/${emailId}/reply`);
        return response.data;
    },

    summarizeEmail: async (emailId) => {
        const response = await axios.post(`${API_URL}/emails/${emailId}/summarize`);
        return response.data;
    },

    getStats: async () => {
        const response = await axios.get(`${API_URL}/emails/stats/overview`);
        return response.data;
    },

    resetInbox: async () => {
        const response = await axios.delete(`${API_URL}/emails/reset`);
        return response.data;
    },

    chatWithAgent: async (message) => {
        const response = await axios.post(`${API_URL}/emails/chat`, { message });
        return response.data;
    },

    getAllPrompts: async () => {
        const response = await axios.get(`${API_URL}/prompts`);
        return response.data;
    },

    getPrompt: async (name) => {
        const response = await axios.get(`${API_URL}/prompts/${name}`);
        return response.data;
    },

    createPrompt: async (promptData) => {
        const response = await axios.post(`${API_URL}/prompts`, promptData);
        return response.data;
    },

    updatePrompt: async (name, promptData) => {
        const response = await axios.put(`${API_URL}/prompts/${name}`, promptData);
        return response.data;
    },

    deletePrompt: async (name) => {
        const response = await axios.delete(`${API_URL}/prompts/${name}`);
        return response.data;
    },

    loadDefaultPrompts: async () => {
        const response = await axios.post(`${API_URL}/prompts/load-defaults`);
        return response.data;
    },

    getAllDrafts: async () => {
        const response = await axios.get(`${API_URL}/drafts`);
        return response.data;
    },

    getDraft: async (draftId) => {
        const response = await axios.get(`${API_URL}/drafts/${draftId}`);
        return response.data;
    },

    createDraft: async (draftData) => {
        const response = await axios.post(`${API_URL}/drafts`, draftData);
        return response.data;
    },

    generateDraft: async (userRequest, context = '') => {
        const response = await axios.post(`${API_URL}/drafts/generate`, {
            userRequest,
            context
        });
        return response.data;
    },

    updateDraft: async (draftId, draftData) => {
        const response = await axios.put(`${API_URL}/drafts/${draftId}`, draftData);
        return response.data;
    },

    deleteDraft: async (draftId) => {
        const response = await axios.delete(`${API_URL}/drafts/${draftId}`);
        return response.data;
    }
};

export default api;