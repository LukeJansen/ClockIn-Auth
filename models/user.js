const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Phone: {
        type: String,
        required: true
    },
    DOB: {
        type: Date,
        required: true
    },
    Type: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('User', userSchema)