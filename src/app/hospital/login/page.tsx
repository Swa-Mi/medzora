'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const error = searchParams.get('error');

    const handleAuth = async () => {
        setLoading(true);
        setShowResend(false);

        if (isSignup) {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || 'Signup failed');
                setLoading(false);
                return;
            }
        }

        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            alert(result.error || 'Login failed');
            if (result.error.toLowerCase().includes('verify')) {
                setShowResend(true);
            }
            setLoading(false);
            return;
        }

        // Wait a moment for session to update
        await new Promise((res) => setTimeout(res, 500));

        const session = await getSession();


        const role = session?.user?.role?.toLowerCase();

        console.log('✅ Role after login:', role);

        if (role === 'admin') {
            router.push('/hospital/dashboard/admin');
        } else if (role === 'doctor') {
            router.push('/hospital/dashboard/doctor');
        } else {
            alert('Unknown role. Please contact support.');
        }


        setLoading(false);
    };

    const handleResend = async () => {
        const res = await fetch('/api/auth/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });

        if (res.ok) {
            alert('Verification email resent!');
        } else {
            alert('Failed to resend verification email.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#00FF9F] flex items-center justify-center font-['Orbitron']">
            <div className="bg-[#0a0a0a] border-2 border-cyan-400 p-8 rounded-xl w-full max-w-md shadow-xl z-10">
                <h1 className="text-3xl font-bold mb-6 text-center animate-glow">
                    {isSignup ? 'Sign Up' : 'Login'} to Hospital Portal
                </h1>

                {isSignup && (
                    <div className="mb-4">
                        <label>Name</label>
                        <input
                            className="w-full p-2 rounded bg-black border border-[#00FF9F] text-[#00FF9F]"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            disabled={loading}
                        />
                    </div>
                )}

                <div className="mb-4">
                    <label>Email</label>
                    <input
                        type="email"
                        className="w-full p-2 rounded bg-black border border-[#00FF9F] text-[#00FF9F]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@hospital.com"
                        disabled={loading}
                    />
                </div>

                <div className="mb-6">
                    <label>Password</label>
                    <input
                        type="password"
                        className="w-full p-2 rounded bg-black border border-[#00FF9F] text-[#00FF9F]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={loading}
                    />
                </div>

                <button
                    onClick={handleAuth}
                    disabled={loading}
                    className="w-full py-2 bg-[#00FF9F] text-black font-bold rounded hover:bg-[#00cc88] transition"
                >
                    {loading
                        ? isSignup
                            ? 'Signing up...'
                            : 'Logging in...'
                        : isSignup
                            ? 'Sign Up'
                            : 'Login'}
                </button>

                {showResend && (
                    <div className="mt-4 text-center">
                        <p className="text-yellow-400">Email not verified.</p>
                        <button
                            onClick={handleResend}
                            className="underline text-cyan-400 mt-2"
                        >
                            Resend Verification Email
                        </button>
                    </div>
                )}

                <p className="text-center mt-4">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <span
                        onClick={() => setIsSignup(!isSignup)}
                        className="underline text-cyan-400 cursor-pointer"
                    >
                        {isSignup ? 'Login' : 'Sign up'}
                    </span>
                </p>

                {error && (
                    <p className="text-red-500 text-center mt-2">
                        {decodeURIComponent(error)}
                    </p>
                )}
            </div>

            {/* Neon Background */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <div className="absolute w-60 h-60 bg-[#00ff9f33] blur-3xl top-10 left-10 rounded-full"></div>
                <div className="absolute w-72 h-72 bg-[#00ffff33] blur-3xl bottom-10 right-10 rounded-full"></div>
            </div>

            <style jsx global>{`
        @keyframes glow {
          0%,
          100% {
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
