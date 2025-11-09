import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    clubName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    logo: {
      type: String, // path or URL for club logo
    },
  },
  { timestamps: true }
);

const Club = mongoose.model("Club", clubSchema);
export default Club;
