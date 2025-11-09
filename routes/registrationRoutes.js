import express from "express";
import { registerForEvent, getMyRegistrations } from "../controllers/registrationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/registrations → Register for an event
router.post("/", protect, registerForEvent);

// GET /api/registrations/my → Get user's registered events
router.get("/my", protect, getMyRegistrations);

export default router;
