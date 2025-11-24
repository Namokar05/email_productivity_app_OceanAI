const mongoose = require('mongoose');

const DraftSchema = new mongoose.Schema({
    draftId: {
        type: String,
        required: true,
        unique: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    to: {
        type: String,
        default: null
    },
    inReplyTo: {
        type: String,
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

DraftSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Draft', DraftSchema);