let mongoose = require('mongoose');

let orderSchema = new mongoose.Schema({
    validOrder: {
        type: Boolean
    }
});

module.exports = mongoose.model('Order', orderSchema);