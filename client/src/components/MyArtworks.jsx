// My Artworks page — shows only the logged-in user's uploads with full metadata

const fmt = {
  size: (b) => b ? (b / 1024 / 1024).toFixed(2) + ' MB' : null,
  date: (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null,
};

function MetaBadge({ label, value }) {
  if (!value) return null;
  return (
    <span className="inline-flex flex-col items-center bg-ink/[0.04] border border-ink/10 px-3 py-2 min-w-[80px]">
      <span className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">{label}</span>
      <span className="text-xs font-semibold text-ink mt-0.5">{value}</span>
    </span>
  );
}

export default function MyArtworks({ images, onSelect, onUpload }) {
  const myImages = images; // Already filtered to owner's images by App.jsx

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="py-10 border-b border-ink/10 mb-8">
        <p className="text-[11px] uppercase tracking-widest text-crimson font-bold mb-1">Private Archive</p>
        <h1 className="title text-4xl md:text-5xl">My Artworks</h1>
        <p className="text-sm text-ink/55 mt-2 max-w-xl">
          Your personal collection. Full EXIF metadata, camera data, and GPS coordinates are visible only here — other visitors see only the image, title, and description.
        </p>
      </div>

      {myImages.length === 0 ? (
        /* Empty State */
        <div className="border-2 border-dashed border-ink/15 py-20 text-center bg-ink/[0.01]">
          <div className="text-4xl mb-4">🖼</div>
          <h3 className="title text-xl mb-2">No artworks yet</h3>
          <p className="text-sm text-ink/50 mb-6 max-w-xs mx-auto">
            Upload your first photograph or artwork to start your private archive.
          </p>
          <button onClick={onUpload} className="btn">Upload First Artwork</button>
        </div>
      ) : (
        <div className="space-y-8">
          {myImages.map((img) => {
            const loc = img.location || {};
            const hasCoords = loc.lat != null && loc.lng != null;
            const hasCam = img.camera || img.aperture || img.iso || img.focalLength || img.exposureTime;

            return (
              <article key={img._id}
                className="border border-ink/15 bg-white hover:border-ink/30 transition-colors duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">

                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-ink/5 cursor-pointer group"
                    onClick={() => onSelect(img)}>
                    <img src={img.url} alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition text-cream text-xs font-bold uppercase tracking-widest bg-ink/80 px-4 py-2">
                        View Full
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="md:col-span-2 p-5 flex flex-col gap-4">

                    {/* Title row */}
                    <div className="border-b border-ink/8 pb-3">
                      <h2 className="title text-2xl leading-tight">{img.title}</h2>
                      {img.description && (
                        <p className="text-sm text-ink/65 mt-1 leading-relaxed line-clamp-2">{img.description}</p>
                      )}
                      <p className="text-[11px] text-ink/35 mt-1.5">
                        Uploaded {new Date(img.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                      </p>
                    </div>

                    {/* Quick EXIF badges */}
                    <div className="flex flex-wrap gap-2">
                      <MetaBadge label="Format"
                        value={img.mimeType?.replace('image/', '').toUpperCase()} />
                      <MetaBadge label="Size" value={fmt.size(img.size)} />
                      {img.width && img.height && (
                        <MetaBadge label="Dimensions" value={`${img.width}×${img.height}`} />
                      )}
                      {img.camera && <MetaBadge label="Camera" value={img.camera} />}
                      {img.aperture && <MetaBadge label="Aperture" value={img.aperture} />}
                      {img.focalLength && <MetaBadge label="Focal" value={img.focalLength} />}
                      {img.iso && <MetaBadge label="ISO" value={`ISO ${img.iso}`} />}
                      {img.exposureTime && <MetaBadge label="Shutter" value={img.exposureTime} />}
                    </div>

                    {/* Location row */}
                    {(loc.name || loc.city || loc.country || hasCoords) && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60 bg-ink/[0.03] border border-ink/10 px-3 py-2">
                        <span className="text-crimson">📍</span>
                        {loc.name && <span className="font-semibold text-ink">{loc.name}</span>}
                        {loc.city && loc.city !== loc.name && <span>{loc.city}</span>}
                        {loc.country && <span className="text-ink/40">· {loc.country}</span>}
                        {hasCoords && (
                          <a href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=14/${loc.lat}/${loc.lng}`}
                            target="_blank" rel="noreferrer"
                            className="ml-auto text-[11px] text-crimson underline underline-offset-2 font-medium">
                            Map ↗
                          </a>
                        )}
                      </div>
                    )}

                    {/* Date taken */}
                    {img.takenAt && (
                      <p className="text-[11px] text-ink/40">
                        📅 Captured: {fmt.date(img.takenAt)}
                      </p>
                    )}

                    {/* No metadata note */}
                    {!hasCam && !hasCoords && !img.width && (
                      <p className="text-[11px] text-ink/35 italic">
                        No embedded EXIF metadata found in this image file.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
