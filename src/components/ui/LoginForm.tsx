'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';

/**
 * LoginForm authenticates a user with email and password.
 * It stores the returned session data for the current UI flow,
 * then routes users to the dashboard that matches their role.
 */
export default function RegisterForm() {
    // Controlled inputs keep the form values synchronized with React state.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {

        try {
            e.preventDefault();
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "error");
            }
            await Swal.fire({
                title: `Welcome ${email}!`,
                text: 'Session started successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            localStorage.setItem("accessToken", data.accessToken)
            localStorage.setItem("logged-in-user", JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role
            }));
            // Redirect the authenticated user according to their role.
            const role = data.user.role;
            if (role === "ADMIN") {
                router.push('/masterAdmin');
            } else if (role === "COMPANY") {
                router.push('/company');
            } else if (role === "DRIVER") {
                router.push('/driver');
            } else if (role === "CUSTOMER") {
                router.push('/customer');
            }
            // Keep the role-based redirects explicit so each portal is easy to trace.

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Something went wrong";
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Try Again',
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full text-start">
            <h2 className="text-2xl font-black tracking-tighter text-[#fbbc00]">TRUX LOGISTICS</h2>
            <p className="text-on-surface-variant font-medium tracking-wide text-sm uppercase opacity-70">Enter credentials to initialize your session</p>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full bg-transparent border-b border-gray p-3 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b border-gray p-3 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>
            <button className="w-full py-5 rounded-xl text-[#402d00] mt-5 font-bold uppercase tracking-widest text-sm bg-[linear-gradient(135deg,_#ffe2ab_0%,_#ffbf00_100%)] shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2" type="submit">
                Sign In
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'wght' 700" }}>arrow_forward</span>
            </button>

            <div className="text-center mt-2">
                <p className="text-sm text-gray-500">
                    Do not have an account?{" "}
                    <Link href="/register" className="text-[#fbbc00] hover:text-[#e3ab14] font-medium transition-colors">
                        Register here
                    </Link>
                </p>
            </div>
        </form>
    );
}
