import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AlbumPage from './components/AlbumPage';
import DepartmentPage from './components/DepartmentPage';
import YearPage from './components/YearPage';
import AlumniPortal from './components/AlumniPortal';

type Page = 'home' | 'albums' | 'departments' | 'year' | 'alumni';

function App() {
  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#year-')) return 'year';
    if (hash.startsWith('#dept-')) return 'departments';
    if (hash === '#albums') return 'albums';
    if (hash === '#alumni') return 'alumni';
    return 'home';
  });

  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#year-')) return hash.replace('#year-', '').split('/')[0];
    if (hash.startsWith('#dept-')) return hash.replace('#dept-', '');
    return '2026';
  });

  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#year-')) {
        const parts = hash.replace('#year-', '').split('/');
        setSelectedYear(parts[0]);
        if (parts[1]) setSelectedDepartment(decodeURIComponent(parts[1]));
        setPage('year');
      } else if (hash.startsWith('#dept-')) {
        setSelectedYear(hash.replace('#dept-', ''));
        setPage('departments');
      } else if (hash === '#albums') {
        setPage('albums');
      } else if (hash === '#alumni') {
        setPage('alumni');
      } else {
        setPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const showAlbums = () => {
    window.location.hash = 'albums';
    setPage('albums');
  };

  const showHome = () => {
    window.history.pushState('', document.title, window.location.pathname);
    setPage('home');
  };

  const showDepartments = (year: string) => {
    window.location.hash = `dept-${year}`;
    setSelectedYear(year);
    setPage('departments');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showYear = (dept: string) => {
    window.location.hash = `year-${selectedYear}/${encodeURIComponent(dept)}`;
    setSelectedDepartment(dept);
    setPage('year');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showAlumni = () => {
    window.location.hash = 'alumni';
    setPage('alumni');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bg =
    page === 'home'
      ? 'oklch(0.972 0.018 85)'
      : page === 'alumni'
      ? 'transparent'
      : '#ffffff';

  return (
    <div
      className={page === 'alumni' ? 'md:h-screen md:overflow-hidden min-h-screen overflow-y-auto' : 'min-h-screen transition-colors duration-300'}
      style={{ background: bg }}
    >
      {page !== 'alumni' && (
        <Navbar page={page} onViewAlbum={showAlbums} onAlumniPortal={showAlumni} onHome={showHome} />
      )}
      {page === 'home' && (
        <HeroSection onExploreAlbum={showAlbums} />
      )}
      {page === 'albums' && (
        <AlbumPage onBackHome={showHome} onSelectAlbum={showDepartments} />
      )}
      {page === 'departments' && (
        <DepartmentPage year={selectedYear} onBack={showAlbums} onSelectDepartment={showYear} />
      )}
      {page === 'year' && (
        <YearPage year={selectedYear} department={selectedDepartment} onBack={() => showDepartments(selectedYear)} />
      )}
      {page === 'alumni' && (
        <AlumniPortal />
      )}
    </div>
  );
}

export default App;
