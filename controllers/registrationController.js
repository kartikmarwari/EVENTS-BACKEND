import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

// ✅ Register a user for an event
export const registerForEvent = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: "Event ID required" });
    }

    // Check duplicate registration
    const alreadyRegistered = await Registration.findOne({
      student: studentId,
      event: eventId,
    });

    if (alreadyRegistered) {
      return res.status(200).json({ message: "Already registered" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const registration = await Registration.create({
      student: studentId,
      event: eventId,
    });

    res.status(201).json({ message: "Registered successfully", registration });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ✅ Get all registrations for logged-in user
export const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;

    const registrations = await Registration.find({ student: userId })
      .populate("event");

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

