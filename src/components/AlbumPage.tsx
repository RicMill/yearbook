import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const ALBUM_STYLES: Record<string, { title: string; tone: string; paper: string }> = {
  '2022': { title: 'Freshers', tone: '#dff7eb', paper: '#f4fbf8' },
  '2023': { title: 'Sophomores', tone: '#ffe7a9', paper: '#fff7df' },
  '2024': { title: 'Juniors', tone: '#dff7eb', paper: '#f5fbff' },
  '2025': { title: 'Seniors', tone: '#ffe7a9', paper: '#fff9eb' },
  '2026': { title: 'Final Year', tone: '#ffd7d0', paper: '#fff4f1' },
};

const FALLBACK_STYLES = [
  { tone: '#dff7eb', paper: '#f4fbf8' },
  { tone: '#ffe7a9', paper: '#fff7df' },
  { tone: '#ffd7d0', paper: '#fff4f1' },
  { tone: '#dff7eb', paper: '#f5fbff' },
  { tone: '#ffe7a9', paper: '#fff9eb' },
];

function getAlbumStyles(year: string, index: number) {
  if (ALBUM_STYLES[year]) {
    return ALBUM_STYLES[year];
  }
  const fallback = FALLBACK_STYLES[index % FALLBACK_STYLES.length];
  return {
    title: `Class of ${year}`,
    tone: fallback.tone,
    paper: fallback.paper,
  };
}

type AlbumFolderProps = {
  title: string;
  year: string;
  count: number;
  tone: string;
  paper: string;
  onSelect: () => void;
};

function AlbumFolder({ title, year, count, tone, paper, onSelect }: AlbumFolderProps) {
  return (
    <article className="album-card" onClick={onSelect}>
      <div className="album-folder">
        <div className="album-paper album-paper-left" style={{ background: paper }}>
          <div className="album-paper-stamp" style={{ background: tone }}>
            <span />
          </div>
          <div className="album-paper-line album-paper-line-one" />
          <div className="album-paper-line album-paper-line-two" />
        </div>

        <div className="album-paper album-paper-right" style={{ background: tone }}>
          <div className="album-paper-dot" />
          <div className="album-paper-light" />
        </div>

        <div className="album-folder-front">
          <div className="album-folder-tab" />
          <span className="album-scribble">
            no cap
          </span>
          <div className="album-year-badge">
            <span>Class</span>
            <strong>{year}</strong>
          </div>
        </div>
      </div>

      <div className="album-card-title">
        <span>{title}</span>
        <span>{count}</span>
      </div>
    </article>
  );
}

type AlbumPageProps = {
  onBackHome: () => void;
  onSelectAlbum: (year: string) => void;
};

export default function AlbumPage({ onBackHome, onSelectAlbum }: AlbumPageProps) {
  const [albumsList, setAlbumsList] = useState<{ title: string; year: string; count: number; tone: string; paper: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchAlbums() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/alumni/albums`);
        const data = await response.json();
        
        if (active) {
          if (data && Array.isArray(data.years)) {
            // Build class albums dynamically
            const fetchedAlbums = data.years.map((item: { year: string; count: number }, index: number) => {
              const styles = getAlbumStyles(item.year, index);
              return {
                title: styles.title,
                year: item.year,
                count: item.count,
                tone: styles.tone,
                paper: styles.paper,
              };
            });

            setAlbumsList(fetchedAlbums);
          } else {
            setAlbumsList([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch albums:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    fetchAlbums();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="album-page">
        <section className="album-shell">
          <div className="album-header">
            <div>
              <button onClick={onBackHome} className="album-back-button">Back</button>
              <h1>Albums</h1>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
            <div className="ap-spinner" style={{ width: '48px', height: '48px', border: '3px solid rgba(59, 130, 246, 0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#9ca3af', fontWeight: 500 }}>Retrieving graduation classes...</p>
          </div>
        </section>
      </main>
    );
  }

  if (albumsList.length === 0) {
    return (
      <main className="album-page">
        <section className="album-shell">
          <div className="album-header">
            <div>
              <button onClick={onBackHome} className="album-back-button">Back</button>
              <h1>Albums</h1>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '8px' }}>
            <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: 600 }}>No Albums Found</p>
            <p style={{ color: '#9ca3af' }}>There are no graduates registered in the system yet.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="album-page">
      <section className="album-shell">
        <div className="album-header">
          <div>
            <button
              onClick={onBackHome}
              className="album-back-button"
            >
              Back
            </button>
            <h1>Albums</h1>
          </div>
        </div>

        <div className="album-grid">
          {albumsList.map((album) => (
            <AlbumFolder key={`${album.title}-${album.year}`} {...album} onSelect={() => onSelectAlbum(album.year)} />
          ))}
        </div>

      </section>
    </main>
  );
}
