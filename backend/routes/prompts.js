const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');
const defaultPrompts = require('../data/defaultPrompts.json');

router.get('/', async (req, res) => {
    try {
        const prompts = await Prompt.find().sort({ name: 1 });
        res.json({ success: true, count: prompts.length, data: prompts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:name', async (req, res) => {
    try {
        const prompt = await Prompt.findOne({ name: req.params.name });
        if (!prompt) {
            return res.status(404).json({ success: false, message: 'Prompt not found' });
        }
        res.json({ success: true, data: prompt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, content, description } = req.body;

        if (!name || !content) {
            return res.status(400).json({
                success: false,
                message: 'Name and content are required'
            });
        }

        const prompt = await Prompt.create({ name, content, description });
        res.status(201).json({ success: true, data: prompt });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Prompt with this name already exists'
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:name', async (req, res) => {
    try {
        const { content, description } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Content is required'
            });
        }

        const prompt = await Prompt.findOneAndUpdate(
            { name: req.params.name },
            { content, description },
            { new: true, runValidators: true }
        );

        if (!prompt) {
            return res.status(404).json({ success: false, message: 'Prompt not found' });
        }

        res.json({ success: true, data: prompt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:name', async (req, res) => {
    try {
        const prompt = await Prompt.findOneAndDelete({ name: req.params.name });

        if (!prompt) {
            return res.status(404).json({ success: false, message: 'Prompt not found' });
        }

        res.json({ success: true, message: 'Prompt deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/load-defaults', async (req, res) => {
    try {
        const prompts = Object.entries(defaultPrompts).map(([name, content]) => ({
            name,
            content,
            description: getPromptDescription(name)
        }));

        const results = await Promise.allSettled(
            prompts.map(prompt =>
                Prompt.findOneAndUpdate(
                    { name: prompt.name },
                    prompt,
                    { upsert: true, new: true }
                )
            )
        );

        const loaded = results.filter(r => r.status === 'fulfilled').length;

        res.json({
            success: true,
            message: `Loaded ${loaded} default prompts`,
            count: loaded
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

function getPromptDescription(name) {
    const descriptions = {
        'categorization_prompt': 'Categorizes emails into predefined categories',
        'action_item_prompt': 'Extracts actionable tasks from email content',
        'auto_reply_prompt': 'Generates professional email replies',
        'summary_prompt': 'Creates concise summaries of emails',
        'draft_generation_prompt': 'Composes new emails from user requests'
    };
    return descriptions[name] || 'Custom prompt';
}

module.exports = router;