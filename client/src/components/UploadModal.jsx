import { useState, useRef } from 'react';
import Modal from './Modal';
import { api } from '../api';

export default function UploadModal({ token, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please choose a valid image file (JPEG, PNG, WebP, GIF…)');
      return;
    }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (!form.title) {
      const name = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setForm(prev => ({ ...prev, title: name.charAt(0).toUpperCase() + name.slice(1) }));
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select an image first.');
    if (!form.title.trim()) return setError('Title is required.');
    setLoading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('image', file);
      body.append('title', form.title.trim());
      body.append('description', form.description.trim());
      const img = await api('/images', { method: 'POST', body, token });
      onUploaded(img);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit} className="mx-auto max-w-xl py-2 space-y-6">

        {/* Header */}
        <div className="border-b border-ink/10 pb-4">
          <p className="text-[11px] uppercase tracking-widest text-crimson font-bold mb-1">New Submission</p>
          <h2 className="title text-3xl">Add Your Artwork</h2>
          <p className="text-xs text-ink/50 mt-1 leading-relaxed">
            Upload an image — all EXIF metadata (camera, GPS, exposure) is extracted automatically by the server. Only you can view the full metadata.
          </p>
        </div>

        {/* Drop Zone */}
        <div className="reveal">
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`cursor-pointer border-2 border-dashed transition-colors min-h-[180px] flex flex-col items-center justify-center gap-3 p-8 text-center ${
                dragOver ? 'border-crimson bg-crimson/5' : 'border-ink/25 hover:border-ink/60 bg-ink/[0.02]'
              }`}
            >
              <svg className="w-10 h-10 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-ink">
                  Drag & drop your image or{' '}
                  <span className="text-crimson underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-ink/40 mt-0.5">JPEG · PNG · WebP · up to 15 MB</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
            </div>
          ) : (
            <div className="relative border border-ink/20 bg-ink/[0.02] p-4 flex gap-4 items-start">
              <div className="w-24 h-24 shrink-0 overflow-hidden border border-ink/15 bg-ink/10">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-ink">{file.name}</p>
                <p className="text-xs text-ink/50 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}</p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <span>✦</span> EXIF will be auto-extracted on upload
                </p>
                <button type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="mt-2 text-xs text-crimson underline hover:opacity-70">
                  Change image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="reveal space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1.5">
              Title <span className="text-crimson">*</span>
            </label>
            <input
              className="input"
              placeholder="Give your artwork a title…"
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1.5">
              Description <span className="text-ink/30 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              className="input resize-none leading-relaxed"
              rows={3}
              placeholder="Share the story, technique, or inspiration behind this piece…"
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="reveal bg-crimson/10 border border-crimson/30 px-4 py-2.5 text-xs text-crimson font-medium">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="reveal flex items-center justify-end gap-3 border-t border-ink/10 pt-4">
          <button type="button" onClick={onClose}
            className="px-5 py-2 text-sm text-ink/60 hover:text-ink font-medium transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="btn min-w-[130px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                Uploading…
              </>
            ) : 'Publish Artwork'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
