const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : ".bin";
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`);
  }
});

function fileFilter(req, file, cb) {
  const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only PNG/JPEG/WEBP allowed"), ok);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }
});

module.exports = { upload };