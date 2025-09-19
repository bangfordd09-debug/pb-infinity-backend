const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// สร้างโฟลเดอร์ uploads ถ้าไม่มี
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ตั้งค่า multer เก็บไฟล์ใน uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Root route
app.get("/", (req, res) => {
  res.send("PB Infinity Backend is Live 🚀");
});

// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ ดึงรูปทั้งหมด
app.get("/api/images", (req, res) => {
  const files = fs.readdirSync(uploadDir);
  const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
  const urls = files.map((f) => `${baseUrl}/uploads/${f}`);
  res.json(urls);
});

// ✅ อัปโหลดรูป
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ success: true, file: req.file.filename });
});

// ✅ เปิดให้เข้าถึงไฟล์ใน /uploads
app.use("/uploads", express.static(uploadDir));

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
