const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  professor_id: { type: String, ref:"users", required: true },
  date: { type: String, required: true },
  time_slot: { type: [String], required: true },
});

module.exports = mongoose.model("availabilities", availabilitySchema);
