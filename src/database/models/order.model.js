let mongoose = require('mongoose');
let orderSchema = require('./schemas/order.schema');

module.exports = mongoose.model('Order', orderSchema);