const mongoose = require("mongoose");
const Schema = mongoose.Schema;


let orderSchema = Schema({
    restaurantName: String,
    username: String,
    items: Object,
    subtotal: Number,
    tax: Number,
    fee: Number,
    total: Number
});

module.exports = mongoose.model("orders", orderSchema);