'use client'; // ✅ Must be at the top

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      router.push('/dashboard');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  if (!show) return null;

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-sciGreen">
      <h1 className="text-8xl font-extrabold animate-pulse drop-shadow-lg">MedZora</h1>
      <p className="mt-6 text-2xl font-medium text-sciGreen opacity-80 tracking-widest">A Manu AI Product</p>
    </div>
  );
}
