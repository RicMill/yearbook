import { useState, useEffect } from 'react';
import ksbLogo from '../assets/ksb.png';
import { API_BASE_URL } from '../config';

type NavbarProps = {
  onViewAlbum: () => void;
  onAlumniPortal: () => void;
  onHome: () => void;
  page: 'home' | 'albums' | 'departments' | 'year' | 'alumni';
};

export default function Navbar({ onAlumniPortal, onHome, page }: NavbarProps) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('alumniProfile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const bg = page === 'home' ? 'oklch(0.972 0.018 85 / 0.88)' : 'rgba(255, 255, 255, 0.88)';
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-colors duration-300"
      style={{ background: bg, backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-4 cursor-pointer" onClick={onHome}>
        <img src={ksbLogo} alt="Faculty Logo" className="h-10 md:h-12 w-auto object-contain hover:scale-105 transition-transform duration-300" />
      </div>

      <div className="flex items-center gap-3">
        {profile ? (
          <button
            onClick={onAlumniPortal}
            className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold pl-2 pr-4 py-1.5 rounded-full hover:bg-slate-200 transition-colors shadow-sm"
          >
            {profile.photoUrl ? (
              <img src={profile.photoUrl.startsWith('http') ? profile.photoUrl : `${API_BASE_URL}${profile.photoUrl}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            {profile.name}
          </button>
        ) : (
          <button
            onClick={onAlumniPortal}
            className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
          >
            Alumni Portal
          </button>
        )}
      </div>
    </nav>
  );
}
