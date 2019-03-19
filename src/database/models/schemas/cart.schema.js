let mongoose = require("mongoose");
let orderSchema = require("./order.schema")

// A user will have only one cart. In this cart, there can be multiple
// orders with each order having multiple items
let cartSchema = new mongoose.Schema({
    userID: {
        type: String,
        unique: true,
        required: true
    },
    orderItems: [orderSchema]
});

module.exports = cartSchema;