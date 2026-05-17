'use client';
import { useState } from 'react';

/**
 * ActiveTripModal lets drivers advance an assigned shipment through the trip flow.
 * It reads the current shipment status, calculates the next valid driver action,
 * calls the shipment PATCH endpoint, and closes itself after a successful update.
 */
type ShipmentStatus = 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED';

// Shipment contains only the fields this modal needs to display and update a trip.
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

type ActiveTripModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    shipment: Shipment | null;
};
export default function ActiveTripModal({ isOpen, onClose, onSuccess, shipment }: ActiveTripModalProps) {
    // Loading disables the primary action while the status update is in flight.
    const [loading, setLoading] = useState(false);

    // Moves the shipment from ASSIGNED to IN_TRANSIT, or from IN_TRANSIT to DELIVERED.
    async function handleUpdateStatus() {
        if (!shipment) return;
        const newStatus = shipment.status === 'ASSIGNED' ? 'IN_TRANSIT' : 'DELIVERED';

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/shipments/${shipment.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error();
            onSuccess();
            onClose();
        } catch {
            console.error('Error updating status');
        } finally {
            setLoading(false);
        }
    }
    // Do not render the modal until it is opened with a valid shipment.
    if (!isOpen || !shipment) return null;

    // Derived labels keep the JSX focused on presentation.
    const isAssigned = shipment.status === 'ASSIGNED';
    const buttonLabel = isAssigned ? 'START TRIP' : 'COMPLETE DELIVERY';
    const nextStatus = isAssigned ? 'IN_TRANSIT' : 'DELIVERED';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Mobile-styled modal */}
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#131313' }}>

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#ffbf00]/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#ffbf00] text-sm">local_shipping</span>
                        </div>
                        <span className="text-[#ffbf00] font-black tracking-widest text-sm uppercase">TRUX</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#e2e2e2]/60 cursor-pointer hover:text-[#e2e2e2]">notifications</span>
                        <button onClick={onClose} className="text-[#e2e2e2]/60 hover:text-[#e2e2e2] transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Map Area */}
                <div className="mx-4 rounded-2xl overflow-hidden relative h-48 bg-[#1b1b1b]">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-full h-full p-8" viewBox="0 0 400 200">
                            <path
                                d="M50 150 Q 200 50, 350 150"
                                fill="transparent"
                                stroke="#ffbf00"
                                strokeDasharray="8 4"
                                strokeWidth="3"
                                className="opacity-80"
                            />
                            <circle cx="50" cy="150" r="6" fill="#ffbf00" style={{ filter: 'drop-shadow(0 0 8px rgba(255,191,0,0.5))' }} />
                            <circle cx="350" cy="150" r="6" fill="#e2e2e2" style={{ filter: 'drop-shadow(0 0 8px rgba(226,226,226,0.3))' }} />
                        </svg>
                    </div>
                    <div className="absolute top-3 left-3 bg-[#131313]/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#e2e2e2]/60">Distance</p>
                        <p className="text-sm font-black text-[#ffbf00]">{shipment.weight} Tons</p>
                    </div>
                    <div className="absolute top-3 right-3 bg-[#131313]/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#e2e2e2]/60">Timeline</p>
                        <p className="text-sm font-black text-[#ffbf00]">{shipment.timeline}</p>
                    </div>
                </div>

                {/* Trip Info */}
                <div className="px-6 py-4 space-y-4">

                    {/* Next Stop */}
                    <div className="bg-[#1b1b1b] rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[#ffbf00] text-sm">location_on</span>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#e2e2e2]/60">
                                {isAssigned ? 'Origin' : 'Destination'}
                            </p>
                        </div>
                        <p className="font-black text-[#e2e2e2] uppercase tracking-tight text-lg">
                            {isAssigned ? shipment.origin : shipment.destination}
                        </p>
                        <div className="flex gap-6 mt-3">
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#e2e2e2]/40">Cargo</p>
                                <p className="text-sm font-bold text-[#ffbf00]">{shipment.cargoType}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#e2e2e2]/40">Status</p>
                                <p className="text-sm font-bold text-[#e2e2e2]">{shipment.status.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#e2e2e2]/40">Client</p>
                                <p className="text-sm font-bold text-[#e2e2e2]">{shipment.company?.name || shipment.customer?.name || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Route */}
                    <div className="bg-[#1b1b1b] rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-[#ffbf00]"></div>
                                <div className="w-0.5 h-6 bg-[#e2e2e2]/20"></div>
                                <div className="w-2 h-2 rounded-full bg-[#e2e2e2]/60"></div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#e2e2e2]/40">From</p>
                                    <p className="text-sm font-bold text-[#e2e2e2]">{shipment.origin}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#e2e2e2]/40">To</p>
                                    <p className="text-sm font-bold text-[#e2e2e2]">{shipment.destination}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next status indicator */}
                    <div className="flex items-center gap-2 bg-[#ffbf00]/10 border border-[#ffbf00]/20 rounded-xl px-4 py-3">
                        <span className="material-symbols-outlined text-[#ffbf00] text-sm">info</span>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#ffbf00]">
                            Will change status to: {nextStatus.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                {/* Update Status Button */}
                <div className="px-4 pb-6">
                    <button
                        onClick={handleUpdateStatus}
                        disabled={loading || shipment.status === 'DELIVERED'}
                        className="w-full py-4 bg-[#ffbf00] text-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ filter: 'drop-shadow(0 0 12px rgba(255,191,0,0.3))' }}
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                        )}
                        {loading ? 'Updating...' : buttonLabel}
                    </button>
                </div>

                {/* Bottom Nav */}
                <nav className="flex justify-around items-center px-4 py-3 border-t border-[#e2e2e2]/10">
                    <button className="flex flex-col items-center text-[#ffbf00]">
                        <span className="material-symbols-outlined text-sm">navigation</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Active Trip</span>
                    </button>
                    <button className="flex flex-col items-center text-[#e2e2e2]/40">
                        <span className="material-symbols-outlined text-sm">receipt_long</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Manifest</span>
                    </button>
                    <button className="flex flex-col items-center text-[#e2e2e2]/40">
                        <span className="material-symbols-outlined text-sm">forum</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Comms</span>
                    </button>
                    <button className="flex flex-col items-center text-[#e2e2e2]/40">
                        <span className="material-symbols-outlined text-sm">account_circle</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Profile</span>
                    </button>
                </nav>
            </div>
        </div>
    )
}
