import express from "express";
import multer from "multer";
import { protectClub } from "../middleware/authMiddleware.js";
import {
  createAnnouncement,
  getAnnouncementsByEvent,
} from "../controllers/announcementController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🧑‍💼 Club: Create announcement
router.post("/", protectClub, upload.single("file"), createAnnouncement);

// 👩‍🎓 Students: View announcements for an event
router.get("/:eventId", getAnnouncementsByEvent);

export default router;
