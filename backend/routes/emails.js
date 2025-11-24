const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const Prompt = require('../models/Prompt');
const emailProcessor = require('../services/emailProcessor');
const geminiService = require('../services/geminiService');
const mockInbox = require('../data/mockInbox.json');

router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { subject: { $regex: search, $options: 'i' } },
                { sender: { $regex: search, $options: 'i' } },
                { senderName: { $regex: search, $options: 'i' } },
                { body: { $regex: search, $options: 'i' } }
            ];
        }

        const emails = await Email.find(query).sort({ timestamp: -1 });
        res.json({ success: true, count: emails.length, data: emails });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:emailId', async (req, res) => {
    try {
        const email = await Email.findOne({ emailId: req.params.emailId });
        if (!email) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }
        res.json({ success: true, data: email });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/load-mock', async (req, res) => {
    try {
        const emails = mockInbox.map(email => ({
            emailId: email.id,
            sender: email.sender,
            senderName: email.sender_name,
            subject: email.subject,
            body: email.body,
            timestamp: new Date(email.timestamp),
            hasAttachments: email.has_attachments,
            category: email.category || 'Uncategorized',
            actionItems: email.action_items || [],
            processed: false
        }));

        const results = await Promise.allSettled(
            emails.map(email => Email.create(email).catch(err => {
                if (err.code === 11000) return null;
                throw err;
            }))
        );

        const loaded = results.filter(r => r.status === 'fulfilled' && r.value).length;

        res.json({
            success: true,
            message: `Loaded ${loaded} emails`,
            count: loaded
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/process-all', async (req, res) => {
    try {
        const result = await emailProcessor.processAllEmails();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/process/:emailId', async (req, res) => {
    try {
        const email = await emailProcessor.processEmail(req.params.emailId);
        res.json({ success: true, data: email });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:emailId/reply', async (req, res) => {
    try {
        const email = await Email.findOne({ emailId: req.params.emailId });
        if (!email) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }

        const replyPrompt = await Prompt.findOne({ name: 'auto_reply_prompt' });
        if (!replyPrompt) {
            return res.status(404).json({ success: false, message: 'Reply prompt not found' });
        }

        const reply = await geminiService.generateReply(
            { sender: email.sender, subject: email.subject, body: email.body },
            replyPrompt.content
        );

        res.json({ success: true, data: reply });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:emailId/summarize', async (req, res) => {
    try {
        const email = await Email.findOne({ emailId: req.params.emailId });
        if (!email) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }

        const summaryPrompt = await Prompt.findOne({ name: 'summary_prompt' });
        if (!summaryPrompt) {
            return res.status(404).json({ success: false, message: 'Summary prompt not found' });
        }

        const summary = await geminiService.summarizeEmail(
            { sender: email.sender, subject: email.subject, body: email.body },
            summaryPrompt.content
        );

        email.summary = summary;
        await email.save();

        res.json({ success: true, data: { summary } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/stats/overview', async (req, res) => {
    try {
        const stats = await emailProcessor.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/reset', async (req, res) => {
    try {
        const result = await Email.deleteMany({});
        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} emails`,
            count: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const emails = await Email.find().sort({ timestamp: -1 }).limit(5);
        const context = `User has ${await Email.countDocuments()} emails in inbox.\n` +
            emails.map(e => `- From: ${e.senderName}, Subject: ${e.subject}, Category: ${e.category}`).join('\n');

        const response = await geminiService.chat(message, context);
        res.json({ success: true, data: { response } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;