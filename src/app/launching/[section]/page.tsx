'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function LaunchingSoon() {
    const { section } = useParams();

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@600&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black font-['Orbitron'] text-[#39ff14] relative">
            {/* Particle Background Glow */}
            <div className="absolute w-72 h-72 bg-[#39ff1433] blur-3xl top-10 left-10 rounded-full"></div>
            <div className="absolute w-96 h-96 bg-[#00ffff33] blur-3xl bottom-10 right-10 rounded-full"></div>

            <h1 className="text-5xl font-bold mb-4 animate-pulse-fast">
                {section?.toString().toUpperCase()} Section
            </h1>
            <p className="text-2xl text-center max-w-lg animate-flicker">
                🚧 We're working on the {section?.toString().toUpperCase()} module. Launching soon!
            </p>

            {/* Animations */}
            <style jsx global>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .animate-flicker {
          animation: flicker 2s linear infinite;
        }

        .animate-pulse-fast {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
