let mongoose = require("mongoose");

let todoSchema = new mongoose.Schema({
    title: String,
    completed: { type: Boolean }
});

module.exports = mongoose.model("ToDo", todoSchema);