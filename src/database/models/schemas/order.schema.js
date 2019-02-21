let mongoose = require('mongoose');
let itemSchema = require('./item.schema');

let orderSchema = new mongoose.Schema({
    cartID: String,
    items: [itemSchema]
});

module.exports = orderSchema;