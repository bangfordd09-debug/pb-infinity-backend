
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

app.use(cors({ origin: FRONTEND_ORIGIN }));

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = (file.originalname || 'image').replace(/[^a-zA-Z0-9_.-]+/g,'_');
    const ts = Date.now();
    const ext = path.extname(safe) || '';
    const base = path.basename(safe, ext);
    cb(null, `${ts}_${base}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.get('/health', (req,res)=> res.json({ ok: true }));

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file is required' });
  const base = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
  const fileUrl = `${base}/uploads/${req.file.filename}`;
  res.json({ name: req.file.originalname, stored: req.file.filename, url: fileUrl, size: req.file.size });
});

app.get('/images', (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR).filter(n => /\.(png|jpe?g|gif|webp|svg)$/i.test(n)).sort((a,b)=> b.localeCompare(a));
  const base = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
  const items = files.map(n => ({
    name: n.replace(/^\d+_/, ''),
    url: `${base}/uploads/${n}`,
    sizeKB: Math.round((fs.statSync(path.join(UPLOAD_DIR, n)).size || 0) / 1024)
  }));
  res.json({ items });
});

app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
