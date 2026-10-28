import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { api } from './api';
import AuthModal from './components/AuthModal';
import UploadModal from './components/UploadModal';
import DetailModal from './components/DetailModal';
import MyArtworks from './components/MyArtworks';

export default function App() {
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth') || 'null'); } catch { return null; }
  });
  const [modal, setModal]     = useState(null);   // 'auth' | 'upload'
  const [selected, setSelected] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const gridRef  = useRef(null);

  // ── Fetch all images ────────────────────────────────────────────────
  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await api('/images');
      setImages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Could not load images:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  // ── GSAP hero (only on "/" route) ───────────────────────────────────
  useEffect(() => {
    if (location.pathname !== '/') return;
    gsap.from('.hero > *', { opacity: 0, y: 25, stagger: 0.12, duration: 0.75, ease: 'power3.out' });
    gsap.to('.star',        { rotation: 360, duration: 14, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
  }, [location.pathname]);

  // ── GSAP cards ─────────────────────────────────────────────────────
  useEffect(() => {
    if (location.pathname === '/' && !loading) {
      gsap.fromTo('.card',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out', delay: 0.05 }
      );
    }
  }, [images.length, loading, location.pathname]);

  // ── Auth helpers ────────────────────────────────────────────────────
  const login = (data) => {
    localStorage.setItem('auth', JSON.stringify(data));
    setAuth(data);
  };
  const logout = () => {
    localStorage.removeItem('auth');
    setAuth(null);
    navigate('/');
  };

  // ── Delete image ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selected) return;
    try {
      await api(`/images/${selected._id}`, { method: 'DELETE', token: auth.token });
      setImages(prev => prev.filter(i => i._id !== selected._id));
      setSelected(null);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  // ── Derived values ──────────────────────────────────────────────────
  const myImages = images.filter(img => {
    const uid = img.user?._id || img.user;
    return auth && String(uid) === String(auth.user.id);
  });

  const isOwner = (img) => {
    if (!auth || !img) return false;
    return String(img.user?._id || img.user) === String(auth.user.id);
  };

  // ── Guard: redirect /my-artworks → / if not logged in ─────────────
  const RequireAuth = ({ children }) =>
    auth ? children : <Navigate to="/" replace />;

  // ────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between border-b border-ink/15 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="grid h-10 w-10 place-items-center border-2 border-ink bg-ink text-cream
                          font-bold text-sm transition group-hover:bg-crimson group-hover:border-crimson">
            MA
          </div>
          <span className="hidden sm:block title text-sm tracking-widest text-ink group-hover:text-crimson transition">
            Modern Art
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center">
          <NavLink to="/" label="Gallery" current={location.pathname} />
          {auth && (
            <NavLink to="/my-artworks" label="My Artworks" current={location.pathname} />
          )}
        </div>

        {/* Auth / Upload */}
        <div className="flex items-center gap-2 sm:gap-3">
          {auth ? (
            <>
              <div className="hidden sm:flex items-center gap-2 border border-ink/20 px-3 py-1.5 bg-ink/[0.03]">
                <div className="w-5 h-5 rounded-full bg-crimson text-cream flex items-center justify-center font-bold text-[10px]">
                  {auth.user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-ink">{auth.user.name}</span>
              </div>
              <button onClick={() => setModal('upload')} className="btn text-xs py-1.5 px-4">
                + Upload
              </button>
              <button onClick={logout}
                className="text-xs text-ink/55 hover:text-crimson font-semibold underline underline-offset-2 transition">
                Sign out
              </button>
            </>
          ) : (
            <button onClick={() => setModal('auth')} className="btn text-xs py-1.5 px-4">
              Sign In / Join
            </button>
          )}
        </div>
      </nav>

      {/* ── Routes ─────────────────────────────────────────────────── */}
      <Routes>

        {/* ── "/" — Public Gallery ──────────────────────────────── */}
        <Route path="/" element={
          <>
            {/* Hero */}
            <header className="hero py-16 sm:py-20 text-center border-b border-ink/10">
              <h1 className="title relative inline-block text-4xl sm:text-6xl md:text-7xl font-bold text-ink">
                Modern Art Exhibitions
                <svg className="star absolute -right-8 -top-5 h-10 w-10 sm:h-14 sm:w-14 text-crimson"
                  viewBox="0 0 100 100" fill="currentColor">
                  <polygon points="50,0 56,36 85,15 64,44 100,50 64,56 85,85 56,64 50,100 44,64 15,85 36,56 0,50 36,44 15,15 44,36" />
                </svg>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ink/65 font-serif italic">
                A community collection where anyone can share photography and art.
                Browse the gallery — or sign in to publish your own work.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-ink/50">
                <span><strong className="text-ink">{images.length}</strong> artworks</span>
                <span>·</span>
                {auth ? (
                  <Link to="/my-artworks"
                    className="text-crimson underline underline-offset-2 font-semibold hover:opacity-80">
                    View your {myImages.length} upload{myImages.length !== 1 ? 's' : ''} →
                  </Link>
                ) : (
                  <button onClick={() => setModal('auth')}
                    className="text-crimson underline underline-offset-2 font-semibold hover:opacity-80">
                    Join to start uploading →
                  </button>
                )}
              </div>
            </header>

            {/* Gallery Grid */}
            <main id="gallery" ref={gridRef} className="mt-10">
              {loading ? (
                <div className="py-24 text-center">
                  <div className="inline-block w-7 h-7 border-2 border-crimson border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs uppercase tracking-widest text-ink/40 mt-2">Loading gallery…</p>
                </div>
              ) : images.length === 0 ? (
                <div className="border-2 border-dashed border-ink/15 py-20 text-center">
                  <p className="text-3xl mb-3">🖼</p>
                  <h3 className="title text-xl mb-1">Gallery is empty</h3>
                  <p className="text-sm text-ink/50 mb-5">Be the first to publish an artwork.</p>
                  {auth
                    ? <button onClick={() => setModal('upload')} className="btn">Upload Artwork</button>
                    : <button onClick={() => setModal('auth')}   className="btn">Sign In to Upload</button>
                  }
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                  {images.map(img => (
                    <button key={img._id} onClick={() => setSelected(img)}
                      className="card group relative aspect-[3/4] overflow-hidden bg-ink/10
                                 text-left border border-ink/10 hover:border-ink/35
                                 hover:shadow-lg transition-all duration-300">
                      <img src={img.url} alt={img.title} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      {/* Hover overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/75 to-transparent p-4
                                      translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0
                                      transition-all duration-300 text-cream">
                        <p className="title text-base leading-tight font-bold truncate">{img.title}</p>
                        {img.description && (
                          <p className="text-[11px] text-cream/70 mt-0.5 line-clamp-2 leading-relaxed">
                            {img.description}
                          </p>
                        )}
                        <p className="text-[10px] text-cream/50 mt-1">{img.user?.name || 'Anonymous'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </main>
          </>
        } />

        {/* ── "/my-artworks" — Owner-only page ─────────────────── */}
        <Route path="/my-artworks" element={
          <RequireAuth>
            <main className="mt-8 animate-fade-in">
              <MyArtworks
                images={myImages}
                onSelect={setSelected}
                onUpload={() => setModal('upload')}
              />
            </main>
          </RequireAuth>
        } />

        {/* ── Catch-all → redirect home ─────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="mt-20 pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-ink/40">
        <span>MA Gallery · MERN Stack · Auto EXIF Extraction</span>
        <div className="flex gap-5">
          <Link to="/" className="hover:text-crimson transition">Gallery</Link>
          {auth && <Link to="/my-artworks" className="hover:text-crimson transition">My Artworks</Link>}
          {auth
            ? <button onClick={logout} className="hover:text-crimson transition">Sign Out</button>
            : <button onClick={() => setModal('auth')} className="hover:text-crimson transition">Sign In</button>
          }
        </div>
      </footer>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {modal === 'auth' && (
        <AuthModal onClose={() => setModal(null)} onAuth={login} />
      )}
      {modal === 'upload' && auth && (
        <UploadModal
          token={auth.token}
          onClose={() => setModal(null)}
          onUploaded={img => setImages(prev => [img, ...prev])}
        />
      )}
      {selected && (
        <DetailModal
          image={selected}
          isOwner={isOwner(selected)}
          onDelete={handleDelete}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ── NavLink helper ──────────────────────────────────────────────────────
function NavLink({ to, label, current }) {
  const active = current === to || (to !== '/' && current.startsWith(to));
  return (
    <Link to={to}
      className={`px-3 py-2 text-xs font-bold uppercase tracking-widest transition ${
        active
          ? 'text-crimson underline underline-offset-4'
          : 'text-ink/55 hover:text-ink'
      }`}>
      {label}
    </Link>
  );
}
