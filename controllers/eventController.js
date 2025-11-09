import Event from "../models/Event.js";
import Club from "../models/Club.js";
import { uploadFile } from "../service/storage.service.js";
import { getSheetData } from "../utils/googleSheet.js";

import { v4 as uuidv4 } from "uuid";
 import multer from "multer";


export const checkRegistrationFromSheet = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.googleSheetLink)
      return res.status(404).json({ message: "Sheet not found" });

    const sheetData = await getSheetData(event.googleSheetLink, process.env.GOOGLE_API_KEY);

    const email = req.body.email?.trim().toLowerCase();
    const emails = sheetData.map((row) => row[1]?.trim()?.toLowerCase()); // assuming 2nd column is email

    const isRegistered = emails.includes(email);

    res.json({ registered: isRegistered });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Create a new event (club only)
export const createEvent = async (req, res) => {
  try {
    const { title, description, venue, date, time, formLink, googleSheetLink } = req.body;

    if (!title || !venue || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadFile(req.file, `${uuidv4()}-${req.file.originalname}`);
    }

    const newEvent = await Event.create({
      title,
      description,
      venue,
      date,
      time,
      formLink,
      googleSheetLink,
      image: imageUrl,
      createdBy: req.club._id,
    });

    res.status(201).json({ message: "Event created successfully", newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Public route — all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "clubName email");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Club-only route — fetch events created by logged-in club
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.club._id }).sort({
      date: -1,
    });
    res.json(events);
  } catch (error) {
    console.error("Error fetching club events:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete event (Club only)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // ✅ Ensure only the creator club can delete
    if (event.createdBy.toString() !== req.club._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.googleSheetLink)
      return res.status(400).json({ message: "No Google Sheet link provided for this event" });
console.log("Google API Key:", process.env.GOOGLE_API_KEY ? "✅ Loaded" : "❌ Missing");

    const sheetData = await getSheetData(event.googleSheetLink, process.env.GOOGLE_API_KEY);

    res.json({
      eventTitle: event.title,
      totalRegistrations: sheetData.length - 1, // minus header row
      headers: sheetData[0],
      rows: sheetData.slice(1),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





// --- helper: parse sheetId & range from link
function extractSheetMeta(googleSheetLink) {
  // Accepts: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit#gid=...
  const m = googleSheetLink.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const sheetId = m?.[1];
  // Default tab name:
  const range = "Form Responses 1";
  return { sheetId, range };
}

// --- helper: fetch values via Google Sheets API
async function fetchSheetValues(sheetId, range, apiKey, fetchImpl = fetch) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
  const res = await fetchImpl(url);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Sheets API error: ${res.status} ${t}`);
  }
  const json = await res.json();
  return json.values || [];
}

// ✅ MAIN: POST /events/:id/check-registration
export const checkEmailInSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) return res.status(400).json({ registered: false, message: "Email required" });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ registered: false, message: "Event not found" });

    if (!event.googleSheetLink) {
      return res.status(200).json({ registered: false, message: "No sheet linked" });
    }

    const { sheetId, range } = extractSheetMeta(event.googleSheetLink);
    if (!sheetId) return res.status(400).json({ registered: false, message: "Invalid sheet link" });

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return res.status(500).json({ registered: false, message: "Missing GOOGLE_API_KEY" });

    const values = await fetchSheetValues(sheetId, range, apiKey);

    if (!values.length) return res.json({ registered: false }); // no rows in sheet

    // Find email column (case-insensitive header)
    const header = values[0].map(h => (h || "").toString().trim().toLowerCase());
    const emailColIndex = header.findIndex(h => ["email", "e-mail", "mail", "email address"].includes(h));
    if (emailColIndex === -1) {
      // If there is NO email column in the sheet, we cannot verify.
      return res.json({ registered: false, message: "Email column not found in sheet" });
    }

    const target = email.trim().toLowerCase();
    const match = values.slice(1).some(row => (row[emailColIndex] || "").toString().trim().toLowerCase() === target);

    return res.json({ registered: match });
  } catch (err) {
    console.error("checkEmailInSheet error:", err);
    res.status(500).json({ registered: false, message: "Server error" });
  }
};
