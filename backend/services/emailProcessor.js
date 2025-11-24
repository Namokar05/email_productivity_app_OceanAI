const Email = require('../models/Email');
const Prompt = require('../models/Prompt');
const geminiService = require('./geminiService');

class EmailProcessor {
    async processEmail(emailId) {
        try {
            const email = await Email.findOne({ emailId });
            if (!email) {
                throw new Error('Email not found');
            }

            const categorizationPrompt = await Prompt.findOne({ name: 'categorization_prompt' });
            const actionItemPrompt = await Prompt.findOne({ name: 'action_item_prompt' });

            if (!categorizationPrompt || !actionItemPrompt) {
                throw new Error('Required prompts not found');
            }

            const category = await geminiService.categorizeEmail(
                { sender: email.sender, subject: email.subject, body: email.body },
                categorizationPrompt.content
            );

            const actionItems = await geminiService.extractActionItems(
                { sender: email.sender, subject: email.subject, body: email.body },
                actionItemPrompt.content
            );

            email.category = category;
            email.actionItems = actionItems;
            email.processed = true;
            await email.save();

            return email;
        } catch (error) {
            console.error(`Error processing email ${emailId}:`, error.message);
            throw error;
        }
    }

    async processAllEmails() {
        try {
            const unprocessedEmails = await Email.find({ processed: false });

            const results = [];
            for (const email of unprocessedEmails) {
                try {
                    const processed = await this.processEmail(email.emailId);
                    results.push({ success: true, emailId: email.emailId });
                } catch (error) {
                    results.push({ success: false, emailId: email.emailId, error: error.message });
                }
            }

            return {
                total: unprocessedEmails.length,
                processed: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                results
            };
        } catch (error) {
            console.error('Error processing all emails:', error.message);
            throw error;
        }
    }

    async getStats() {
        try {
            const total = await Email.countDocuments();
            const processed = await Email.countDocuments({ processed: true });
            const unprocessed = await Email.countDocuments({ processed: false });

            const categories = await Email.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]);

            const withActions = await Email.countDocuments({
                'actionItems.0': { $exists: true }
            });

            return {
                total,
                processed,
                unprocessed,
                withActions,
                categoryBreakdown: categories.map(c => ({
                    category: c._id,
                    count: c.count
                }))
            };
        } catch (error) {
            console.error('Error getting stats:', error.message);
            throw error;
        }
    }
}

module.exports = new EmailProcessor();