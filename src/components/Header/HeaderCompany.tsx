
export function HeaderCompany() {
    return (
        <header className="bg-[#131313] text-[#ffbf00] font-['Inter'] uppercase tracking-[0.05em] text-sm font-bold border-b border-[#504532]/15 flex justify-between items-center w-full px-8 h-16 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <span className="opacity-50">Portal</span>
                <span className="material-symbols-outlined text-[10px] opacity-30">arrow_forward_ios</span>
                <span className="text-on-surface">Company Overview</span>
            </div>
            <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-[#e2e2e2] opacity-70 hover:text-[#ffbf00] cursor-pointer transition-colors">notifications</span>
                <span className="material-symbols-outlined text-[#e2e2e2] opacity-70 hover:text-[#ffbf00] cursor-pointer transition-colors">settings</span>
            </div>
        </header>
    )
}