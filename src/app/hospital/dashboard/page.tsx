'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HospitalDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    console.log('🧠 Session:', session);

    if (!session) {
      router.push('/hospital/login');
    } else if (session.user?.role === 'ADMIN') {
      router.push('/hospital/dashboard/admin');
    } else if (session.user?.role === 'DOCTOR') {
      router.push('/doctor'); // ✅ Redirect doctor properly
    }
  }, [status, session, router]);

  // Optional fallback UI
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black text-[#00FF9F] font-['Orbitron']">
      <div className="bg-[#0a0a0a] p-10 rounded-xl border-4 border-cyan-400 shadow-[0_0_40px_#00ffff66] w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4 animate-glow">Welcome, {session?.user?.email}</h1>
        <p className="text-lg mb-8">This is your secure hospital dashboard.</p>
        <button
          onClick={() => router.push('/hospital/login')}
          className="mt-4 px-6 py-2 bg-[#00FF9F] text-black rounded font-semibold hover:bg-[#00cc88] transition"
        >
          Logout
        </button>
      </div>

      <style jsx global>{`
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 8px #00FF9F, 0 0 16px #00FFFF;
          }
          50% {
            text-shadow: 0 0 16px #00FFFF, 0 0 32px #00FF9F;
          }
        }
        .animate-glow {
          animation: glow 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
