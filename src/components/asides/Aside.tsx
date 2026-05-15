import Link from "next/link";
import { User } from "@/types/user";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const exportShipmentsPDF = (users: User[]) => {
    const doc = new jsPDF();

    autoTable(doc, {
        head: [["ID", "Nombre", "Correo", "Rol"]],
        body: users.map(u => [
            u.id,
            u.name,
            u.email,
            u.role,
        ]),
    });

    doc.save("envios.pdf");
};

export function Aside({ userName, users, handleLogout, shipments }: {
    userName: string,
    users: User[],
    handleLogout: () => void,
    shipments?: any[]
}) {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0d0d0d] text-sm font-medium font-inter border-r border-white/5 flex flex-col z-50 hidden lg:flex shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
            {/* Branding */}
            <div className="p-8 pb-4">
                <span className="text-3xl font-black italic tracking-tighter text-amber-400">TRUX</span>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.4em] mt-1">Operational OS</p>
            </div>

            {/* User Profile */}
            <div className="px-8 py-6 border-y border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(255,191,0,0.2)]">
                        <span className="material-symbols-outlined text-black text-xl">person</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-black text-white uppercase tracking-wider truncate">{userName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2">
                <p className="px-4 text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] mb-4">Core Navigation</p>
                
                {[
                    { href: '/masterAdmin', label: 'Directory', icon: 'grid_view' },
                    { href: '/shipments', label: 'Shipments', icon: 'local_shipping' },
                    { href: '/quotation', label: 'Quotation', icon: 'request_quote' },
                ].map((link) => (
                    <Link 
                        key={link.href} 
                        href={link.href}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all group border border-transparent hover:border-white/5"
                    >
                        <span className="material-symbols-outlined text-xl group-hover:text-amber-400 transition-colors">{link.icon}</span>
                        <span className="text-[11px] font-black uppercase tracking-widest">{link.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Actions */}
            <div className="p-6 space-y-4 border-t border-white/5">
                <button 
                    onClick={() => exportShipmentsPDF(users)} 
                    className="w-full flex items-center justify-center gap-3 bg-zinc-900 border border-white/5 text-zinc-400 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 hover:text-white transition-all"
                >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Audit Report
                </button>
                
                <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center justify-center gap-3 bg-amber-400 text-black py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(255,191,0,0.2)] hover:shadow-[0_0_50px_rgba(255,191,0,0.4)] hover:bg-white transition-all"
                >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Term. Session
                </button>
            </div>
        </aside>
    );
}