import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Club from "../models/Club.js";

 

 

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !role)
      return res.status(400).json({ message: "Missing required fields" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === "club") {
      user = await Club.create({
        clubName: name,
        email,
        password: hashedPassword,
        
      });
    } else {
      user = await Student.create({
        name,
        email,
        password: hashedPassword,
      });
    }

    // ✅ Generate token
    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
    });

    res.status(201).json({
      message: "Registration successful",
      role,
      user: {
        id: user._id,
        name: user.name || user.clubName,
        email: user.email,
      },
      token, // (optional, can be used for debugging)
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: error.message });
  }
};


// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role)
      return res.status(400).json({ message: "Missing fields" });

    let user;
    if (role === "student") {
      user = await Student.findOne({ email });
    } else if (role === "club") {
      user = await Club.findOne({ email });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
 const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

    res
      .cookie("token", token, {
        httpOnly: true,
          secure: false, // true on https prod
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Login successful", role, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGOUT
export const logoutUser = async (req, res) => {
  res
    .cookie("token", "", { httpOnly: true, expires: new Date(0) })
    .status(200)
    .json({ message: "Logged out successfully" });
};
