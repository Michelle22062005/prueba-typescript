'use client';
import { useEffect, useState } from 'react';
import ShipmentModal from '@/components/shipments/shipmentsModal';
import { AsideCompany } from '@/components/asides/AsideCompany';
import { HeaderCompany } from '../Header/HeaderCompany';
import { useRouter } from 'next/navigation';

/**
 * Company renders the company-facing shipment dashboard.
 * It loads shipments for the authenticated company account, opens the shipment
 * creation modal, and provides a logout action for the current session.
 */
type ShipmentStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

// Shipment describes the compact shipment shape used by the company dashboard.
type Shipment = {
    id: number;
    cargoType: string;
    weight: number;
    origin: string;
    destination: string;
    timeline: string;
    status: ShipmentStatus;
    driver: { id: number; name: string; email: string } | null;
    proposedPrice: number;
    createdAt: string;
};

// Formats API date strings into short, readable dates for dashboard cards.
function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// StatusBadge centralizes the visual treatment for each shipment state.
function StatusBadge({ status }: { status: ShipmentStatus }) {
    const styles: Record<ShipmentStatus, string> = {
        PENDING: 'text-amber-400',
        ASSIGNED: 'text-blue-400',
        IN_TRANSIT: 'text-[#ffbf00]',
        DELIVERED: 'text-green-400',
        CANCELLED: 'text-red-400',
    };
    return (
        <span className={`text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

export default function Company() {
    // Router is used after logout to return the user to the login page.
    const router = useRouter();

    // State values drive the shipment list, loading indicator, and create modal.
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
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

    // Loads shipments using the access token stored by the login flow.
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

    // Load the company shipment list once the component mounts.
    useEffect(() => {
        fetchShipments();
    }, []);

    const activeShipments = shipments.filter(s => ['PENDING', 'ASSIGNED', 'IN_TRANSIT'].includes(s.status));
    const inTransit = shipments.filter(s => s.status === 'IN_TRANSIT');
    const totalPrice = shipments.reduce((total, shipment) => total + (Number(shipment.proposedPrice) || 0), 0);

    return (
        <div className="overflow-x-hidden" style={{ backgroundColor: '#131313', color: '#e2e2e2', fontFamily: "'Inter', sans-serif" }}>

            {/* Side Navigation */}
            <aside className="h-screen w-72 fixed left-0 top-0 border-r border-[#504532]/15 bg-[#1b1b1b] flex flex-col py-8 z-50 shadow-[0_0_20px_rgba(255,191,0,0.05)]">
                <div className="px-8 mb-10">
                    <h1 className="text-3xl font-black italic text-[#ffbf00] tracking-tighter">TRUX</h1>
                    <p className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase opacity-50 mt-1">Precision Logistics</p>
                </div>
                <nav className="flex-1 space-y-1">
                    <a className="bg-[#353535] text-[#ffbf00] border-r-4 border-[#ffbf00] flex items-center gap-4 px-8 py-4 transition-all" href="#">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="font-['Inter'] text-sm tracking-[0.05em] uppercase font-bold">Dashboard</span>
                    </a>

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
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-72 min-h-screen flex flex-col bg-[#131313]">
                <HeaderCompany />

                {/* Content Canvas */}
                <div className="p-8 lg:p-12 space-y-12 flex-1">
                    {/* Welcome Section */}
                    <section className="flex flex-col md:flex-row justify-between items-end gap-8">
                        <div>
                            <h2 className="text-4xl font-black text-on-surface tracking-tight mb-2">Welcome Company</h2>
                            <p className="text-on-surface-variant font-medium tracking-wide uppercase text-xs opacity-80">Logistics Command Center • Real-time Operations</p>
                        </div>
                        <div className="flex gap-10 border-l border-outline-variant/20 pl-10">
                            <div>
                                <p className="font-['Inter'] text-[10px] tracking-[0.1em] uppercase text-outline mb-1">Active Shipments</p>
                                <p className="text-3xl font-black text-[#ffbf00] tracking-tighter">
                                    {loading ? '...' : activeShipments.length}
                                </p>
                            </div>
                            <div>
                                <p className="font-['Inter'] text-[10px] tracking-[0.1em] uppercase text-outline mb-1">In Transit</p>
                                <p className="text-3xl font-black text-on-surface tracking-tighter">
                                    {loading ? '...' : inTransit.length}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Dashboard Main Grid */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Column: Quick Actions & Telemetry */}
                        <div className="lg:col-span-8 space-y-12">

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div
                                    onClick={() => setIsModalOpen(true)}
                                    className="group bg-[#ffbf00] p-8 rounded-2xl relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform shadow-[0_20px_40px_rgba(255,191,0,0.1)]"
                                >
                                    <div className="relative z-10">
                                        <span className="material-symbols-outlined text-black text-4xl mb-4 block">local_shipping</span>
                                        <h3 className="text-2xl font-black text-black tracking-tighter leading-tight">
                                            START NEW LOAD<br />REQUEST
                                        </h3>
                                        <p className="text-black/70 mt-2 font-medium text-sm">Calculate rates and book instant logistics capacity.</p>
                                    </div>
                                    <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[180px] text-black opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                        rocket_launch
                                    </span>
                                </div>

                                <div className="group bg-[#1b1b1b] p-8 rounded-2xl cursor-pointer hover:bg-surface-container-highest transition-all active:scale-[0.98] border border-outline-variant/5">
                                    <span className="material-symbols-outlined text-[#ffbf00] text-4xl mb-4 block">support_agent</span>
                                    <h3 className="text-2xl font-black text-on-surface tracking-tighter leading-tight">
                                        CONTACT<br />PRIORITY SUPPORT
                                    </h3>
                                    <p className="text-on-surface-variant mt-2 font-medium text-sm">Connect with your dedicated account manager.</p>
                                </div>
                            </div>

                            {/* Active Telemetry - Simplified for Grid */}
                            {inTransit.length > 0 && (
                                <div className="space-y-6">
                                    <h4 className="font-['Inter'] text-[11px] tracking-[0.2em] uppercase font-bold text-outline">Active Telemetry</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {inTransit.slice(0, 2).map((shipment) => (
                                            <div key={shipment.id} className="bg-[#1b1b1b] rounded-xl p-6 border border-outline-variant/5 hover:border-[#ffbf00]/20 transition-all">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <span className="bg-[#ffbf00]/10 text-[#ffbf00] text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter mb-2 inline-block">
                                                            In Transit
                                                        </span>
                                                        <p className="text-on-surface font-black text-lg tracking-tight">
                                                            SHP-{String(shipment.id).padStart(4, '0')}
                                                        </p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[#ffbf00] animate-pulse text-sm">sensors</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-1 h-8 bg-gradient-to-b from-[#ffbf00] to-transparent rounded-full"></div>
                                                    <div>
                                                        <p className="text-[10px] text-outline uppercase font-bold leading-none mb-1">Destination</p>
                                                        <p className="text-sm font-bold text-on-surface truncate">{shipment.destination}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                    </section>
                    {/* Featured Shipment Card - Most Recent In Transit */}
                    {inTransit.length > 0 && (
                        <div className="bg-[#1b1b1b] rounded-2xl p-8 border border-outline-variant/10 hover:shadow-[0_0_40px_rgba(255,191,0,0.05)] transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffbf00]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#ffbf00]/10 transition-colors"></div>

                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-[#ffbf00]/10 text-[#ffbf00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-[#ffbf00]/20 flex items-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#ffbf00] mr-2 animate-pulse"></span>
                                            Live Telemetry
                                        </span>
                                        <span className="text-outline/40 text-[10px] font-bold uppercase tracking-widest">Active Manifest</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-on-surface tracking-tighter italic">
                                        SHP-{String(inTransit[0].id).padStart(4, '0')}
                                    </h3>
                                </div>
                                <div className="bg-[#131313] px-6 py-4 rounded-xl border border-outline-variant/5">
                                    <p className="text-[10px] text-outline uppercase font-black tracking-widest mb-1 opacity-50">Estimated Arrival</p>
                                    <p className="text-on-surface font-black text-xl tracking-tight">Today, 18:30 <span className="text-[#ffbf00] text-xs font-bold uppercase ml-2 italic">On Time</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                                <div className="lg:col-span-7 space-y-8">
                                    <div className="flex items-start gap-6">
                                        <div className="flex flex-col items-center py-1">
                                            <div className="w-4 h-4 rounded-full border-2 border-[#ffbf00] bg-[#131313] flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#ffbf00]"></div>
                                            </div>
                                            <div className="w-0.5 h-16 bg-gradient-to-b from-[#ffbf00] to-outline/20"></div>
                                            <div className="w-4 h-4 rounded-full border-2 border-outline/30 bg-[#131313] flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[10px] text-outline/50">location_on</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-8">
                                            <div className="group/loc">
                                                <p className="text-[10px] text-outline uppercase font-black tracking-widest mb-1 group-hover/loc:text-[#ffbf00] transition-colors">Point of Origin</p>
                                                <p className="text-xl font-bold text-on-surface tracking-tight leading-tight">{inTransit[0].origin}</p>
                                                <p className="text-xs text-outline/60 mt-1 font-medium italic">Dispatch Terminal A-01</p>
                                            </div>
                                            <div className="group/loc">
                                                <p className="text-[10px] text-outline uppercase font-black tracking-widest mb-1 group-hover/loc:text-[#ffbf00] transition-colors">Target Destination</p>
                                                <p className="text-xl font-bold text-on-surface tracking-tight leading-tight">{inTransit[0].destination}</p>
                                                <p className="text-xs text-outline/60 mt-1 font-medium italic">Final Delivery Node</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
                                    <div className="bg-[#131313]/50 p-6 rounded-2xl border border-outline-variant/5">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-[10px] text-outline uppercase font-black tracking-widest mb-1">Cargo Class</p>
                                                <p className="text-sm font-bold text-on-surface italic">{inTransit[0].cargoType}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-outline uppercase font-black tracking-widest mb-1">Total Price</p>
                                                <p className="text-sm font-bold text-on-surface">${Number(inTransit[0].proposedPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    className="w-12 h-12 rounded-xl border-2 border-[#ffbf00]/30 object-cover"
                                                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100"
                                                    alt="Driver"
                                                />
                                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1b1b1b] rounded-full"></span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-outline uppercase font-black tracking-widest">Assigned Operator</p>
                                                <p className="text-sm font-black text-on-surface">{inTransit[0].driver?.name || "Assigning..."}</p>
                                            </div>
                                        </div>
                                        <button className="h-12 px-8 bg-[#ffbf00] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all active:scale-95">
                                            Track Live
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipment History Table Section */}
                    <div className="space-y-6 pt-12">
                        <div className="flex justify-between items-center">
                            <h4 className="font-['Inter'] text-[11px] tracking-[0.2em] uppercase font-bold text-outline">Shipment Registry</h4>
                            <div className="flex gap-2">
                                <span className="w-2 h-2 rounded-full bg-outline/20"></span>
                                <span className="w-2 h-2 rounded-full bg-outline/20"></span>
                                <span className="w-2 h-2 rounded-full bg-[#ffbf00]"></span>
                            </div>
                        </div>

                        <div className="bg-[#1b1b1b] rounded-2xl overflow-hidden border border-outline-variant/10 shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-[#131313] border-b border-outline-variant/10">
                                            <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] text-outline font-black">Dispatch Date</th>
                                            <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] text-outline font-black">Operational Route</th>
                                            <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] text-outline font-black">Status</th>
                                            <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] text-outline font-black">Operator</th>
                                            <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] text-outline font-black text-right">Total Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/5">
                                        {/* Loading */}
                                        {loading && (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-16 text-center text-outline/40">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <span className="material-symbols-outlined animate-spin text-3xl text-[#ffbf00]">progress_activity</span>
                                                        <p className="text-[10px] uppercase tracking-widest font-black">Synchronizing Data...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                        {/* Empty state */}
                                        {!loading && shipments.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-16 text-center text-outline/40">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <span className="material-symbols-outlined text-5xl opacity-20">inventory_2</span>
                                                        <p className="text-[10px] uppercase tracking-widest font-black">No Active Operations Found</p>
                                                        <button
                                                            onClick={() => setIsModalOpen(true)}
                                                            className="mt-4 px-8 py-3 bg-[#ffbf00] text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all"
                                                        >
                                                            Initialize New Load
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                        {/* Real rows */}
                                        {!loading && shipments.map((shipment) => (
                                            <tr key={shipment.id} className="hover:bg-[#353535]/30 transition-all cursor-pointer group">
                                                <td className="px-8 py-6 text-sm font-bold text-on-surface opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {formatDate(shipment.createdAt)}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-sm font-black text-on-surface tracking-tight group-hover:text-[#ffbf00] transition-colors">
                                                            {shipment.origin} <span className="text-outline font-normal mx-2">→</span> {shipment.destination}
                                                        </div>
                                                        <p className="text-[9px] text-outline uppercase font-black tracking-[0.1em]">{shipment.cargoType}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <StatusBadge status={shipment.status} />
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-[#131313] border border-outline-variant/10 flex items-center justify-center text-[#ffbf00] text-[10px] font-black">
                                                            {shipment.driver?.name?.charAt(0) || "?"}
                                                        </div>
                                                        <span className="text-sm font-bold text-on-surface opacity-70">{shipment.driver?.name ?? 'UNASSIGNED'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-sm font-black text-[#ffbf00]">${Number(shipment.proposedPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                    <span className="text-[9px] text-outline uppercase font-bold ml-1">USD</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            <ShipmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchShipments();
                }}
            />
        </div>
    );
}
