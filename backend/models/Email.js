const mongoose = require('mongoose');

const ActionItemSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true
    },
    deadline: {
        type: String,
        default: 'Not specified'
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    }
});

const EmailSchema = new mongoose.Schema({
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    sender: {
        type: String,
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    hasAttachments: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ['Important', 'Newsletter', 'Spam', 'To-Do', 'Meeting', 'Invoice', 'Notification', 'General', 'Uncategorized'],
        default: 'Uncategorized'
    },
    actionItems: [ActionItemSchema],
    summary: {
        type: String,
        default: null
    },
    processed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});


EmailSchema.index({ category: 1 });
EmailSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Email', EmailSchema);