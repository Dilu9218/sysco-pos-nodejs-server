let mongoose = require('mongoose');
let cartSchema = require('./schemas/cart.schema');

module.exports = mongoose.model('Cart', cartSchema);