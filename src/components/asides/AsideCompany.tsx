import { useState } from "react"
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function AsideCompany() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Error cerrando sesión', e);
        } finally {
            localStorage.clear();
            router.push('/login');
        }
    }
    return (

        <aside className="h-screen w-72 fixed left-0 top-0 border-r border-[#504532]/15 bg-[#1b1b1b] flex flex-col py-8 z-50 shadow-[0_0_20px_rgba(255,191,0,0.05)]">
            <div className="px-8 mb-10">
                <h1 className="text-3xl font-black italic text-[#ffbf00] tracking-tighter">TRUX</h1>
                <p className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase opacity-50 mt-1">Precision Logistics</p>
            </div>
            <nav className="flex-1 space-y-1">
                <Link href="/company" className="flex items-center gap-3 px-4 py-3 font-body text-label-md tracking-[0.05em] uppercase text-[#ffbf00] font-bold rounded-xl transition-all hover:bg-[#2c2c2c] active:bg-[#222222] active:scale-95 cursor-pointer">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="font-['Inter'] text-sm tracking-[0.05em] uppercase font-bold">Dashboard</span>
                </Link>


                <Link href="/myShipments" className="flex items-center gap-3 px-4 py-3 font-body text-label-md tracking-[0.05em] uppercase text-[#ffbf00] font-bold rounded-xl transition-all hover:bg-[#2c2c2c] active:bg-[#222222] active:scale-95 cursor-pointer">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                    <span className="font-['Inter'] text-sm tracking-[0.05em] uppercase font-bold">My Shipments</span>
                </Link>

            </nav>
            <div className="px-6 mt-auto">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 bg-[#ffbf00] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_12px_rgba(255,191,0,0.3)] transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined">add</span>
                    <span className="uppercase tracking-widest text-xs">New Request</span>
                </button>
            </div>
            <div className='px-8 py-2 space-y-2'>
                <button onClick={handleLogout} className="w-full bg-red-500 text-white py-3 rounded-xl font-bold uppercase tracking-[0.05em] text-[10px] hover:bg-red-600 transition-all">
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}