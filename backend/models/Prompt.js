const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Prompt', PromptSchema);