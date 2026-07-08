import { useState, useEffect, type CSSProperties } from 'react';
import { API_BASE_URL, getImageUrl } from '../config';

const yearTitles: Record<string, string> = {
  '2022': 'Freshers',
  '2023': 'Sophomores',
  '2024': 'Juniors',
  '2025': 'Seniors',
  '2026': 'Final Year',
};

type YearPageProps = {
  year: string;
  department: string;
  onBack: () => void;
};

interface Graduate {
  _id?: string;
  name: string;
  department: string;
  photoUrl?: string; // From backend Mongoose model
  photo?: string;    // Fallback static mock
  quote: string;
}



const doodles = [
  { kind: 'spark', label: 'main character' },
  { kind: 'tag', label: 'slay' },
  { kind: 'smile', label: '' },
  { kind: 'bolt', label: 'vibe check' },
  { kind: 'cap', label: 'class drop' },
  { kind: 'wave', label: 'soft launch' },
];

const doodlePositions = [
  { top: '8%', left: '3%', rotate: -15, size: '32px' },
  { top: '15%', right: '5%', rotate: 20, size: '28px' },
  { top: '32%', left: '1%', rotate: 10, size: '36px' },
  { top: '48%', right: '2%', rotate: -25, size: '30px' },
  { top: '65%', left: '4%', rotate: 35, size: '26px' },
  { top: '78%', right: '4%', rotate: -10, size: '34px' },
];

export default function YearPage({ year, department, onBack }: YearPageProps) {
  
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch graduates from backend
        const graduatesResponse = await fetch(
          `${API_BASE_URL}/api/alumni?year=${year}&department=${encodeURIComponent(department)}`
        );
        const graduatesData = await graduatesResponse.json();

        if (active) {
          // Set graduates from database
          if (Array.isArray(graduatesData)) {
            setGraduates(graduatesData);
          } else {
            setGraduates([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch from backend:', err);
        if (active) {
          setGraduates([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [year, department]);

  if (isLoading) {
    return (
      <main className="year-page">
        <section className="yb-hero">
          <button className="year-back-btn" onClick={onBack}>
            <span>←</span>
            <span>Albums</span>
          </button>
          <div className="yb-hero-content">
            <div className="yb-hero-badge">Loading...</div>
            <h1 className="yb-hero-title">
              <span className="yb-hero-prefix">Class of</span>
              <span className="yb-hero-year">{year}</span>
            </h1>
            <p className="yb-hero-tagline text-lg font-medium">{department}</p>
          </div>
        </section>
        <div className="year-shell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
          <div className="ap-spinner" style={{ width: '48px', height: '48px', border: '3px solid rgba(59, 130, 246, 0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#9ca3af', fontWeight: 500 }}>Retrieving yearbook records...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="year-page">
      {/* ── Scattered Doodles ── */}
      <div className="yb-doodles" aria-hidden="true">
        {doodlePositions.map((pos, i) => (
          <span
            key={i}
            className={`yb-doodle yb-doodle--${doodles[i % doodles.length].kind}`}
            style={{
              top: pos.top,
              left: pos.left,
              right: pos.right,
              transform: `rotate(${pos.rotate}deg)`,
              '--doodle-size': pos.size,
            } as CSSProperties}
          >
            <span>{doodles[i % doodles.length].label}</span>
          </span>
        ))}
      </div>

      {/* ═══════════ Hero ═══════════ */}
      <section className="yb-hero">
        <button className="year-back-btn" onClick={onBack}>
          <span>←</span>
          <span>Albums</span>
          <span className="year-breadcrumb-sep">/</span>
          <span className="year-breadcrumb-current">Class of {year}</span>
        </button>

        <div className="yb-hero-content">
          <div className="yb-hero-badge">{yearTitles[year] || 'Yearbook'}</div>
          <h1 className="yb-hero-title">
            <span className="yb-hero-prefix">Class of</span>
            <span className="yb-hero-year">{year}</span>
          </h1>
          <p className="yb-hero-tagline text-lg font-medium">{department}</p>
          <div className="yb-hero-rule">
            <span />
            <span className="yb-rule-spark" />
            <span />
          </div>
        </div>
      </section>

      <div className="year-shell">
        {/* ═══════════ Graduates ═══════════ */}
        <section id="graduates" className="year-section">
          <div className="yb-section-head">
            <h2>Graduates</h2>
            <span className="yb-section-count">{graduates.length} students</span>
          </div>

          <div className="yb-portrait-grid">
            {graduates.map((s, i) => (
              <div key={`${s.name}-${i}`} className="yb-portrait" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="yb-portrait-frame">
                  {s.photoUrl || s.photo ? (
                    <img src={getImageUrl(s.photoUrl || s.photo)} alt={s.name} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '64px', fontWeight: 'bold' }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="yb-portrait-name">{s.name}</h3>
                <p className="yb-portrait-quote">{s.quote}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}

