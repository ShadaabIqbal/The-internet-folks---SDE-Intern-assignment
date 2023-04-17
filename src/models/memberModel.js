const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    id: {
        type: String
    },
    community: {
        type: String,
        ref: 'community',
        required: true
    },
    user: {
        type: String,
        ref: 'user',
        required: true
    },
    role: {
        type: String,
        ref: 'role',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('member', memberSchema);