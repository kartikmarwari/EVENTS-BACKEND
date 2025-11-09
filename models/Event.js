import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    venue: String,
    date: Date,
    time: String,
    formLink: String, // Google Form link
    googleSheetLink: String, // 🔹 link to form responses sheet
    image: String,
      // optional, if using ImageKit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
