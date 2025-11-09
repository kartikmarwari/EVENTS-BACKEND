import express from "express";
import {
  createEvent,
  getAllEvents,
  getMyEvents,
  deleteEvent,
  getEventRegistrations,
  checkEmailInSheet,         // ✅ add
} from "../controllers/eventController.js";
import { protect, protectClub } from "../middleware/authMiddleware.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get("/", getAllEvents);
router.get("/my", protectClub, getMyEvents);
router.post("/", protectClub, upload.single("image"), createEvent);

router.delete("/:id", protectClub, deleteEvent);
router.get("/:id/registrations", protectClub, getEventRegistrations);



// ✅ NEW: check if an email exists in the Google Sheet for this event
router.post("/:id/check-registration", protect, checkEmailInSheet);

export default router;




