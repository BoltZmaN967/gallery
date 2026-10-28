require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const exifr = require('exifr');
const { User, Image } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- uploads ----------
const dir = path.join(__dirname, 'uploads');
fs.mkdirSync(dir, { recursive: true });
app.use('/uploads', express.static(dir));

const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

// ---------- auth ----------
const sign = (u) => ({
  token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: { id: u._id, name: u.name, email: u.email },
});

const auth = (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ error: 'Please log in' });
  }
};

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: 'Name, email and a 6+ character password are required' });
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ error: 'Email already registered' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.json(sign(user));
});

app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
    return res.status(401).json({ error: 'Invalid email or password' });
  res.json(sign(user));
});

// ---------- images ----------
app.get('/api/images', async (_, res) => {
  res.json(await Image.find().sort('-createdAt').populate('user', 'name'));
});

app.post('/api/images', auth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Please upload an image file' });
  const { title, description, locationName } = req.body;

  // Read EXIF (camera, date, GPS). Many images have none, so failures are fine.
  let exif = {};
  try { exif = (await exifr.parse(req.file.path, { gps: true })) || {}; } catch { }

  const lat = exif.latitude ?? (req.body.lat ? Number(req.body.lat) : undefined);
  const lng = exif.longitude ?? (req.body.lng ? Number(req.body.lng) : undefined);

  const image = await Image.create({
    user: req.userId,
    title: title || req.file.originalname,
    description,
    url: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    width: exif.ExifImageWidth || exif.ImageWidth,
    height: exif.ExifImageHeight || exif.ImageHeight,
    camera: [exif.Make, exif.Model].filter(Boolean).join(' ') || undefined,
    takenAt: exif.DateTimeOriginal,
    location: { name: locationName, lat, lng },
  });
  res.json(image);
});

app.delete('/api/images/:id', auth, async (req, res) => {
  const image = await Image.findOne({ _id: req.params.id, user: req.userId });
  if (!image) return res.status(404).json({ error: 'Not found' });
  fs.unlink(path.join(__dirname, image.url), () => { });
  await image.deleteOne();
  res.json({ ok: true });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 5000, () => console.log('API running on port', process.env.PORT || 5000));
});
