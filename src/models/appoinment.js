const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  student_id: { type: String, ref:"users", required: true },
  professor_id: { type: String, ref:"users", required: true },
  date: { type: String, ref:"availabilities", required: true },
  time_slot: { type: String, required: true },
  status: { type: String, enum: ["Booked", "Cancelled"], required: true },
});

module.exports = mongoose.model("appointments", appointmentSchema);
