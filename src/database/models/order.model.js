let mongoose = require('mongoose');

let orderSchema = new mongoose.Schema({
    productID: String,
    productTitle: String,
    availableQty: Number,
    description: String,
    price: Number
});

module.exports = mongoose.model('Order', orderSchema);