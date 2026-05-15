import { AsideCompany } from "../asides/AsideCompany";
import { HeaderCompany } from "../Header/HeaderCompany";

export function MyShipments() {
    return (
        <div className="overflow-x-hidden" style={{ backgroundColor: '#131313', color: '#e2e2e2', fontFamily: "'Inter', sans-serif" }}>
            <AsideCompany />
            <main className="ml-72 min-h-screen flex flex-col bg-[#131313]">
                <HeaderCompany />

                <div className="p-8">
                    {/* <!-- Summary Header Section --> */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* <!-- Telemetry Module 1 --> */}
                        <div className="bg-[#2a2a2a] p-6 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffbf00]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#ffbf00]/10 transition-all"></div>
                            <p className="font-label text-label-md tracking-[0.05em] uppercase text-[#d4c5ab] mb-2">In Transit</p>
                            <div className="flex items-end gap-3">
                                <span className="text-display-md font-black tracking-tight text-on-[#131313]">24</span>
                                <span className="text-[#ffbf00] text-sm font-bold mb-2">+3 since yesterday</span>
                            </div>
                        </div>
                        {/* <!-- Telemetry Module 2 --> */}
                        <div className="bg-[#2a2a2a] p-6 rounded-xl relative overflow-hidden">
                            <p className="font-label text-label-md tracking-[0.05em] uppercase text-[#d4c5ab] mb-2">Pending Payment</p>
                            <div className="flex items-end gap-3">
                                <span className="text-display-md font-black tracking-tight text-on-[#131313]">08</span>
                                <span className="text-[#ffb4ab] text-sm font-bold mb-2">2 Overdue</span>
                            </div>
                        </div>
                        {/* <!-- Telemetry Module 3 --> */}
                        <div className="bg-[#2a2a2a] p-6 rounded-xl relative overflow-hidden">
                            <p className="font-label text-label-md tracking-[0.05em] uppercase text-[#d4c5ab] mb-2">Completed (30d)</p>
                            <div className="flex items-end gap-3">
                                <span className="text-display-md font-black tracking-tight text-on-[#131313]">142</span>
                                <span className="text-[#005d6d] text-sm font-bold mb-2">99.2% S.R.</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-8">
                        {/* <!-- Active Shipments List --> */}
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-headline-md font-extrabold text-on-[#131313] tracking-tight uppercase">Active Shipments</h2>
                                <div className="flex gap-2">
                                    <button className="bg-[#2a2a2a] px-4 py-2 rounded-xl text-label-md font-bold uppercase tracking-wider text-[#d4c5ab] hover:text-[#ffbf00] transition-all">Filter</button>
                                    <button className="bg-[#ffbf00] px-4 py-2 rounded-xl text-label-md font-bold uppercase tracking-wider text-[#404d00] hover:shadow-[0_0_12px_rgba(255,191,0,0.3)] transition-all">Export CSV</button>
                                </div>
                            </div>
                            {/* <!-- Shipment Card 1 --> */}
                            <div className="bg-[#1b1b1b] p-6 rounded-xl hover:bg-[#131313]-container/50 transition-all border-l-4 border-[#ffbf00]">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-label-sm font-bold text-[#ffbf00] bg-[#ffbf00]/10 px-2 py-1 rounded uppercase tracking-widest">Priority</span>
                                        <h3 className="text-xl font-black text-on-[#131313] mt-2">#TRX-2024-001</h3>
                                        <p className="text-[#d4c5ab] text-sm flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            Port of Hamburg, DE → Chicago, US (ORD)
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-label-sm uppercase tracking-tighter text-[#d4c5ab]">Est. Arrival</p>
                                        <p className="text-lg font-bold text-on-[#131313]">OCT 24, 2024</p>
                                        <span className="text-xs font-bold text-[#005d6d] flex items-center justify-end gap-1">
                                            <span className="w-1.5 h-1.5 bg-[#b4efff]-container rounded-full animate-pulse"></span>
                                            In Transit - On Time
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[#d4c5ab]">
                                        <span>Origin</span>
                                        <span>Midway (Customs)</span>
                                        <span>Destination</span>
                                    </div>
                                    <div className="relative h-2 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full w-[65%] bg-gradient-to-r from-primary to-[#ffbf00] rounded-full shadow-[0_0_8px_rgba(255,191,0,0.5)]"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full border-2 border-[#131313] bg-[#2a2a2a] flex items-center justify-center text-[10px] font-bold">JB</div>
                                        <div className="w-8 h-8 rounded-full border-2 border-[#131313] bg-[#2a2a2a] flex items-center justify-center text-[10px] font-bold">MK</div>
                                    </div>
                                    <button className="group flex items-center gap-2 bg-[#2a2a2a] py-2 px-6 rounded-xl text-on-[#131313] font-bold uppercase tracking-widest text-xs hover:bg-[#ffbf00] hover:text-[#404d00] transition-all">
                                        Track Shipment
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                            {/* <!-- Shipment Card 2 --> */}
                            <div className="bg-[#1b1b1b] p-6 rounded-xl hover:bg-[#131313]-container/50 transition-all border-l-4 border-[#504532]/30">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-label-sm font-bold text-[#d4c5ab] bg-[#2a2a2a] px-2 py-1 rounded uppercase tracking-widest">Standard</span>
                                        <h3 className="text-xl font-black text-on-[#131313] mt-2">#TRX-2024-042</h3>
                                        <p className="text-[#d4c5ab] text-sm flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            Shenzhen, CN → Long Beach, US
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-label-sm uppercase tracking-tighter text-[#d4c5ab]">Est. Arrival</p>
                                        <p className="text-lg font-bold text-on-[#131313]">NOV 02, 2024</p>
                                        <span className="text-xs font-bold text-[#d4c5ab] flex items-center justify-end gap-1">
                                            <span className="w-1.5 h-1.5 bg-[#9c8f78] rounded-full"></span>
                                            Pending Pickup
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[#d4c5ab]">
                                        <span>Origin</span>
                                        <span>Destination</span>
                                    </div>
                                    <div className="relative h-2 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full w-[5%] bg-[#9c8f78] rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full border-2 border-[#131313] bg-[#2a2a2a] flex items-center justify-center text-[10px] font-bold">LC</div>
                                    </div>
                                    <button className="group flex items-center gap-2 bg-[#2a2a2a] py-2 px-6 rounded-xl text-on-[#131313] font-bold uppercase tracking-widest text-xs hover:bg-[#ffbf00] hover:text-[#404d00] transition-all">
                                        View Logs
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                            {/* <!-- Shipment Card 3 --> */}
                            <div className="bg-[#1b1b1b] p-6 rounded-xl hover:bg-[#131313]-container/50 transition-all border-l-4 border-[#ffb4ab]">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-label-sm font-bold text-[#ffb4ab] bg-[#93000a]/20 px-2 py-1 rounded uppercase tracking-widest">Urgent</span>
                                        <h3 className="text-xl font-black text-on-[#131313] mt-2">#TRX-2024-009</h3>
                                        <p className="text-[#d4c5ab] text-sm flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            Tokyo, JP → London, UK (LHR)
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-label-sm uppercase tracking-tighter text-[#d4c5ab] text-[#ffb4ab]">Delayed</p>
                                        <p className="text-lg font-bold text-[#ffb4ab]">OCT 28, 2024</p>
                                        <span className="text-xs font-bold text-[#ffb4ab] flex items-center justify-end gap-1">
                                            <span className="material-symbols-outlined text-xs">warning</span>
                                            Customs Hold
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="relative h-2 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full w-[88%] bg-[#ffb4ab] rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-[#ffb4ab] text-[10px] font-black uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        Immediate action required
                                    </div>
                                    <button className="group flex items-center gap-2 bg-[#93000a]/20 py-2 px-6 rounded-xl text-[#ffb4ab] font-bold uppercase tracking-widest text-xs hover:bg-[#ffb4ab] hover:text-[#690005] transition-all">
                                        Resolve
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">report</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* <!-- Sidebar Widgets --> */}
                        <aside className="w-80 space-y-6">
                            {/* <!-- Notifications Widget --> */}
                            <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-label-md font-black uppercase tracking-[0.1em] text-on-[#131313]">Recent Signals</h3>
                                    <span className="w-2 h-2 bg-[#ffbf00] rounded-full shadow-[0_0_8px_#ffbf00]"></span>
                                </div>
                                <div className="space-y-6">
                                    {/* <!-- Notification Item 1 --> */}
                                    <div className="flex gap-4">
                                        <div className="mt-1 w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-[#ffbf00] text-sm">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-on-[#131313]">Delivered: #TRX-2023-998</p>
                                            <p className="text-xs text-[#d4c5ab] mt-1 leading-relaxed">Successful drop-off at Chicago Hub (ORD). Proof of delivery signed by S. Miller.</p>
                                            <p className="text-[10px] font-bold text-[#9c8f78] uppercase mt-2 tracking-widest">12m ago</p>
                                        </div>
                                    </div>
                                    {/* <!-- Notification Item 2 --> */}
                                    <div className="flex gap-4">
                                        <div className="mt-1 w-8 h-8 rounded-lg bg-[#93000a]/20 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-[#ffb4ab] text-sm">schedule_send</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#ffb4ab]">Delay Alert: #TRX-2024-009</p>
                                            <p className="text-xs text-[#d4c5ab] mt-1 leading-relaxed">Customs inspection in London LHR is taking longer than anticipated. ETA updated.</p>
                                            <p className="text-[10px] font-bold text-[#9c8f78] uppercase mt-2 tracking-widest">1h ago</p>
                                        </div>
                                    </div>
                                    {/* <!-- Notification Item 3 --> */}
                                    <div className="flex gap-4">
                                        <div className="mt-1 w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-[#b4efff] text-sm">dock</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-on-[#131313]">Arrived at Port</p>
                                            <p className="text-xs text-[#d4c5ab] mt-1 leading-relaxed">Vessel 'Ever Kinetic' has docked at Port of Hamburg. Unloading sequence initiated.</p>
                                            <p className="text-[10px] font-bold text-[#9c8f78] uppercase mt-2 tracking-widest">3h ago</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full mt-8 py-3 rounded-xl border border-[#504532]/30 text-xs font-bold uppercase tracking-widest text-[#d4c5ab] hover:bg-[#2a2a2a] transition-all">
                                    Clear All Notifications
                                </button>
                            </div>
                            {/* <!-- Active Map Preview Widget --> */}
                            <div className="bg-[#2a2a2a] rounded-xl overflow-hidden relative group">
                                <div className="p-6 pb-0">
                                    <h3 className="text-label-md font-black uppercase tracking-[0.1em] text-on-[#131313] mb-1">Global Network</h3>
                                    <p className="text-[10px] font-bold text-[#d4c5ab] uppercase tracking-widest mb-4">42 Vessels Currently Active</p>
                                </div>
                                <div className="h-48 w-full bg-[#131313] relative grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                    <img alt="Logistics Map Interface" className="w-full h-full object-cover" data-alt="A high-tech digital world map visualization for logistics tracking. The map is displayed in deep obsidian and midnight blue tones with glowing amber light paths representing active shipment routes across the oceans. The interface is clean and futuristic, appearing like a professional command center display with sharp typography and kinetic data points." data-location="Global" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4-elrwjzyr9andl0zimExswFpI0_zQ0MTQWP5nVGX5QO6k1K-Fz3OgkqWigYse-Ts3DZtmeuSrKMvgLwuLOGh-KmprXCCZ0XKMOsv-xopUEZCnmtNO4xA5vcW2Fo-_fU2-hcSpKxQWkAB2Wd0yKmLhKPJEMBSTmFxYdPVCXGIFliw7r9iIC51KEjoDOj_O6V_2bMDWGTiNyl5XOLtEkbMXwN_kKSsX1FGbFO2_h-29ns38a_G6J8im6HAZaXaXz2w8i04RaoWNW0_" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2a2a2a] to-transparent"></div>
                                    {/* <!-- Floating Data Tooltip --> */}
                                    <div className="absolute bottom-4 left-4 right-4 p-3 glass-panel rounded-lg border border-[#504532]/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-[#ffbf00] rounded-full"></span>
                                                <span className="text-[10px] font-bold text-on-[#131313] uppercase tracking-wider">Pacific Route A-4</span>
                                            </div>
                                            <span className="text-[10px] font-black text-[#ffbf00]">OPTIMAL</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}