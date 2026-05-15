import Link from "next/link";
import { User } from "@/types/user";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Aside renders the desktop sidebar shared by admin-oriented pages.
 * It shows the current user, links to primary workspaces, exports a PDF report,
 * and exposes the logout action passed in by the parent page.
 */

// Generates a simple PDF report from the user directory data.
const exportShipmentsPDF = (users: User[]) => {
    const doc = new jsPDF();

    autoTable(doc, {
        head: [["ID", "Name", "Email", "Role"]],
        body: users.map(u => [
            u.id,
            u.name,
            u.email,
            u.role,
        ]),
    });

    doc.save("shipments.pdf");
};

export function Aside({ userName, users, handleLogout, shipments }: {
    userName: string,
    users: User[],
    handleLogout: () => void,
    shipments?: unknown[]
}) {
    return (

        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1b1b1b] text-sm font-medium font-inter border-r border-slate-800 flex-col p-4 gap-6 z-50 hidden lg:flex">
            <div className="px-6 pb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-amber-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-black text-sm">person</span>
                        </div>
                    </div>
                    <div>
                        <p className="font-['Inter'] uppercase tracking-[0.05em] text-[10px] font-bold text-amber-400">{userName}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.05em]">Terminal 01-A</p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 space-y-1">
                <div className="px-3">
                    <div className="px-3">
                        <div className="flex items-center gap-3 px-4 py-3 text-[#e2e2e2]/40 hover:bg-[#353535]/50 hover:text-[#ffbf00] rounded-r-full font-['Inter'] uppercase tracking-[0.05em] text-xs font-semibold transition-all">
                            <span className="material-symbols-outlined">badge</span>
                            <Link href="/masterAdmin">Master Admin</Link>
                        </div>
                    </div>
                    <div className="px-3">
                        <div className="flex items-center gap-3 px-4 py-3 text-[#e2e2e2]/40 hover:bg-[#353535]/50 hover:text-[#ffbf00] rounded-r-full font-['Inter'] uppercase tracking-[0.05em] text-xs font-semibold transition-all">
                            <span className="material-symbols-outlined">badge</span>
                            <Link href="/shipments">Shipments</Link>
                        </div>
                    </div>
                    <div className="px-3">
                        <div className="flex items-center gap-3 px-4 py-3 text-[#e2e2e2]/40 hover:bg-[#353535]/50 hover:text-[#ffbf00] rounded-r-full font-['Inter'] uppercase tracking-[0.05em] text-xs font-semibold transition-all">
                            <span className="material-symbols-outlined">receipt</span>
                            <Link href="/quotation">Quotation</Link>
                        </div>


                    </div>

                </div>
            </nav>
            <div className="px-6 py-4 space-y-4">
                <button onClick={() => exportShipmentsPDF(users)} className="w-full bg-amber-400 text-black py-3 rounded-xl font-bold uppercase tracking-[0.05em] text-[10px] shadow-[0_0_12px_rgba(255,191,0,0.3)] hover:shadow-[0_0_20px_rgba(255,191,0,0.4)] transition-all">
                    Generate Report
                </button>
            </div>
            <div className='px-8 py-2 space-y-2'>
                <button onClick={handleLogout} className="w-full text-on-primary py-3 rounded-xl font-bold uppercase tracking-[0.05em] text-[10px] shadow-[0_0_12px_rgba(255,191,0,0.3)] hover:shadow-[0_0_10px_rgba(255,191,0,0.4)] transition-all ">
                    Log Out
                </button>
            </div>
        </aside>
    )
}
