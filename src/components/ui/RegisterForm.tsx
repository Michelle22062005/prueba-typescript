'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';

/**
 * RegisterForm creates new user accounts for customers, companies, drivers,
 * or admins. It validates phone data, sends the registration payload,
 * and redirects successful users to the login page.
 */
export default function RegisterForm() {
    // Controlled fields store the registration payload before it is submitted.
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [role, setRole] = useState('CUSTOMER');
    const [nit, setNit] = useState('');
    const [adminCode, setAdminCode] = useState('')
    
    // Countries provide the dialing code selector used to build the full phone number.
    const COUNTRIES = [
        { name: 'Colombia', code: '+57', iso: 'co' },
        { name: 'Venezuela', code: '+58', iso: 've' },
        { name: 'Ecuador', code: '+593', iso: 'ec' },
        { name: 'Peru', code: '+51', iso: 'pe' },
        { name: 'Brazil', code: '+55', iso: 'br' },
        { name: 'Bolivia', code: '+591', iso: 'bo' },
        { name: 'Paraguay', code: '+595', iso: 'py' },
        { name: 'Uruguay', code: '+598', iso: 'uy' },
        { name: 'Argentina', code: '+54', iso: 'ar' },
        { name: 'Chile', code: '+56', iso: 'cl' },
    ];

    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const router = useRouter();

    // Validates the form, sends it to the API, and handles success or error feedback.
    async function handleSubmit(e: React.FormEvent) {

        try {
            e.preventDefault();
            
            // Phone validation keeps the backend payload predictable.
            if (!phone) {
                throw new Error("Phone number is required");
            }
            if (phone.length < 7 || phone.length > 15) {
                throw new Error("Phone number must be between 7 and 15 digits");
            }

            const fullPhone = `${selectedCountry.code}${phone}`;
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone: fullPhone, password, address, role, nit, adminCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "error");
            }

            await Swal.fire({
                title: 'Registration Successful!',
                text: 'Your account has been created.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });

            localStorage.setItem("registered-user", JSON.stringify({ email }));
            router.push('/login');

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            <h2 className="text-on-surface-variant font-medium tracking-wide text-sm uppercase opacity-70">CREATE YOUR ACCOUNT</h2>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Full Name</label>
                <input
                    type="text"
                    placeholder="Pepito Perez"
                    className="w-full bg-transparent border-b border-gray p-3 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </div>
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
            <div className="space-y-2 relative">
                <label className="text-sm font-medium text-gray-400 ml-1">Phone</label>
                <div className="flex items-center w-full bg-transparent border-b border-gray rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50">
                    {/* Country Selector */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 px-3 py-3 hover:bg-white/5 transition-colors rounded-l-xl border-r border-gray/30 text-white min-w-[100px]"
                        >
                            <img 
                                src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`} 
                                alt={selectedCountry.name}
                                className="w-6 h-4 object-cover rounded-sm shadow-sm"
                            />
                            <span className="text-sm font-bold tracking-tight">{selectedCountry.code}</span>
                            <span className={`material-symbols-outlined text-[16px] transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-[#1b1b1b] border border-gray/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60] max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                                {COUNTRIES.map((country) => (
                                    <button
                                        key={country.name}
                                        type="button"
                                        onClick={() => {
                                            setSelectedCountry(country);
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#ffbf00]/10 text-left transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={`https://flagcdn.com/w40/${country.iso}.png`} 
                                                alt={country.name}
                                                className="w-6 h-4 object-cover rounded-sm"
                                            />
                                            <span className="text-sm text-gray-200 group-hover:text-white font-medium">{country.name}</span>
                                        </div>
                                        <span className="text-xs text-amber-400/60 group-hover:text-amber-400 font-black">{country.code}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Phone Input */}
                    <input
                        type="text"
                        placeholder="3333333333"
                        className="flex-1 bg-transparent p-3 text-white placeholder:text-gray-600 focus:outline-none"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    />
                </div>
                {/* Close menu when clicking outside (using an overlay) */}
                {isMenuOpen && (
                    <div className="fixed inset-0 z-50" onClick={() => setIsMenuOpen(false)} />
                )}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Address</label>
                <input
                    type="text"
                    placeholder="direccion"
                    className="w-full bg-transparent border-b border-gray p-3 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                />
            </div>
            <select
                name="role"
                id="role"
                className='w-full bg-transparent border-b border-gray p-3 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all'
                value={role}
                onChange={e => setRole(e.target.value)}
            >
                    <option value="DRIVER" className='bg-gray-900'>Conductor</option>
                
            </select>

            {role === 'ADMIN' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-medium text-amber-400 ml-1">Admin Code</label>
                    <input
                        type="text"
                        placeholder="Enter the secret code"
                        className="w-full bg-transparent border-b border-gray p-3 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        value={adminCode}
                        onChange={e => setAdminCode(e.target.value)}
                        required
                    />
                </div>
            )}
            {role === 'COMPANY' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-medium text-amber-400 ml-1">Company NIT</label>
                    <input
                        type="text"
                        placeholder="nit"
                        className="w-full bg-transparent border-b border-gray p-3 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        value={nit}
                        onChange={e => setNit(e.target.value)}
                    />
                </div>
            )}


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

            <button
                type="submit"
                className="w-full py-5 rounded-xl text-[#402d00] mt-5 font-bold uppercase tracking-widest text-sm bg-[linear-gradient(135deg,_#ffe2ab_0%,_#ffbf00_100%)] shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
            >
                Register Account
            </button>

            <div className="text-center mt-2">
                <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#fbbc00] hover:text-[#fff] font-medium transition-colors">
                        Sign in here
                    </Link>
                </p>
            </div>
        </form>
    );
}
