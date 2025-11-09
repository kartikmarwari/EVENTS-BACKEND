import express from "express";
import multer from "multer";
import { registerUser, loginUser, logoutUser } from "../controllers/authController.js";
 import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register" , registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check", protect, (req, res) => {
  res.json({ message: "Authenticated", user: req.user });
});
export default router;
