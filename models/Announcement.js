import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  file: {
    type: String, // optional (can store ImageKit URL)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Announcement", announcementSchema);
