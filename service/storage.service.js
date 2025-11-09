import dotenv from "dotenv";
import ImageKit from "imagekit";

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadFile = async (file, filename) => {
  try {
    if (!file || !file.buffer) throw new Error("File buffer missing");

    const base64Data = file.buffer.toString("base64");

    const response = await imagekit.upload({
      file: base64Data,
      fileName: filename,
      folder: "events",
    });

    return response.url; // ✅ Return public URL directly
  } catch (error) {
    console.error("❌ ImageKit Upload Failed:", error.message);
    throw error;
  }
};
