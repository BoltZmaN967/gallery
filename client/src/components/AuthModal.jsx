import { useState } from 'react';
import Modal from './Modal';
import { api } from '../api';

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const switchMode = (m) => { setMode(m); setError(''); setForm({ name: '', email: '', password: '' }); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: form });
      onAuth(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="mx-auto max-w-sm py-4">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-grid w-12 h-12 place-items-center border-2 border-ink bg-ink text-cream font-bold text-base mb-3">
            MA
          </div>
          <h2 className="title text-3xl">
            {mode === 'login' ? 'Welcome Back' : 'Join the Gallery'}
          </h2>
          <p className="text-xs text-ink/50 mt-1">
            {mode === 'login'
              ? 'Sign in to publish your artworks and access your metadata.'
              : 'Create an account to share your photography with the world.'}
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex border border-ink/20 mb-7">
          {['login', 'signup'].map((m) => (
            <button key={m} type="button" onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition ${
                mode === m ? 'bg-ink text-cream' : 'text-ink/50 hover:text-ink bg-transparent'
              }`}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <div className="reveal">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-1.5">Full Name</label>
              <input className="input" placeholder="Your name" value={form.name}
                onChange={set('name')} required autoFocus />
            </div>
          )}

          <div className="reveal">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-1.5">Email</label>
            <input className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')} required />
          </div>

          <div className="reveal">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-1.5">Password</label>
            <input className="input" type="password" placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              value={form.password} onChange={set('password')} required minLength={6} />
          </div>

          {error && (
            <div className="reveal bg-crimson/10 border border-crimson/30 px-4 py-2.5 text-xs text-crimson font-medium text-center">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="reveal btn w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                {mode === 'login' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <p className="reveal mt-6 text-center text-xs text-ink/50">
          {mode === 'login' ? "Don't have an account? " : 'Already a member? '}
          <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-crimson font-semibold underline underline-offset-2 ml-0.5">
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </Modal>
  );
}
