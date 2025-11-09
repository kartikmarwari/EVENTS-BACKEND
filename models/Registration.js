import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Registration", registrationSchema);
