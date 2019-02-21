let mongoose = require('mongoose');
let itemSchema = require('./item.schema');

let orderSchema = new mongoose.Schema({ 
    total: Number,
    orders: [itemSchema]
});

module.exports = orderSchema;