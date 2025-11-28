'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const clickSound = useRef<HTMLAudioElement | null>(null);

  const sections = [
    { label: 'PATIENTS', link: '/launching/patients', icon: '/icons/patient.svg' },
    { label: 'CLINICS', link: '/launching/clinics', icon: '/icons/clinic.svg' },
    { label: 'Pharmaceuticals', link: '/launching/pharmaceuticals', icon: '/icons/pharma.svg' },
    { label: 'Hospitals', link: '/hospital/login', icon: '/icons/hospital.svg' }, // ✅ fix
  ];

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handleClick = (link: string) => {
    if (clickSound.current) clickSound.current.play();
    router.push(link);
  };

  return (
    <div className="relative h-screen w-screen bg-black text-[#39ff14] font-['Orbitron'] overflow-hidden">
      {/* Sound */}
      <audio ref={clickSound} src="/click.mp3" preload="auto" />

      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] z-0 pointer-events-none">
        <h1 className="text-[22rem] font-bold tracking-widest">MedZora</h1>
      </div>

      {/* Heading at Top */}
      <div className="absolute top-6 w-full text-center z-20">
        <h1 className="text-4xl font-bold underline decoration-[#39ff14] decoration-[3px]">
          Medzora Dashboard
        </h1>
      </div>

      {/* Dashboard Grid */}
      <div className="h-full flex items-center justify-center">
        <div className="grid grid-cols-2 grid-rows-2 gap-x-24 gap-y-16 z-20">
          {sections.map(({ label, link, icon }) => (
            <div
              key={label}
              onClick={() => handleClick(link)}
              className="relative w-[240px] h-[140px] cursor-pointer group"
            >
              {/* Outer Neon Blue Border */}
              <div className="absolute inset-0 border-[3px] border-cyan-300 rounded-lg z-30" />

              {/* Inner Green Border */}
              <div className="absolute inset-[6px] border-[2px] border-[#39ff14] rounded-md z-20" />

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-[#39ff14] opacity-0 group-hover:opacity-10 blur-xl rounded-lg z-10 transition-all duration-300" />

              {/* Icon + Text */}
              <div className="relative z-40 h-full flex flex-col items-center justify-center gap-2">
                <img src={icon} alt={label} className="h-6 w-6 animate-pulse" />
                <h2 className="text-xl font-semibold animate-glow">{label}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glow Text Animation */}
      <style jsx global>{`
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 3px #39ff14, 0 0 8px #39ff14;
          }
          50% {
            text-shadow: 0 0 10px #39ff14, 0 0 15px #39ff14;
          }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
