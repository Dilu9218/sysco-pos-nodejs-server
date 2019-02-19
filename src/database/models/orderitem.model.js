let mongoose = require('mongoose');

let orderItemSchema = new mongoose.Schema({
    total: Number,
    orders: [{
        type: Schema.ObjectId,
        ref: 'Order'
    }]
});

module.exports = mongoose.model('OrderItem', orderItemSchema);