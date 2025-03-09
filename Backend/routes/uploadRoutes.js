const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
require("dotenv").config();

const router = express.Router();

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer setup (storing file in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Stream upload function
const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// ✅ Handle File Upload Route
router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log("Received File:", req.file); // 🔥 Debugging

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded - Ensure you're using 'file' as the field name.",
      });
    }

    const result = await streamUpload(req.file.buffer);

    console.log("Cloudinary Response:", result); // 🔥 Debugging

    if (!result || !result.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary upload failed. No URL returned.",
        fullResponse: result, // 🔥 Debugging full response
      });
    }

    res.json({
      success: true,
      imageUrl: result.secure_url, // ✅ Ensure this key is correct
      public_id: result.public_id,
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
});

module.exports = router;
