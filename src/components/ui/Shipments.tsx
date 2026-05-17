'use client';
import { useEffect, useState } from 'react';
import { Aside } from '@/components/asides/Aside';
import { User } from '@/types/user';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header/Header';
import Swal from 'sweetalert2';
import { Shipment, ShipmentStatus } from '@/types/shipment';

/**
 * DriverCommandCenter is the operations workspace for shipment assignment.
 * It loads shipments and users together, filters shipments by status,
 * lets admins assign drivers or reject shipments, and shares navigation state.
 */
type Driver = {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
};

// Builds initials for driver avatars and compact identity chips.
function getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function DriverCommandCenter() {
    // Router handles navigation after logout.
    const router = useRouter();

    // State tracks the shipment list, available drivers, selection, and filters.
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [assigning, setAssigning] = useState(false);
    const [warning, setWarning] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('ADMIN');
    const [userRole, setUserRole] = useState<string>('DRIVER');
    const [users, setUsers] = useState<User[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Status filters define the tabs and counters shown above the shipment list.
    const ALL_STATUSES = [
        { key: 'ALL', label: 'All' },
        { key: 'PENDING_SUPERADMIN_REVIEW', label: 'Review' },
        { key: 'PENDING_FOR_PAY', label: 'Payment' },
        { key: 'AVAILABLE_FOR_ASSIGNMENT', label: 'Available' },
        { key: 'ASSIGNED', label: 'Assigned' },
        { key: 'IN_TRANSIT', label: 'In Transit' },
        { key: 'DELIVERED', label: 'Delivered' },
        { key: 'REJECTED', label: 'Rejected' },
    ];

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

    // Loads shipments and users in parallel so driver assignment has both datasets.
    async function fetchData() {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const storedUser = JSON.parse(localStorage.getItem('logged-in-user') || '{}');

            const headers = { 'Authorization': `Bearer ${token}`, 'x-user-id': storedUser.id?.toString() || '', 'x-user-role': storedUser.role || '' };

            const [shipmentsRes, usersRes] = await Promise.all([
                fetch('/api/shipments', { headers }),
                fetch('/api/users', { headers }),
            ]);

            const shipmentsData = await shipmentsRes.json();
            const usersData = await usersRes.json();

            if (Array.isArray(shipmentsData)) {
                if (storedUser.role === 'ADMIN') {
                    // Admins see every shipment so they can manage and assign work.
                    setShipments(shipmentsData);
                } else if (storedUser.role === 'COMPANY') {
                    // Companies keep visibility over all their shipments in every status.
                    setShipments(shipmentsData);
                } else {
                    // Other roles only see shipments that are available for assignment.
                    setShipments(shipmentsData.filter((s: Shipment) => s.status === 'AVAILABLE_FOR_ASSIGNMENT'));
                }
            } else {
                setShipments([]);
            }

            if (Array.isArray(usersData)) {
                setDrivers(usersData.filter((u: Driver) => u.role === 'DRIVER' && u.isActive));
                setUsers(usersData);
            }
        } catch {
            console.error('Error loading data');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        const storedUser = localStorage.getItem('logged-in-user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.name) setUserName(parsedUser.name);
                if (parsedUser.role) setUserRole(parsedUser.role);
            } catch (e) {
                console.error("Error parsing stored user", e);
            }
        }
    }, []);


    async function handleAssign(driverId: number) {
        if (!selectedShipment) {
            setWarning('Select a shipment first before assigning a driver');
            setTimeout(() => setWarning(null), 3000);
            return;
        }

        setAssigning(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('logged-in-user') || '{}');
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/shipments/${selectedShipment.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, 'x-user-id': storedUser.id?.toString() || '', 'x-user-role': storedUser.role || ''
                },
                body: JSON.stringify({ driverId }),
            });

            if (!res.ok) throw new Error();

            setSelectedShipment(null);
            fetchData();
        } catch {
            console.error('Error assigning driver');
        } finally {
            setAssigning(false);
        }
    }

    async function handleReject() {
        if (!selectedShipment) {
            setWarning('Select a shipment first before rejecting');
            setTimeout(() => setWarning(null), 3000);
            return;
        }

        const { value: reason } = await Swal.fire({
            title: 'Reject Shipment',
            input: 'textarea',
            inputLabel: 'Reason for rejection',
            inputPlaceholder: 'Type your reason here...',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Reject Shipment'
        });

        if (reason) {
            setAssigning(true);
            try {
                const storedUser = JSON.parse(localStorage.getItem('logged-in-user') || '{}');
                const token = localStorage.getItem('accessToken');
                const res = await fetch(`/api/shipments/${selectedShipment.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, 'x-user-id': storedUser.id?.toString() || '', 'x-user-role': storedUser.role || ''
                    },
                    body: JSON.stringify({ rejectionReason: reason }),
                });

                if (!res.ok) throw new Error();

                setSelectedShipment(null);
                fetchData();
                Swal.fire('Rejected', 'Shipment has been rejected', 'info');
            } catch {
                console.error('Error rejecting shipment');
                Swal.fire('Error', 'Could not reject shipment', 'error');
            } finally {
                setAssigning(false);
            }
        }
    }

    const filteredShipments = shipments.filter(s => {
        if (statusFilter === 'ALL') return true;
        return s.status === statusFilter;
    });

    return (
        <div className="flex min-h-screen overflow-hidden" style={{ backgroundColor: '#131313', color: '#e2e2e2', fontFamily: "'Inter', sans-serif" }}>

            <Aside
                userName={userName}
                users={users}
                handleLogout={() => { handleLogout(); }}
            />

            {/* Main */}
            <main className="md:ml-64 flex-1 flex flex-col min-w-0 bg-[#131313] relative overflow-hidden">

                <Header />

                {/* Warning */}
                {warning && (
                    <div className="mx-6 mt-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-lg px-4 py-3">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        {warning}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 overflow-hidden">
                    {/* Left: Unassigned Shipments */}
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-on-background tracking-tighter uppercase italic">
                                    {userRole === 'ADMIN' ? 'Global Shipment Fleet' : 'Unassigned Shipments'}
                                </h2>
                                <p className="text-[#e2e2e2]/40 text-xs tracking-[0.2em] font-semibold uppercase mt-1">
                                    {loading ? '...' : `${shipments.length} Active Shipments`}
                                </p>
                            </div>
                            <span className="bg-[#ffbf00]/10 text-[#ffbf00] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ffbf00] mr-2 animate-pulse"></span>
                                Live Ops
                            </span>
                        </div>

                        {/* Status Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {ALL_STATUSES.map((status) => (
                                <button
                                    key={status.key}
                                    onClick={() => setStatusFilter(status.key)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${statusFilter === status.key
                                        ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(255,191,0,0.3)]'
                                        : 'bg-[#1b1b1b] text-zinc-500 border-zinc-800 hover:border-zinc-600'
                                        }`}
                                >
                                    {status.label}
                                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[8px] ${statusFilter === status.key ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                                        }`}>
                                        {status.key === 'ALL'
                                            ? shipments.length
                                            : shipments.filter(s => s.status === status.key).length}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Shipments Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-y-auto pb-24 md:pb-6" style={{ scrollbarWidth: 'none' }}>

                            {/* Loading */}
                            {loading && (
                                <div className="xl:col-span-2 flex flex-col items-center justify-center py-20 text-[#e2e2e2]/20">
                                    <span className="material-symbols-outlined animate-spin text-4xl mb-4">progress_activity</span>
                                    <p className="text-xs uppercase tracking-[0.3em] font-black">Syncing Fleet...</p>
                                </div>
                            )}

                            {/* Empty state */}
                            {!loading && filteredShipments.length === 0 && (
                                <div className="xl:col-span-2 flex flex-col items-center justify-center py-12 text-[#e2e2e2]/40">
                                    <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                                    <p className="text-xs uppercase tracking-widest font-bold">No shipments found for this status</p>
                                </div>
                            )}

                            {/* Shipment Cards */}
                            {!loading && filteredShipments.map((shipment) => (
                                <div
                                    key={shipment.id}
                                    onClick={() => setSelectedShipment(
                                        selectedShipment?.id === shipment.id ? null : shipment
                                    )}
                                    className={`group bg-[#1b1b1b] rounded-xl p-6 border transition-all duration-300 relative overflow-hidden cursor-pointer ${selectedShipment?.id === shipment.id
                                        ? 'border-[#ffbf00] shadow-[0_0_20px_rgba(255,191,0,0.15)]'
                                        : 'border-transparent hover:border-[#ffbf00]/20'
                                        }`}
                                >
                                    {selectedShipment?.id === shipment.id && (
                                        <div className="absolute top-3 right-3 w-5 h-5 bg-[#ffbf00] rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-black text-[14px]">check</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col h-full gap-4 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#353535] flex items-center justify-center">
                                                <span className={`material-symbols-outlined ${shipment.timeline === 'URGENT' ? 'text-[#ffbf00]' : 'text-[#e2e2e2]/60'}`}>
                                                    {shipment.timeline === 'URGENT' ? 'local_fire_department' : 'inventory'}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-[#e2e2e2] font-bold tracking-tight">
                                                    SHP-{String(shipment.id).padStart(4, '0')}
                                                </h3>
                                                <p className={`text-[10px] font-black tracking-widest uppercase ${shipment.timeline === 'URGENT' ? 'text-[#ffbf00]' : 'text-[#e2e2e2]/40'}`}>
                                                    {shipment.timeline === 'URGENT' ? 'URGENT: 24H WINDOW' : 'STANDARD EXPEDITE'}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${shipment.status === 'DELIVERED' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                                                        shipment.status === 'IN_TRANSIT' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                                                            shipment.status === 'AVAILABLE_FOR_ASSIGNMENT' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
                                                                shipment.status === 'REJECTED' || shipment.status === 'CANCELLED' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                                                                    shipment.status === 'PENDING_FOR_PAY' ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' :
                                                                        'border-zinc-500/50 text-zinc-400 bg-zinc-500/10'
                                                        }`}>
                                                        {shipment.status.replace(/_/g, ' ')}
                                                    </span>
                                                    {shipment.paymentStatus === 'PAID' && (
                                                        <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                                                            PAID
                                                        </span>
                                                    )}
                                                    {shipment.rejectionReason && (
                                                        <div className="w-full mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-400 italic">
                                                            Reason: {shipment.rejectionReason}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <label className="text-[#e2e2e2]/30 text-[9px] font-bold tracking-widest uppercase">Origin</label>
                                                <p className="text-on-background font-semibold text-sm">{shipment.origin}</p>
                                            </div>
                                            <div>
                                                <label className="text-[#e2e2e2]/30 text-[9px] font-bold tracking-widest uppercase">Destination</label>
                                                <p className="text-on-background font-semibold text-sm">{shipment.destination}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                                            <div className="flex gap-4">
                                                <div>
                                                    <label className="text-[#e2e2e2]/30 text-[9px] font-bold tracking-widest uppercase block">Cargo</label>
                                                    <span className="text-on-background text-xs font-medium italic">{shipment.cargoType}</span>
                                                </div>
                                                <div>
                                                    <label className="text-[#e2e2e2]/30 text-[9px] font-bold tracking-widest uppercase block">Weight</label>
                                                    <span className="text-on-background text-xs font-medium">{shipment.weight} Tons</span>
                                                </div>
                                                {shipment.dimensions && (
                                                    <div>
                                                        <label className="text-[#e2e2e2]/30 text-[9px] font-bold tracking-widest uppercase block">Dims</label>
                                                        <span className="text-on-background text-xs font-medium">{shipment.dimensions}</span>
                                                    </div>
                                                )}
                                                {shipment.proposedPrice && (
                                                    <div>
                                                        <label className="text-[#e2e2e2]/30 text-[9px] font-bold tracking-widest uppercase block">Proposed</label>
                                                        <span className="text-amber-400 text-xs font-bold">${Number(shipment.proposedPrice).toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {shipment.approvedPrice && (
                                                    <div>
                                                        <label className="text-[#e2e2e2]/30 text-[9px] font-bold tracking-widest uppercase block">Approved</label>
                                                        <span className="text-green-400 text-xs font-bold">${Number(shipment.approvedPrice).toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[#e2e2e2]/30 text-[9px] font-bold uppercase tracking-widest">Client</span>
                                                    <span className="text-[#e2e2e2] text-[10px] font-semibold">{shipment.sender.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[#e2e2e2]/30 text-[9px] font-bold uppercase tracking-widest">Driver</span>
                                                    <span className={`${shipment.driver ? 'text-[#ffbf00]' : 'text-zinc-600'} text-[10px] font-semibold`}>
                                                        {shipment.driver ? shipment.driver.name : 'UNASSIGNED'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[#e2e2e2]/30 text-[9px] font-bold uppercase tracking-widest">Date</span>
                                                    <span className="text-zinc-500 text-[10px]">{new Date(shipment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className={`h-10 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mt-2 ${selectedShipment?.id === shipment.id
                                                ? 'bg-[#ffbf00] text-black'
                                                : 'bg-[#353535] text-[#ffbf00]'
                                                }`}>
                                                {selectedShipment?.id === shipment.id ? 'Selected' : 'Select'}
                                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Active Drivers Panel */}
                    <aside className="w-full md:w-96 flex flex-col gap-6">
                        <div className="rounded-2xl p-6 h-full flex flex-col border border-outline-variant/10 shadow-2xl" style={{ background: 'rgba(53,53,53,0.6)', backdropFilter: 'blur(20px)' }}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight uppercase italic">Active Drivers</h2>
                                    <p className="text-[#e2e2e2]/40 text-[10px] font-black tracking-widest uppercase">
                                        {loading ? '...' : `${drivers.length} Available`}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#e2e2e2]/60">filter_list</span>
                                </div>
                            </div>

                            {/* Selected shipment indicator */}
                            {selectedShipment && (
                                <div className="mb-4 p-4 bg-[#ffbf00]/10 border border-[#ffbf00]/20 rounded-xl">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[#ffbf00] text-[10px] font-black uppercase tracking-widest">Shipment Selected</p>
                                            <p className="text-[#e2e2e2] text-xs font-semibold mt-1">
                                                SHP-{String(selectedShipment.id).padStart(4, '0')} — {selectedShipment.origin} → {selectedShipment.destination}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleReject}
                                            disabled={assigning}
                                            className="px-3 py-1.5 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ scrollbarWidth: 'none' }}>

                                {/* Loading drivers */}
                                {loading && (
                                    <div className="flex items-center justify-center py-8 text-[#e2e2e2]/40">
                                        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                                        Loading drivers...
                                    </div>
                                )}

                                {/* No drivers */}
                                {!loading && drivers.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-[#e2e2e2]/40">
                                        <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                                        <p className="text-[10px] uppercase tracking-widest font-bold">No active drivers</p>
                                    </div>
                                )}

                                {/* Driver Cards */}
                                {!loading && drivers.map((driver) => (
                                    <div key={driver.id} className="bg-[#131313] rounded-xl p-4 border border-outline-variant/10 hover:bg-[#353535]/40 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-[#353535] flex items-center justify-center text-[#ffbf00] font-bold text-sm">
                                                    {getInitials(driver.name)}
                                                </div>
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#131313] rounded-full"></span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-bold text-sm text-[#e2e2e2]">{driver.name}</h4>
                                                </div>
                                                <p className="text-[#e2e2e2]/40 text-[10px] font-bold uppercase tracking-widest mt-1">{driver.email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-outline-variant/5">
                                            <div>
                                                <p className="text-[#e2e2e2]/30 text-[9px] font-bold uppercase tracking-widest">Driver</p>
                                                <p className="text-on-background text-[11px] font-semibold italic">ID: #{String(driver.id).padStart(4, '0')}</p>
                                            </div>
                                            <button
                                                onClick={() => handleAssign(driver.id)}
                                                disabled={assigning}
                                                className="h-8 px-4 bg-[#ffbf00] text-black text-[9px] font-black uppercase tracking-widest rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {assigning ? '...' : 'Assign'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
