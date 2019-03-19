let mongoose = require("mongoose");

let itemSchema = new mongoose.Schema({
    productID: {
        type: String,
        unique: false
    },
    productTitle: String,
    quantity: Number,
    description: String,
    price: Number
});

module.exports = itemSchema;