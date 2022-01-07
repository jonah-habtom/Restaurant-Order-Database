const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
    username: String,
    password: String,
    privacy: Boolean
});

module.exports = mongoose.model("users", userSchema);