const mongoose = require("mongoose");

const recordsSchema = new mongoose.Schema({
    img: {type: String, default: "-"},
    artist: {type: String, default: "-"},
    name: {type: String, default: "-"},
    year: Number,
    rating: {type: String, default: "-"},
    condition: {type: String, default: "-"},
    userId: String
  });
  
const Record = new mongoose.model("Record", recordsSchema);

module.exports = Record;