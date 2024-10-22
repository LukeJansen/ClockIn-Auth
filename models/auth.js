const mongoose = require('mongoose')

const authSchema = new mongoose.Schema({
    UserID: {
        type: String,
        required: true
    },
    Hash: {
        type: String,
        required: true
    },
    RefreshTokens: {
        type: Array,
        required: false
    }
}, 
{collection: 'auth'})

module.exports = mongoose.model('Auth', authSchema)