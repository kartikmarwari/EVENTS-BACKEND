import Announcement from "../models/Announcement.js";
import Event from "../models/Event.js";
import { uploadFile } from "../service/storage.service.js";

// ✅ Club posts a new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { message, eventId } = req.body;
    if (!message || !eventId)
      return res.status(400).json({ message: "Missing required fields" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.club._id.toString()) {
      return res.status(403).json({ message: "Not authorized to post for this event" });
    }

    let fileUrl = null;
    if (req.file) {
      fileUrl = await uploadFile(req.file, `${eventId}-announcement`);
    }

    const announcement = await Announcement.create({
      event: eventId,
      postedBy: req.club._id,
      message,
      file: fileUrl,
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get announcements for a specific event
export const getAnnouncementsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const announcements = await Announcement.find({ event: eventId })
      .populate("postedBy", "clubName email")
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
