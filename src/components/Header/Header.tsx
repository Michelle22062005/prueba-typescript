import Link from "next/link";

export function Header() {
    return (
        <header className="bg-[#131313] flex justify-between items-center w-full px-4 lg:px-8 h-16 sticky top-0 z-50 gap-4">
            <div className="flex items-center gap-4 lg:gap-12 min-w-0">
                <span className="text-2xl font-black italic tracking-tighter text-amber-400 font-['Inter'] shrink-0">TRUX</span>

            </div>
            <div className="flex items-center gap-3 lg:gap-6 shrink-0">
                {/* Nav links ocultos en mobile */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[12px] uppercase font-bold tracking-widest font-['Inter']">
                    <Link className="text-zinc-400 hover:text-amber-300 transition-colors" href="/masterAdmin">Dashboard</Link>
                    <Link className="text-zinc-400 hover:text-amber-300 transition-colors" href="/shipments">Shipments</Link>
                </nav>
                <div className="flex items-center gap-2 lg:gap-4 md:border-l md:border-zinc-800 md:pl-6">
                    <button className="material-symbols-outlined text-zinc-400 hover:text-amber-400 transition-colors">notifications</button>
                    <button className="material-symbols-outlined text-zinc-400 hover:text-amber-400 transition-colors">settings</button>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                    <img alt="https://tse1.mm.bing.net/th/id/OIP.F0qTw2uuuz395c3NzHGycAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU9X23IeyxNeFlUtzN0d4IEFyKZ67TEdb-4IoIvR2auf0T9b-yNaEdzJujTHI3Y_XCzg6ysIj_UrkdrrmuuEeZ6V-v2tLyQVtOVTuCGlsjOxMFq1oOwwuUQrP5y_R0mnbEDIyqqbG2q2uiqUpjgxmy1_3YuEAY6iZ9KKqdySFSCevyNPx7bhA6cG9oP60z1vNdfhZkh4EC-5LWneG4QZTRknYWiM9z-J08tzfO1DZsOkCjXpqErFXQ3jIGtG17bl3gAyRVBhH-adtP" />
                </div>
            </div>
        </header>
    )
}