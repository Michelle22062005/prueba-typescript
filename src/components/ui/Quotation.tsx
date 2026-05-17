"use client"
import { Aside } from "../asides/Aside"
import { useRouter } from "next/navigation"
import { User } from '@/types/user';
import { useState, useEffect } from "react";
import { Header } from "../Header/Header";
import Swal from 'sweetalert2';

/**
 * Quotation renders the admin review queue for proposed shipment prices.
 * It loads shipments that need super-admin approval, lets the admin approve
 * or reject them, and keeps the side navigation populated with user data.
 */
type ShipmentStatus = 'PENDING' | 'PENDING_SUPERADMIN_REVIEW' | 'PENDING_FOR_PAY' | 'AVAILABLE_FOR_ASSIGNMENT' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';

// Shipment captures the quotation fields required for review decisions.
type Shipment = {
    id: number;
    cargoType: string;
    weight: number;
    dimensions: string | null;
    origin: string;
    destination: string;
    timeline: string;
    status: ShipmentStatus;
    proposedPrice: number | null;
    createdAt: string;
};

export default function Quotation() {
    // Router supports logout redirection from the quotation workspace.
    const router = useRouter()

    // State separates identity, users, review queue data, and processing feedback.
    const [userName, setUserName] = useState<string>('ADMIN')
    const [users, setUsers] = useState<User[]>([])
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedShipmentId, setSelectedShipmentId] = useState<number | null>(null)
    const [processing, setProcessing] = useState(false)

    // Loads only shipments that have a proposed price and still need admin review.
    const fetchShipments = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('accessToken');
            const storedUser = JSON.parse(localStorage.getItem('logged-in-user') || '{}');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'x-user-id': storedUser.id?.toString() || '',
                'x-user-role': storedUser.role || ''
            };

            const res = await fetch('/api/shipments', { headers })
            const data = await res.json()

            if (Array.isArray(data)) {
                setShipments(data.filter((s: Shipment) => s.proposedPrice !== null && s.status === 'PENDING_SUPERADMIN_REVIEW'))
            } else {
                setShipments([])
            }
        } catch (e) {
            console.error("Error fetching shipments", e)
            setShipments([])
        } finally {
            setLoading(false)
        }
    }

    // Loads users so the shared aside can render reports and profile context.
    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users')
            const data = await res.json()
            if (Array.isArray(data)) {
                setUsers(data)
            }
        } catch (e) {
            console.error("Error fetching users", e)
        }
    }

    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch (e) {
            console.error('Error closing session', e)
        } finally {
            localStorage.clear()
            router.push('/login')
        }
    }

    // Restore the stored user name and hydrate the page data on mount.
    useEffect(() => {
        const storedUser = localStorage.getItem('logged-in-user')
        if (storedUser) {
            try {
                const { name } = JSON.parse(storedUser)
                if (name) setUserName(name)
            } catch (e) {
                console.error("Error parsing stored user", e)
            }
        }

        fetchUsers()
        fetchShipments()
    }, [])

    async function handleAccept() {
        if (!selectedShipmentId) {
            Swal.fire('Error', 'Please select a shipment first', 'warning');
            return;
        }


        try {
            setProcessing(true);
            const token = localStorage.getItem('accessToken');
            const storedUser = JSON.parse(localStorage.getItem('logged-in-user') || '{}');
            const res = await fetch(`/api/shipments/${selectedShipmentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-user-id': storedUser.id?.toString() || '',
                    'x-user-role': storedUser.role || ''
                },
                body: JSON.stringify({ status: 'AVAILABLE_FOR_ASSIGNMENT' })
            });

            if (res.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Accepted',
                    text: 'Shipment accepted. Redirecting to assignments...',
                    timer: 2000,
                    showConfirmButton: false
                });
                router.push('/shipments');
            } else {
                throw new Error('Failed to update');
            }
        } catch (e) {
            Swal.fire('Error', 'Could not accept shipment', 'error');
        } finally {
            setProcessing(false);
        }
    }

    async function handleReject() {
        if (!selectedShipmentId) {
            Swal.fire('Error', 'Please select a shipment first', 'warning');
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
            try {
                setProcessing(true);
                const token = localStorage.getItem('accessToken');
                const storedUser = JSON.parse(localStorage.getItem('logged-in-user') || '{}');
                const res = await fetch(`/api/shipments/${selectedShipmentId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'x-user-id': storedUser.id?.toString() || '',
                        'x-user-role': storedUser.role || ''
                    },
                    body: JSON.stringify({ rejectionReason: reason })
                });

                if (res.ok) {
                    Swal.fire('Rejected', 'Shipment has been rejected', 'info');
                    setSelectedShipmentId(null);
                    fetchShipments();
                } else {
                    throw new Error('Failed to update');
                }
            } catch (e) {
                Swal.fire('Error', 'Could not reject shipment', 'error');
            } finally {
                setProcessing(false);
            }
        }
    }

    return (
        <div className="font-body selection:bg-primary-container selection:text-on-primary">
            <Aside userName={userName} users={users} handleLogout={handleLogout} shipments={shipments} />

            <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto">
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none grayscale brightness-50">
                    <img alt="Route Visualization" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2z-xUSChu2yMLNQRtapw6AOal2s1QKdEDVzZayFd8uTnmOOWM2RJ72az27_yObS-friDgCZLconsiVRqVDJHxp-YA2uIKzyosYH6c_f5DGFyyJAFqWJSCe9LgjG1_XXPVfq_MHYPhLD-UHDgYPfDoBHPb9XEkNYLkNC8V7nlku28DUonsCKEAUKX8R2OlpDtBkr6DOIEe7TX0GShuXCULRU6VUuP0HuL587JmlR9OAiVFrV7D4kjBRdr4wRl5k2gAHnsi2Zvnrfh4" />
                </div>

                <Header />

                <div className="p-12 max-w-7xl mx-auto relative z-10">
                    <div className="flex justify-between items-end mb-16">
                        <div className="max-w-2xl">
                            <h2 className="text-[50px] font-black italic tracking-tighter uppercase leading-[0.85] mb-6 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                Confirm Shipment Quote
                            </h2>
                            <div className="flex items-center gap-6">
                                <span className="px-3 py-1 bg-[#ffbf00] text-black text-[10px] font-black uppercase tracking-[0.2em]">
                                    Valid for 24h
                                </span>
                                <span className="text-[#e2e2e2]/40 font-bold uppercase text-[10px] tracking-[0.3em]">
                                    Awaiting Client Validation
                                </span>
                            </div>
                        </div>
                        <div className="text-right pb-2">
                            <p className="text-[#e2e2e2]/20 uppercase text-[9px] tracking-[0.4em] font-black mb-3">Status</p>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-3 text-[#ffbf00]">
                                    <span className="w-2 h-2 rounded-full bg-[#ffbf00] animate-pulse shadow-[0_0_10px_#ffbf00]"></span>
                                    <span className="font-black tracking-[0.25em] text-xs">PENDING PAYMENT</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {loading ? (
                            <div className="col-span-full py-12 text-center text-zinc-500">
                                <span className="material-symbols-outlined animate-spin block mx-auto mb-2 text-amber-400">progress_activity</span>
                                Syncing Quotations...
                            </div>
                        ) : shipments.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                                <span className="material-symbols-outlined block mx-auto mb-2 text-zinc-600">receipt_long</span>
                                No active quotations found.
                            </div>
                        ) : (
                            shipments.map((shipment) => (
                                <div
                                    key={shipment.id}
                                    onClick={() => setSelectedShipmentId(selectedShipmentId === shipment.id ? null : shipment.id)}
                                    className={`bg-[#1b1b1b] p-10 border-l-[3px] relative overflow-hidden group hover:bg-[#222222] transition-colors duration-500 cursor-pointer ${selectedShipmentId === shipment.id ? 'border-white bg-[#222222]' : 'border-[#ffbf00]'}`}
                                >
                                    {selectedShipmentId === shipment.id && (
                                        <div className="absolute top-4 right-4 text-amber-400">
                                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                                        </div>
                                    )}
                                    <div className="absolute top-0 right-0 w-32 h-30 bg-[#ffbf00]/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                                    <p className="text-[#e2e2e2]/30 uppercase text-[9px] tracking-[0.4em] font-black mb-8">Shipment Unit ID-SHP-{String(shipment.id).padStart(4, '0')}</p>
                                    <div className="flex items-baseline gap-1 mb-10">
                                        <span className="text-4xl font-black tracking-tighter text-white">${Number(shipment.proposedPrice).toLocaleString('en-US', { minimumFractionDigits: 0 })}.</span>
                                        <span className="text-2xl font-black text-[#e2e2e2]/20">00</span>
                                    </div>
                                    <div className="space-y-5 border-t border-white/5 pt-8">
                                        <div className="flex justify-between text-[11px] tracking-[0.2em] uppercase">
                                            <span className="text-[#e2e2e2]/30 font-bold">Cargo Type</span>
                                            <span className="font-black text-[#e2e2e2]">{shipment.cargoType}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] tracking-[0.2em] uppercase">
                                            <span className="text-[#e2e2e2]/30 font-bold">Origin</span>
                                            <span className="font-black text-[#e2e2e2]">{shipment.origin}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] tracking-[0.2em] uppercase">
                                            <span className="text-[#e2e2e2]/30 font-bold">Destination</span>
                                            <span className="font-black text-[#ffbf00] animate-pulse-subtle">{shipment.destination}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] tracking-[0.2em] uppercase mt-4 pt-4 border-t border-white/5">
                                            <span className="text-[#e2e2e2]/30 font-bold">Weight</span>
                                            <span className="font-black text-[#e2e2e2]">{shipment.weight} Tons</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-16 border-t border-white/5">
                        <div className="flex items-center gap-6 max-w-xl">
                            <span className="material-symbols-outlined text-[#e2e2e2]/20 text-3xl">shield</span>
                            <p className="text-[10px] text-[#e2e2e2]/30 font-bold uppercase tracking-[0.2em] leading-loose">
                                By accepting this quote, you agree to the <span className="text-[#e2e2e2]/60">TRUX Terms of Carriage</span> and Hazmat protocols. Final price includes all mandatory surcharges and operational fees.
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <button
                                onClick={handleReject}
                                disabled={processing || !selectedShipmentId}
                                className="px-12 py-6 bg-transparent text-[#e2e2e2]/40 font-black uppercase tracking-[0.3em] text-[10px] border border-white/10 hover:bg-red-500/10 hover:text-red-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {processing ? '...' : 'Reject Quote'}
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={processing || !selectedShipmentId}
                                className="px-16 py-6 bg-[#ffbf00] text-black font-black uppercase tracking-[0.4em] text-[10px] shadow-[0_0_30px_rgba(255,191,0,0.3)] hover:shadow-[0_0_50px_rgba(255,191,0,0.5)] hover:bg-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? '...' : 'Accept & Assign'}
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="mt-20 border-t border-white/5 bg-black/40 backdrop-blur-xl py-12 px-12 flex justify-between items-center relative z-20">
                    <div className="flex gap-20">
                        <div>
                            <p className="text-[9px] text-[#e2e2e2]/20 font-black uppercase tracking-[0.4em] mb-3">Network Status</p>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                                <span className="text-[10px] text-[#e2e2e2]/80 font-black tracking-[0.3em] uppercase">Kinetic Optimal</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] text-[#e2e2e2]/20 font-black uppercase tracking-[0.4em] mb-3">Freight Index</p>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-[#e2e2e2] font-black tracking-[0.2em]">3,124.50</span>
                                <span className="text-[10px] text-green-500 font-black">+1.2%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] text-[#e2e2e2]/20 font-black uppercase tracking-[0.4em] mb-3">Active Nodes</p>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-[#e2e2e2] font-black tracking-[0.2em]">1,482 LIVE</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-[9px] text-[#e2e2e2]/10 font-black tracking-[0.6em] uppercase">
                        © 2024 TRUX Logistics Infrastructure
                    </div>
                </footer>
            </main>
        </div>
    )
}
