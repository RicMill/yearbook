import { useEffect, useState } from 'react';
import { API_BASE_URL, getImageUrl } from '../config';

const portraitLayout = [
  {
    width: 'w-[80px] sm:w-[120px] md:w-[155px] lg:w-[185px]',
    height: 'h-[160px] sm:h-[240px] md:h-[310px] lg:h-[370px]',
    transform: 'rotateY(36deg) translateZ(10px)',
    zIndex: 10,
  },
  {
    width: 'w-[75px] sm:w-[110px] md:w-[140px] lg:w-[165px]',
    height: 'h-[145px] sm:h-[215px] md:h-[275px] lg:h-[330px]',
    transform: 'rotateY(24deg) translateZ(5px)',
    zIndex: 20,
  },
  {
    width: 'w-[68px] sm:w-[100px] md:w-[125px] lg:w-[148px]',
    height: 'h-[130px] sm:h-[190px] md:h-[240px] lg:h-[290px]',
    transform: 'rotateY(12deg) translateZ(1px)',
    zIndex: 30,
  },
  {
    width: 'w-[64px] sm:w-[94px] md:w-[118px] lg:w-[138px]',
    height: 'h-[120px] sm:h-[175px] md:h-[220px] lg:h-[265px]',
    transform: 'rotateY(0deg) translateZ(0px)',
    zIndex: 40,
  },
  {
    width: 'w-[68px] sm:w-[100px] md:w-[125px] lg:w-[148px]',
    height: 'h-[130px] sm:h-[190px] md:h-[240px] lg:h-[290px]',
    transform: 'rotateY(-12deg) translateZ(1px)',
    zIndex: 30,
  },
  {
    width: 'w-[75px] sm:w-[110px] md:w-[140px] lg:w-[165px]',
    height: 'h-[145px] sm:h-[215px] md:h-[275px] lg:h-[330px]',
    transform: 'rotateY(-24deg) translateZ(5px)',
    zIndex: 20,
  },
  {
    width: 'w-[80px] sm:w-[120px] md:w-[155px] lg:w-[185px]',
    height: 'h-[160px] sm:h-[240px] md:h-[310px] lg:h-[370px]',
    transform: 'rotateY(-36deg) translateZ(10px)',
    zIndex: 10,
  },
];

const features = [
  {
    title: 'Interactive Alumni Profiles',
    desc: 'Browse graduates\' details, student numbers, quotes, and bios in a beautifully styled collection.',
  },
  {
    title: 'Digital Quotes',
    desc: 'Relive the highlights of your final year with personalized class quotes.',
    icon: '💬',
  },
  {
    title: 'Faculty & Class Albums',
    desc: 'Easily navigate through different graduating classes, departments, and faculty entries.',
  },
];

type HeroSectionProps = {
  onExploreAlbum: () => void;
};

