const express = require('express');
const router = express.Router();
const Draft = require('../models/Draft');
const Prompt = require('../models/Prompt');
const geminiService = require('../services/geminiService');

router.get('/', async (req, res) => {
    try {
        const drafts = await Draft.find().sort({ createdAt: -1 });
        res.json({ success: true, count: drafts.length, data: drafts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:draftId', async (req, res) => {
    try {
        const draft = await Draft.findOne({ draftId: req.params.draftId });
        if (!draft) {
            return res.status(404).json({ success: false, message: 'Draft not found' });
        }
        res.json({ success: true, data: draft });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { subject, body, to, inReplyTo, metadata } = req.body;

        if (!subject || !body) {
            return res.status(400).json({
                success: false,
                message: 'Subject and body are required'
            });
        }

        const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const draft = await Draft.create({
            draftId,
            subject,
            body,
            to,
            inReplyTo,
            metadata
        });

        res.status(201).json({ success: true, data: draft });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/generate', async (req, res) => {
    try {
        const { userRequest, context } = req.body;

        if (!userRequest) {
            return res.status(400).json({
                success: false,
                message: 'User request is required'
            });
        }

        const draftPrompt = await Prompt.findOne({ name: 'draft_generation_prompt' });
        if (!draftPrompt) {
            return res.status(404).json({
                success: false,
                message: 'Draft generation prompt not found'
            });
        }

        const generated = await geminiService.generateDraft(
            userRequest,
            context || '',
            draftPrompt.content
        );

        if (!generated) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate draft'
            });
        }

        const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const draft = await Draft.create({
            draftId,
            subject: generated.subject,
            body: generated.body,
            metadata: { generatedFrom: 'user_request', userRequest }
        });

        res.status(201).json({ success: true, data: draft });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:draftId', async (req, res) => {
    try {
        const { subject, body, to } = req.body;

        const updates = {};
        if (subject !== undefined) updates.subject = subject;
        if (body !== undefined) updates.body = body;
        if (to !== undefined) updates.to = to;

        const draft = await Draft.findOneAndUpdate(
            { draftId: req.params.draftId },
            updates,
            { new: true, runValidators: true }
        );

        if (!draft) {
            return res.status(404).json({ success: false, message: 'Draft not found' });
        }

        res.json({ success: true, data: draft });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:draftId', async (req, res) => {
    try {
        const draft = await Draft.findOneAndDelete({ draftId: req.params.draftId });

        if (!draft) {
            return res.status(404).json({ success: false, message: 'Draft not found' });
        }

        res.json({ success: true, message: 'Draft deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/', async (req, res) => {
    try {
        const result = await Draft.deleteMany({});
        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} drafts`,
            count: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;