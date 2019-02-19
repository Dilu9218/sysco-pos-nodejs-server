let mongoose = require('mongoose');

let orderListSchema = new mongoose.Schema({
    total: Number,
    orderItems: [{
        type: Schema.ObjectId,
        ref: 'OrderItem'
    }]
});

module.exports = mongoose.model('OrderList', orderListSchema);