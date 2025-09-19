const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// ตั้งค่าโฟลเดอร์เก็บไฟล์ upload
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// route health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// route ดึงรูปทั้งหมด
app.get("/api/images", (req, res) => {
  const files = fs.readdirSync(uploadDir);
  const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
  const urls = files.map((f) => `${baseUrl}/uploads/${f}`);
  res.json(urls);
});

// route อัปโหลดรูป
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ success: true, file: req.file.filename });
});

// ให้เข้าถึงไฟล์ใน /uploads ได้ตรง ๆ
app.use("/uploads", express.static(uploadDir));

// start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
