const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    id: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    owner: {
        type: String,
        ref: 'user'
    }
}, { timestamps: true });

module.exports = mongoose.model('community', communitySchema);