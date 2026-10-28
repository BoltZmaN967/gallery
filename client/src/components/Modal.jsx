import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Full-screen cream panel like the museum design, animated with GSAP
export default function Modal({ onClose, children }) {
  const panel = useRef();

  useEffect(() => {
    gsap.fromTo(panel.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    gsap.from('.reveal', { opacity: 0, y: 20, stagger: 0.08, delay: 0.2, duration: 0.5 });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
      <div ref={panel} className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-cream p-8 md:p-14">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-ink transition hover:rotate-90 hover:border-crimson hover:text-crimson"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
