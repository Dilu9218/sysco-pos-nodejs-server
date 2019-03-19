let mongoose = require("mongoose");
let itemSchema = require("./schemas/item.schema");

module.exports = mongoose.model("Item", itemSchema);