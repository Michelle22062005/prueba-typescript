'use client';
import { useEffect, useState } from 'react';
import ActiveTripModal from '@/components/shipments/ActiveTripModal';
import { useRouter } from 'next/navigation';

/**
 * Driver renders the driver-facing trip dashboard.
 * It loads assigned shipments, highlights the active trip, shows completed work,
 * and opens ActiveTripModal so drivers can update shipment progress.
 */
type ShipmentStatus = 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'PENDING';

// Shipment contains the driver-facing fields required for trip cards and modals.
type Shipment = {
    id: number;
    cargoType: string;
    weight: number;
    origin: string;
    destination: string;
    timeline: string;
    status: ShipmentStatus;
    customer?: { id: number; name: string; email: string } | null;
    company?: { id: number; name: string; email: string } | null;
};

type ActiveTripShipment = Shipment & {
    status: 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED';
};

export default function Driver() {
    // Router is used to redirect after ending the current session.
    const router = useRouter();

    // State tracks shipments, loading feedback, and the selected modal shipment.
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShipment, setSelectedShipment] = useState<ActiveTripShipment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Error closing session', e);
        } finally {
            localStorage.clear();
            router.push('/login');
        }
    }

    // Loads the shipments assigned to the authenticated driver.
    async function fetchShipments() {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/shipments', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setShipments(data);
        } catch {
            console.error('Error loading shipments');
        } finally {
            setLoading(false);
        }
    }

    // Fetch driver data after the dashboard mounts.
    useEffect(() => {
        fetchShipments();
    }, []);

    // Derived collections separate the active trip from delivered history.
    const activeShipment = shipments.find(s => s.status === 'ASSIGNED' || s.status === 'IN_TRANSIT') ?? null;
    const completedShipments = shipments.filter(s => s.status === 'DELIVERED');

    // Opens the status update modal for the selected shipment.
    function handleOpenTrip(shipment: Shipment) {
        if (shipment.status === 'ASSIGNED' || shipment.status === 'IN_TRANSIT' || shipment.status === 'DELIVERED') {
            setSelectedShipment(shipment as ActiveTripShipment);
            setIsModalOpen(true);
        }
    }

    return (
        <div className="overflow-hidden" style={{ backgroundColor: '#131313', color: '#e2e2e2', fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <header className="flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 bg-[#131313]">
                <div className="text-xl font-black tracking-[-0.02em] text-[#ffbf00] font-['Inter'] uppercase">
                    KINETIC LOGISTICS
                </div>
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#e2e2e2] p-2 hover:bg-[#353535] transition-colors rounded-full cursor-pointer">notifications</span>
                    <span className="material-symbols-outlined text-[#e2e2e2] p-2 hover:bg-[#353535] transition-colors rounded-full cursor-pointer">account_circle</span>
                </div>
            </header>

            <div className="flex pt-16 h-screen">

                {/* Sidebar */}
                <aside className="flex flex-col fixed left-0 top-0 h-full py-8 w-64 bg-[#1b1b1b] z-40">
                    <div className="px-6 mb-10">
                        <div className="text-[#ffbf00] font-black font-['Inter'] text-sm tracking-widest uppercase">COMMAND CENTER</div>
                        <div className="text-[#e2e2e2]/60 text-xs font-bold mt-1 uppercase">Driver Portal</div>
                    </div>
                    <nav className="flex-1 space-y-1">
                        <a className="flex items-center gap-4 px-6 py-3 text-[#e2e2e2]/60 hover:text-[#e2e2e2] hover:bg-[#353535]/50 transition-all font-bold text-sm tracking-widest uppercase" href="#">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span>Dashboard</span>
                        </a>
                        <a className="flex items-center gap-4 px-6 py-3 bg-[#353535] text-[#ffbf00] rounded-r-xl border-l-4 border-[#ffbf00] font-bold text-sm tracking-widest uppercase" href="#">
                            <span className="material-symbols-outlined">local_shipping</span>
                            <span>Assignments</span>
                        </a>
                        <a className="flex items-center gap-4 px-6 py-3 text-[#e2e2e2]/60 hover:text-[#e2e2e2] hover:bg-[#353535]/50 transition-all font-bold text-sm tracking-widest uppercase" href="#">
                            <span className="material-symbols-outlined">history</span>
                            <span>History</span>
                        </a>
                    </nav>
                    <div className='px-8 py-2 space-y-2'>
                        <button onClick={handleLogout} className="w-full bg-red-500 text-white py-3 rounded-xl font-bold uppercase tracking-[0.05em] text-[10px] hover:bg-red-600 transition-all">
                            Log Out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="ml-64 flex-1 overflow-y-auto p-8 bg-[#131313]">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Hero: Active Shipment */}
                        {loading ? (
                            <div className="h-[480px] rounded-2xl bg-[#1b1b1b] flex items-center justify-center">
                                <span className="material-symbols-outlined animate-spin text-[#ffbf00] text-4xl">progress_activity</span>
                            </div>
                        ) : activeShipment ? (
                            <section className="relative h-[480px] rounded-2xl overflow-hidden shadow-2xl group">
                                <div className="absolute inset-0 z-0">
                                    <img className="w-full h-full object-cover grayscale brightness-[0.3] contrast-125" data-alt="Dark stylized satellite map of the California and Nevada desert with a glowing amber line connecting Oakland to Las Vegas" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhvKqdYXgjBh6Iw-JR2xaibWs7DfKNMgSs5RhIKYL6OVzpdo77Jn4uZ1Gps6M-TFWJLSHRGS50zQALzjIRc5nSr7b3yFYdS3szr3hZc9ldUrt9VKQXItBcuAxsiHXJnOLLkU4drQ_xShQLp31Mw12s3stk9Anitz0LDLam0DAFXnp9SOL7yoXisfGylG9ItGHRB89vAXI5h-BaUyZQESGvCAV6eJOhpQG8C-luS_-oI5_6R1Ddsb_97iaCTfTQ2AGcd9x-8cSMLa8R" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent"></div>
                                </div>

                                {/* SVG Route */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <svg className="w-full h-full p-20" viewBox="0 0 800 400">
                                        <path
                                            d="M100 300 Q 400 100, 700 300"
                                            fill="transparent"
                                            stroke="#ffbf00"
                                            strokeDasharray="10 5"
                                            strokeWidth="4"
                                            className="opacity-80"
                                        />
                                        <circle cx="100" cy="300" r="8" fill="#ffbf00" style={{ filter: 'drop-shadow(0 0 12px rgba(255,191,0,0.3))' }} />
                                        <circle cx="700" cy="300" r="8" fill="#ffbf00" style={{ filter: 'drop-shadow(0 0 12px rgba(255,191,0,0.3))' }} />
                                    </svg>
                                </div>

                                <div className="absolute bottom-0 left-0 p-10 w-full flex justify-between items-end">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4 text-4xl font-black tracking-tight text-[#ffbf00] uppercase">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] tracking-[0.2em] font-bold text-[#ffbf00]/80 mb-1">ORIGIN</span>
                                                <span>{activeShipment.origin}</span>
                                            </div>
                                            <span className="material-symbols-outlined text-3xl mt-4">arrow_forward</span>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] tracking-[0.2em] font-bold text-[#ffbf00]/80 mb-1">DESTINATION</span>
                                                <span>{activeShipment.destination}</span>
                                            </div>
                                        </div>
                                        <p className="text-on-surface-variant font-bold tracking-widest text-sm uppercase">
                                            SHP-{String(activeShipment.id).padStart(4, '0')} • {activeShipment.cargoType} • {activeShipment.company?.name || activeShipment.customer?.name}
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="p-6 rounded-xl border border-outline-variant/10 min-w-[160px]" style={{ background: 'rgba(53,53,53,0.6)', backdropFilter: 'blur(20px)' }}>
                                            <div className="text-[#e2e2e2]/60 text-xs font-bold tracking-widest uppercase mb-1">Weight</div>
                                            <div className="text-3xl font-black text-[#ffbf00] tracking-tighter">{activeShipment.weight} <span className="text-sm">TONS</span></div>
                                        </div>
                                        <div className="p-6 rounded-xl border border-outline-variant/10 min-w-[160px]" style={{ background: 'rgba(53,53,53,0.6)', backdropFilter: 'blur(20px)' }}>
                                            <div className="text-[#e2e2e2]/60 text-xs font-bold tracking-widest uppercase mb-1">Status</div>
                                            <div className="text-2xl font-black text-[#ffbf00] tracking-tighter">{activeShipment.status.replace('_', ' ')}</div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ) : (
                            <div className="h-[480px] rounded-2xl bg-[#1b1b1b] flex flex-col items-center justify-center gap-4">
                                <span className="material-symbols-outlined text-[#ffbf00]/40 text-6xl">local_shipping</span>
                                <p className="text-[#e2e2e2]/40 font-bold uppercase tracking-widest text-sm">No active assignments</p>
                            </div>
                        )}

                        {/* Bento Grid */}
                        {activeShipment && (
                            <div className="grid grid-cols-12 gap-6">

                                {/* Manifest Summary */}
                                <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8 rounded-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-black tracking-widest text-[#ffbf00] uppercase">Shipment Details</h2>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${activeShipment.status === 'IN_TRANSIT' ? 'bg-green-500/20 text-green-400' : 'bg-[#ffbf00]/20 text-[#ffbf00]'}`}>
                                            {activeShipment.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-[#131313] rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <span className="material-symbols-outlined text-[#ffbf00]">inventory_2</span>
                                                <span className="font-bold text-[#e2e2e2]">{activeShipment.cargoType}</span>
                                            </div>
                                            <span className="font-mono text-[#e2e2e2]/60">{activeShipment.weight} Tons</span>
                                        </div>
                                        {activeShipment.customer && (
                                            <div className="flex justify-between items-center p-4 bg-[#131313] rounded-xl border border-outline-variant/5">
                                                <div className="flex items-center gap-4">
                                                    <span className="material-symbols-outlined text-[#ffbf00]">person</span>
                                                    <span className="font-bold text-[#e2e2e2]">Customer</span>
                                                </div>
                                                <span className="font-mono text-[#e2e2e2]/60">{activeShipment.customer.name}</span>
                                            </div>
                                        )}
                                        {activeShipment.company && (
                                            <div className="flex justify-between items-center p-4 bg-[#131313] rounded-xl border border-outline-variant/5">
                                                <div className="flex items-center gap-4">
                                                    <span className="material-symbols-outlined text-[#ffbf00]">business</span>
                                                    <span className="font-bold text-[#e2e2e2]">Company</span>
                                                </div>
                                                <span className="font-mono text-[#e2e2e2]/60">{activeShipment.company.name}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center p-4 bg-[#131313] rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <span className="material-symbols-outlined text-[#ffbf00]">schedule</span>
                                                <span className="font-bold text-[#e2e2e2]">Timeline</span>
                                            </div>
                                            <span className="font-mono text-[#e2e2e2]/60">{activeShipment.timeline}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-12 lg:col-span-4 space-y-6">
                                    <div className="bg-surface-container-highest p-8 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <div className="text-[#e2e2e2]/60 text-xs font-bold tracking-widest uppercase mb-4">Load Classification</div>
                                            <div className="text-2xl font-black text-[#e2e2e2] mb-1 uppercase">{activeShipment.cargoType}</div>
                                            <div className="text-4xl font-black text-[#ffbf00] tracking-tighter">{activeShipment.weight} <span className="text-lg">TONS</span></div>
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-outline-variant/10">
                                            <button
                                                onClick={() => handleOpenTrip(activeShipment)}
                                                className="w-full bg-[#ffbf00] text-black py-5 rounded-xl font-black text-lg tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
                                                style={{ filter: 'drop-shadow(0 0 12px rgba(255,191,0,0.3))' }}
                                            >
                                                <span className="material-symbols-outlined">play_arrow</span>
                                                {activeShipment.status === 'ASSIGNED' ? 'START TRIP' : 'UPDATE TRIP'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completed Shipments */}
                        {completedShipments.length > 0 && (
                            <div className="bg-surface-container-low p-8 rounded-2xl">
                                <h2 className="text-lg font-black tracking-widest text-[#ffbf00] uppercase mb-6">Completed Deliveries</h2>
                                <div className="space-y-3">
                                    {completedShipments.map((shipment) => (
                                        <div key={shipment.id} className="flex justify-between items-center p-4 bg-[#131313] rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <span className="material-symbols-outlined text-green-400">check_circle</span>
                                                <div>
                                                    <p className="font-bold text-[#e2e2e2] text-sm">SHP-{String(shipment.id).padStart(4, '0')}</p>
                                                    <p className="text-[#e2e2e2]/40 text-xs">{shipment.origin} → {shipment.destination}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Delivered</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer Telemetry */}
                        <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                            <div className="bg-surface-container-low px-6 py-4 rounded-xl flex items-center gap-4">
                                <span className="material-symbols-outlined text-[#ffbf00]">tire_repair</span>
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest text-[#e2e2e2]/60 uppercase">Vehicle Health</div>
                                    <div className="text-sm font-black uppercase">Optimal Status</div>
                                </div>
                            </div>
                            <div className="bg-surface-container-low px-6 py-4 rounded-xl flex items-center gap-4">
                                <span className="material-symbols-outlined text-[#ffbf00]">gas_meter</span>
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest text-[#e2e2e2]/60 uppercase">Fuel Level</div>
                                    <div className="text-sm font-black uppercase">94% Capacity</div>
                                </div>
                            </div>
                            <div className="bg-surface-container-low px-6 py-4 rounded-xl flex items-center gap-4">
                                <span className="material-symbols-outlined text-[#ffbf00]">cloud</span>
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest text-[#e2e2e2]/60 uppercase">Route Weather</div>
                                    <div className="text-sm font-black uppercase">Clear • 72°F</div>
                                </div>
                            </div>
                        </footer>

                    </div>
                </main>
            </div>

            {/* Active Trip Modal */}
            <ActiveTripModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedShipment(null);
                }}
                onSuccess={() => {
                    setIsModalOpen(false);
                    setSelectedShipment(null);
                    fetchShipments();
                }}
                shipment={selectedShipment}
            />
        </div>
    );
}