export default function HeroSection({ onExploreAlbum }: HeroSectionProps) {
  // Track hovered index to apply seamless inline 3D scales
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const [allStudents, setAllStudents] = useState<any[]>([]);

  // Initialize the 7 slots as empty loading states
  const [displayed, setDisplayed] = useState<{ name: string; src: string; slotId: number; isChanging: boolean }[]>(
    Array.from({ length: 7 }, (_, i) => ({
      name: '',
      src: '',
      slotId: i,
      isChanging: false,
    }))
  );

  // Fetch approved alumni from database
  useEffect(() => {
    let active = true;
    async function fetchAlumni() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/alumni`);
        const data = await response.json();
        if (active && Array.isArray(data) && data.length > 0) {
          setAllStudents(data);
        }
      } catch (err) {
        console.error('Error fetching alumni for hero section:', err);
      }
    }
    fetchAlumni();
    return () => {
      active = false;
    };
  }, []);

  // Set the initial visible students once they are fetched
  useEffect(() => {
    if (allStudents.length > 0) {
      const initial = Array.from({ length: 7 }, (_, i) => {
        const student = allStudents[i % allStudents.length];
        return {
          name: student.name,
          src: getImageUrl(student.photoUrl),
          slotId: i,
          isChanging: false,
        };
      });
      setDisplayed(initial);
    }
  }, [allStudents]);

  // Cycle one face randomly every 1.4 seconds to show everyone quickly
  useEffect(() => {
    if (allStudents.length <= 7) return;

    const interval = setInterval(() => {
      // Pick a random card slot (0 to 6)
      const slotIndex = Math.floor(Math.random() * 7);

      setDisplayed(prev => {
        // Track currently visible names to avoid displaying duplicate students
        const currentNames = new Set(prev.map(d => d.name));

        // Filter pool to candidates that are not currently displayed
        const candidates = allStudents.filter(s => !currentNames.has(s.name));
        if (candidates.length === 0) return prev;

        // Select a random new student
        const candidate = candidates[Math.floor(Math.random() * candidates.length)];

        // Phase 1: Set transition state to true to fade out & scale down
        const step1 = [...prev];
        step1[slotIndex] = {
          ...step1[slotIndex],
          isChanging: true,
        };

        // Phase 2: After transition fades out (200ms), swap data and fade back in
        setTimeout(() => {
          setDisplayed(current => {
            const step2 = [...current];
            step2[slotIndex] = {
              ...step2[slotIndex],
              name: candidate.name,
              src: getImageUrl(candidate.photoUrl),
              isChanging: false,
            };
            return step2;
          });
        }, 200);

        return step1;
      });
    }, 1400);

    return () => clearInterval(interval);
  }, [allStudents]);

  return (
    <section className="relative min-h-screen flex flex-col items-center pt-24 overflow-hidden" style={{ background: 'oklch(0.972 0.018 85)' }}>
      {/* ── Text content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl w-full">
        <h1 className="text-5xl md:text-[64px] text-[#0A0A0A] leading-[1.1] mb-6"
          style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
          <span className="font-normal text-[#2A2A2A]">Celebrating Our Journey,</span><br />
          <span className="font-semibold">Class of 2026</span>
        </h1>

        <p className="text-[#6B6B6B] text-[17px] max-w-lg leading-relaxed mb-8 font-medium">
          A final year album of the faces and milestones<br />
          that defined our department.
        </p>

        <button
          onClick={onExploreAlbum}
          className="flex items-center gap-2 bg-blue-600 text-white text-[15px] font-medium px-6 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
        >
          Explore the Album
          <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm">
            →
          </span>
        </button>
      </div>

      {/* ── Curved Portrait Panorama ── */}
      <div className="relative w-full flex items-center justify-center py-8 md:py-14 overflow-visible" style={{ perspective: '1400px' }}>
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 w-full overflow-visible" style={{ transformStyle: 'preserve-3d' }}>
          {displayed.map((student, i) => {
            const card = portraitLayout[i];

            return (
              <div
                key={student.slotId}
                onMouseEnter={() => setHoveredSlot(i)}
                onMouseLeave={() => setHoveredSlot(null)}
                className={`${card.width} ${card.height} relative shrink-0 overflow-hidden rounded-[12px] sm:rounded-[18px] md:rounded-[24px] bg-stone-200 shadow-[0_12px_28px_rgba(0,0,0,0.12)] cursor-pointer`}
                style={{
                  zIndex: card.zIndex,
                  transform: hoveredSlot === i ? `${card.transform} scale(1.05)` : card.transform,
                  transformOrigin: 'center center',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {student.src ? (
                  <img
                    src={student.src}
                    alt={student.name}
                    className="h-full w-full object-cover select-none pointer-events-none transition-all duration-200 ease-in-out"
                    style={{
                      opacity: student.isChanging ? 0.15 : 1,
                      filter: student.isChanging ? 'scale(0.95) blur(5px)' : 'scale(1) blur(0px)',
                    }}
                  />
                ) : (
                  <div className="h-full w-full bg-slate-200 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Feature strip ── */}
      <div className="relative z-10 w-full max-w-[1100px] mx-auto mt-0 pb-20 px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {features.map((f, i) => (
            <div key={f.title} className="flex-1 flex flex-col items-center text-center relative px-4">
              <h3 className="text-[#1A1A1A] font-semibold text-lg mb-3">{f.title}</h3>
              <p className="text-[#7A7A7A] text-[14px] leading-relaxed max-w-[280px]">{f.desc}</p>
              
              {/* Vertical separators */}
              {i < features.length - 1 && (
                <div className="hidden md:block absolute right-0 top-[10%] bottom-[10%] w-[1px] bg-[#E5E0D8]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
