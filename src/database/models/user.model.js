let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: {
        unique: true,
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);