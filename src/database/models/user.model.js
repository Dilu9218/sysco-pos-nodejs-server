let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    isAdmin: { type: Boolean }
});

module.exports = mongoose.model('User', userSchema);