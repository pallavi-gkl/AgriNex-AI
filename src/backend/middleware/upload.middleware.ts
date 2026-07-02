/**
 * @fileoverview Multer upload middleware for image file handling.
 * Uses memory storage so file buffers are available for processing
 * (sharp resize → Gemini Vision) without touching disk.
 */
import multer from "multer";

const storage = multer.memoryStorage();

/**
 * Multer upload instance — memory storage, 10 MB file size limit.
 * Accepts common image MIME types only.
 */
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
  },
});
