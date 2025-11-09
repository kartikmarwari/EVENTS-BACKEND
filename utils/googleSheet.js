import axios from "axios";

export const getSheetData = async (sheetLink, apiKey) => {
  try {
    const match = sheetLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) throw new Error("Invalid Google Sheet link format");

    const sheetId = match[1];
    const sheetName = "Sheet1"; // or "Sheet1" if you renamed it

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
    console.log("🔗 Google Sheets API URL:", url);

    const { data } = await axios.get(url);
    console.log("✅ Sheet data fetched successfully");

    return data.values;
  } catch (error) {
    console.error("❌ Error fetching Google Sheet data:", error.response?.data || error.message);
    throw new Error("Failed to fetch sheet data");
  }
};
