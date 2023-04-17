const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    id: {
        type: String
    },
    name: {
        type: String,
        enum: ['Community Admin', 'Community Member'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('role', roleSchema);