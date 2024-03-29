const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const usersSchema = new mongoose.Schema({
    username: String,
    password: String,
});

usersSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", usersSchema);

module.exports = User;