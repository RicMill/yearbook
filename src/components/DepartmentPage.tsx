import { useState, useEffect } from 'react';
import folderIcon from '../assets/departmenticon.png';
import { API_BASE_URL } from '../config';

type DepartmentPageProps = {
  year: string;
  onBack: () => void;
  onSelectDepartment: (dept: string) => void;
};

export default function DepartmentPage({ year, onBack, onSelectDepartment }: DepartmentPageProps) {
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [isLoadingDept, setIsLoadingDept] = useState(true);
  const [loadingDept, setLoadingDept] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchDepts() {
      setIsLoadingDept(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/alumni/departments?year=${year}`);
        const data = await response.json();
        if (active) {
          if (Array.isArray(data) && data.length > 0) {
            setDepartmentsList(data);
          } else {
            // Fallback list of departments
            setDepartmentsList([
              'Logistics'
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        if (active) {
          setDepartmentsList([
            'Logistics'
          ]);
        }
      } finally {
        if (active) {
          setIsLoadingDept(false);
        }
      }
    }
    fetchDepts();
    return () => {
      active = false;
    };
  }, [year]);

  const handleSelect = (dept: string) => {
    if (loadingDept) return;
    setLoadingDept(dept);
    setTimeout(() => {
      onSelectDepartment(dept);
    }, 1500); // 1.5s matching the animation
  };

  if (isLoadingDept) {
    return (
      <main className="min-h-screen pt-28 pb-12 px-6 flex flex-col items-center">
        <div className="max-w-5xl w-full">
          <button className="year-back-btn mb-8" onClick={onBack}>
            <span>←</span>
            <span>Albums</span>
            <span className="year-breadcrumb-sep">/</span>
            <span className="year-breadcrumb-current">Class of {year}</span>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
            <div className="ap-spinner" style={{ width: '48px', height: '48px', border: '3px solid rgba(59, 130, 246, 0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#9ca3af', fontWeight: 500 }}>Retrieving departments...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-12 px-6 flex flex-col items-center">
      <div className="max-w-5xl w-full">
        <button className="year-back-btn mb-8" onClick={onBack}>
          <span>←</span>
          <span>Albums</span>
          <span className="year-breadcrumb-sep">/</span>
          <span className="year-breadcrumb-current">Class of {year}</span>
        </button>

        <h1 className="text-4xl md:text-5xl font-semibold text-slate-800 text-center mb-4" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
          Select a Department
        </h1>
        <p className="text-slate-500 text-center mb-16 max-w-2xl mx-auto">
          Choose a department to explore the Class of {year} yearbook.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
          {departmentsList.map((dept) => {
            const isLoading = loadingDept === dept;
            return (
              <div 
                key={dept}
                onClick={() => handleSelect(dept)}
                className={`group cursor-pointer flex flex-col items-center hover:-translate-y-2 transition-all duration-500 ${loadingDept && loadingDept !== dept ? 'opacity-40 pointer-events-none' : ''}`}
              >
                <div className="relative w-36 h-36 md:w-80 md:h-80 mb-4 md:mb-8 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                    {/* Background ring */}
                    <circle cx="50" cy="50" r="46" fill="none" className="stroke-slate-200 group-hover:stroke-blue-200 transition-colors duration-500" strokeWidth="4" />
                    {/* Animated fill ring */}
                    {isLoading && (
                      <circle 
                        cx="50" cy="50" r="46" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        className="dept-ring-fill" 
                      />
                    )}
                  </svg>

                  <img 
                    src={folderIcon} 
                    alt={`${dept} Folder`} 
                    className={`w-24 h-24 md:w-64 md:h-64 object-contain transition-transform duration-500 drop-shadow-xl ${isLoading ? 'scale-90 opacity-80' : 'group-hover:scale-110'}`} 
                  />
                </div>
                <h3 className="text-center font-medium text-slate-700 text-sm md:text-lg leading-snug">{dept}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
