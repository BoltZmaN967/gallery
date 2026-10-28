# MA Gallery (MERN + Tailwind + GSAP)

Upload images with metadata (title, description, camera, date, size, GPS/location). Sign up / log in with JWT.

## Run

Needs Node 18+ and MongoDB (local or Atlas).

```bash
# terminal 1: API
cd server
cp .env.example .env      # set MONGO_URI and JWT_SECRET
npm install
npm run dev               # http://localhost:5000

# terminal 2: UI
cd client
npm install
npm run dev               # http://localhost:5173
```

## Structure

```
server/
  index.js    routes: signup, login, list/upload/delete images
  models.js   User and Image schemas
client/src/
  App.jsx             nav, hero, grid, GSAP animations
  api.js              fetch wrapper with JWT
  components/         Modal, AuthModal, UploadModal, DetailModal
```

## Notes

- Metadata: EXIF (camera, date taken, GPS) is read with `exifr`. If the photo has no GPS, the user can type a location name and coordinates, or press "Use mine".
- Images are saved to `server/uploads/`. For production, swap multer's disk storage for S3 or Cloudinary.
- Fonts: Bodoni Moda stands in for Bolkit (not on Google Fonts); Mulish matches the reference.
