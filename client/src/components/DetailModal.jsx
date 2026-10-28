import Modal from './Modal';

const fmt = {
  size: (b) => b ? (b / 1024 / 1024).toFixed(2) + ' MB' : null,
  date: (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null,
};

// MetaRow – single key/value row
function MetaRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-baseline gap-4 py-2 border-b border-ink/8 last:border-0">
      <dt className="text-[11px] uppercase tracking-wider text-ink/50 font-semibold shrink-0">{label}</dt>
      <dd className="text-xs text-ink font-medium text-right break-all">{value}</dd>
    </div>
  );
}

// MetaBlock – a titled group of rows
function MetaBlock({ title, icon, children }) {
  return (
    <div className="border border-ink/12 bg-ink/[0.02]">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-ink/12 bg-ink/[0.04]">
        <span className="text-crimson text-sm">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-ink">{title}</span>
      </div>
      <dl className="px-4 py-1">{children}</dl>
    </div>
  );
}

export default function DetailModal({ image, isOwner, onDelete, onClose }) {
  const loc = image.location || {};
  const hasCoords = loc.lat != null && loc.lng != null;
  const hasLocation = loc.name || loc.city || loc.country || hasCoords;
  const hasCameraData = image.camera || image.aperture || image.focalLength || image.iso || image.exposureTime;

  return (
    <Modal onClose={onClose}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-10 pt-2">

        {/* ── Left: Image ── */}
        <div className="flex flex-col">
          <div className="relative bg-ink/5 border border-ink/15 flex items-center justify-center overflow-hidden min-h-[300px] max-h-[70vh]">
            <img
              src={image.url}
              alt={image.title}
              className="max-h-[70vh] w-auto max-w-full object-contain"
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-ink/40">
            <span>{image.originalName || 'image file'}</span>
            <a href={image.url} target="_blank" rel="noreferrer"
              className="hover:text-crimson transition underline underline-offset-2 font-medium">
              Open original ↗
            </a>
          </div>
        </div>

        {/* ── Right: Info ── */}
        <div className="flex flex-col gap-5 py-2">

          {/* Title & basic info – VISIBLE TO EVERYONE */}
          <div className="border-b border-ink/10 pb-4">
            <p className="text-[10px] uppercase tracking-widest text-crimson font-bold mb-1">
              {isOwner ? 'Your Artwork' : 'Community Artwork'}
            </p>
            <h2 className="title text-3xl lg:text-4xl leading-tight">{image.title}</h2>
            {image.user?.name && (
              <p className="text-xs text-ink/55 mt-1.5">
                Published by <span className="font-semibold text-ink">{image.user.name}</span>
              </p>
            )}
          </div>

          {/* Description – VISIBLE TO EVERYONE */}
          {image.description && (
            <p className="text-sm leading-relaxed text-ink/75 italic font-serif border-l-2 border-crimson pl-4">
              "{image.description}"
            </p>
          )}

          {/* Upload date – VISIBLE TO EVERYONE */}
          <p className="text-[11px] text-ink/40">
            Added on {new Date(image.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>

          {/* ── OWNER-ONLY METADATA ── */}
          {isOwner ? (
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-ink/40 font-bold border-t border-ink/10 pt-3">
                🔒 Private Metadata — Only visible to you
              </p>

              {/* File Info */}
              <MetaBlock title="File Details" icon="🗂">
                <MetaRow label="Format" value={image.mimeType?.replace('image/', '').toUpperCase()} />
                <MetaRow label="File Size" value={fmt.size(image.size)} />
                <MetaRow label="Resolution" value={image.width && image.height ? `${image.width} × ${image.height} px` : null} />
                <MetaRow label="Original Name" value={image.originalName} />
              </MetaBlock>

              {/* Camera & EXIF */}
              {hasCameraData && (
                <MetaBlock title="Camera & Exposure" icon="📷">
                  <MetaRow label="Camera" value={image.camera} />
                  <MetaRow label="Focal Length" value={image.focalLength} />
                  <MetaRow label="Aperture" value={image.aperture} />
                  <MetaRow label="Shutter Speed" value={image.exposureTime} />
                  <MetaRow label="ISO" value={image.iso ? `ISO ${image.iso}` : null} />
                  <MetaRow label="Date Taken" value={fmt.date(image.takenAt)} />
                </MetaBlock>
              )}

              {/* Location */}
              {hasLocation && (
                <MetaBlock title="Location & GPS" icon="📍">
                  <MetaRow label="Place" value={loc.name} />
                  <MetaRow label="City" value={loc.city} />
                  <MetaRow label="Country" value={loc.country} />
                  {hasCoords && (
                    <MetaRow label="Coordinates"
                      value={`${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`} />
                  )}
                </MetaBlock>
              )}

              {(!hasCameraData && !hasLocation) && (
                <div className="text-xs text-ink/40 bg-ink/[0.03] border border-dashed border-ink/15 p-4 text-center">
                  No embedded EXIF or GPS metadata found in this image.
                </div>
              )}

              {/* Map link */}
              {hasCoords && (
                <a href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=14/${loc.lat}/${loc.lng}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-crimson underline underline-offset-2 font-semibold">
                  📌 View location on map ↗
                </a>
              )}
            </div>
          ) : (
            /* Non-owner: friendly nudge */
            <div className="text-xs text-ink/40 bg-ink/[0.03] border border-dashed border-ink/15 p-4 text-center leading-relaxed">
              📷 Technical metadata (camera specs, GPS, EXIF) is private to the uploader.
            </div>
          )}

          {/* Delete button – owner only */}
          {isOwner && (
            <div className="pt-3 border-t border-ink/10">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this artwork permanently?')) onDelete();
                }}
                className="text-xs text-crimson underline underline-offset-2 font-semibold hover:opacity-70 transition"
              >
                🗑 Delete this artwork
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
