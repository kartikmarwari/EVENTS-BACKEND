import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Club from "../models/Club.js";

// ✅ General protection (for both)
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look up either student or club
    const user =
      (await Student.findById(decoded.id).select("-password")) ||
      (await Club.findById(decoded.id).select("-password"));

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    req.role = decoded.role;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};

// ✅ Clubs only protection
export const protectClub = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ message: "Not authorized, no token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure it's a club user
    const club = await Club.findById(decoded.id).select("-password");
    if (!club || decoded.role !== "club") {
      return res.status(403).json({ message: "Access denied: Club only" });
    }

    req.club = club;
    next();
  } catch (error) {
    console.error("Club auth error:", error);
    res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};
