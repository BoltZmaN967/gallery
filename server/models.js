const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
}));

const Image = mongoose.model('Image', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  url: { type: String, required: true },
  // File & dimension metadata
  originalName: String,
  mimeType: String,
  size: Number,
  width: Number,
  height: Number,
  // Camera & photography metadata
  camera: String,
  focalLength: String,
  aperture: String,
  iso: Number,
  exposureTime: String,
  takenAt: Date,
  // Location metadata (EXIF GPS or user tagged)
  location: {
    name: String,
    city: String,
    country: String,
    lat: Number,
    lng: Number,
  },
}, { timestamps: true }));

module.exports = { User, Image };
