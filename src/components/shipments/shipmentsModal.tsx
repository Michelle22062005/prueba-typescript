'use client';
import { useState } from 'react';

/**
 * ShipmentModal collects shipment details from customers or companies.
 * It validates the form, calculates a proposed price, shows a confirmation step,
 * and then creates the shipment through the protected shipments API.
 */
type ShipmentModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

// FormData mirrors the controlled inputs rendered inside the modal.
type FormData = {
    cargoType: string;
    weight: string;
    dimensions: string;
    origin: string;
    destination: string;
    timeline: 'URGENT' | 'STANDARD';
};

// FormErrors stores field-level validation messages for the current form state.
type FormErrors = {
    cargoType?: string;
    weight?: string;
    origin?: string;
    destination?: string;
};

// Price stores the current quote values shown before creating the shipment.
type Price = {
    unitRate: number;
    subtotal: number;
    total: number;
};

export default function ShipmentModal({ isOpen, onClose, onSuccess }: ShipmentModalProps) {
    // Form state is kept as strings because values come directly from text inputs.
    const [formData, setFormData] = useState<FormData>({
        cargoType: '',
        weight: '',
        dimensions: '',
        origin: '',
        destination: '',
        timeline: 'STANDARD',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [price, setPrice] = useState<Price>({
        unitRate: 500,
        subtotal: 0,
        total: 0,
    });

    // Calculates the visible quote using the configured unit rate and entered weight.
    function calcularPrecio() {
        const weight = Number(formData.weight) || 0;
        const unitRate = price.unitRate;
        const subtotal = weight * unitRate;
        const total = subtotal
        setPrice({ ...price, subtotal: Number(subtotal.toFixed(2)), total: Number(total.toFixed(2)) });
    }

    // Validates required fields before showing the price confirmation modal.
    function validate(): boolean {
        const newErrors: FormErrors = {};
        if (!formData.cargoType) newErrors.cargoType = 'Required';
        if (!formData.weight || isNaN(Number(formData.weight))) newErrors.weight = 'Invalid weight';
        if (!formData.origin) newErrors.origin = 'Required';
        if (!formData.destination) newErrors.destination = 'Required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // Resets transient state so the next open starts with a clean form.
    function handleClose() {
        setFormData({ cargoType: '', weight: '', dimensions: '', origin: '', destination: '', timeline: 'STANDARD' });
        setErrors({});
        setServerError(null);
        setShowPriceModal(false);
        onClose();
    }

    // Starts the confirmation step after the form passes local validation.
    function handleSubmit() {
        if (!validate()) return;
        calcularPrecio();
        setShowPriceModal(true);
    }

    async function confirmSubmission() {
        setLoading(true);
        setServerError(null);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/shipments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cargoType: formData.cargoType,
                    weight: Number(formData.weight),
                    dimensions: formData.dimensions || null,
                    origin: formData.origin,
                    destination: formData.destination,
                    timeline: formData.timeline,
                    proposedPrice: price.total,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setServerError(data.error || 'Error creating shipment');
                setShowPriceModal(false);
                return;
            }

            onSuccess();
            handleClose();
        } catch {
            setServerError('Connection error. Try again.');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="relative z-10 bg-[#1b1b1b] border border-[#504532]/30 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ffbf00]/10 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#ffbf00]">local_shipping</span>
                        </div>
                        <div>
                            <h2 className="text-on-surface font-black text-lg tracking-tighter uppercase">New Load Request</h2>
                            <p className="text-[#e2e2e2]/40 text-[10px] uppercase tracking-widest">Load Request Protocol 04-A</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-[#e2e2e2]/40 hover:text-[#e2e2e2] transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Server Error */}
                {serverError && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-4 py-3 mb-6">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {serverError}
                    </div>
                )}

                <div className="space-y-5">
                    {/* Cargo & Weight */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <input
                                type="text"
                                value={formData.cargoType}
                                onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                                className={`w-full bg-[#131313] border-b py-3 px-0 text-[#e2e2e2] text-sm outline-none transition-all placeholder:text-[#e2e2e2]/20
                                    ${errors.cargoType ? 'border-red-500' : 'border-[#504532]/30 focus:border-[#ffbf00]'}`}
                                placeholder="Cargo Type (e.g. Electronics)"
                            />
                            {errors.cargoType && <p className="text-red-400 text-xs mt-1">{errors.cargoType}</p>}
                        </div>
                        <div>
                            <input
                                type="text"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                className={`w-full bg-[#131313] border-b py-3 px-0 text-[#e2e2e2] text-sm outline-none transition-all placeholder:text-[#e2e2e2]/20
                                    ${errors.weight ? 'border-red-500' : 'border-[#504532]/30 focus:border-[#ffbf00]'}`}
                                placeholder="Weight (Tons)"
                            />
                            {errors.weight && <p className="text-red-400 text-xs mt-1">{errors.weight}</p>}
                        </div>
                    </div>

                    <div>
                        <input
                            type="text"
                            value={formData.dimensions}
                            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                            className="w-full bg-[#131313] border-b border-[#504532]/30 focus:border-[#ffbf00] py-3 px-0 text-[#e2e2e2] text-sm outline-none transition-all placeholder:text-[#e2e2e2]/20"
                            placeholder="Dimensions (LxWxH) optional"
                        />
                    </div>

                    {/* Origin */}
                    <div>
                        <input
                            type="text"
                            value={formData.origin}
                            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                            className={`w-full bg-[#131313] border-b py-3 px-0 text-[#e2e2e2] text-sm outline-none transition-all placeholder:text-[#e2e2e2]/20
                                ${errors.origin ? 'border-red-500' : 'border-[#504532]/30 focus:border-[#ffbf00]'}`}
                            placeholder="Origin City / Port"
                        />
                        {errors.origin && <p className="text-red-400 text-xs mt-1">{errors.origin}</p>}
                    </div>

                    {/* Destination */}
                    <div>
                        <input
                            type="text"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            className={`w-full bg-[#131313] border-b py-3 px-0 text-[#e2e2e2] text-sm outline-none transition-all placeholder:text-[#e2e2e2]/20
                                ${errors.destination ? 'border-red-500' : 'border-[#504532]/30 focus:border-[#ffbf00]'}`}
                            placeholder="Destination City / Hub"
                        />
                        {errors.destination && <p className="text-red-400 text-xs mt-1">{errors.destination}</p>}
                    </div>

                    {/* Timeline */}
                    <div>
                        <label className="text-[#e2e2e2]/30 text-[9px] font-black uppercase tracking-[0.3em] mb-3 block">Service Level</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setFormData({ ...formData, timeline: 'URGENT' })}
                                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.timeline === 'URGENT'
                                    ? 'bg-[#ffbf00] text-black'
                                    : 'bg-[#131313] border border-[#504532]/30 text-[#e2e2e2]/60 hover:border-[#ffbf00]/40'
                                    }`}
                            >
                                Urgent (Expedited)
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, timeline: 'STANDARD' })}
                                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.timeline === 'STANDARD'
                                    ? 'bg-[#ffbf00] text-black'
                                    : 'bg-[#131313] border border-[#504532]/30 text-[#e2e2e2]/60 hover:border-[#ffbf00]/40'
                                    }`}
                            >
                                Standard (24H)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-[#ffbf00] hover:bg-[#ffbf00]/90 text-black font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Request Load
                    </button>
                </div>
            </div>

            {/* Price Summary Confirmation Modal */}
            {showPriceModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPriceModal(false)} />
                    <div className="relative z-10 bg-[#131313] border border-[#ffbf00]/30 rounded-2xl p-8 w-full max-w-sm shadow-[0_0_50px_rgba(255,191,0,0.1)]">
                        <h3 className="text-white font-black italic uppercase tracking-tighter text-2xl mb-6">Quote Summary</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold">
                                <span className="text-[#e2e2e2]/30">Cargo Weight</span>
                                <span className="text-white">{formData.weight} Tons</span>
                            </div>
                            <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold">
                                <span className="text-[#e2e2e2]/30">Rate per Ton</span>
                                <span className="text-white">${price.unitRate.toFixed(2)}</span>
                            </div>
                            <div className="h-[1px] bg-white/5 my-4" />

                            <div className="bg-[#ffbf00]/10 p-4 mt-6 border border-[#ffbf00]/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#ffbf00] text-[10px] font-black uppercase tracking-[0.2em]">Total to Pay</span>
                                    <span className="text-[#ffbf00] text-2xl font-black italic tracking-tighter">${price.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowPriceModal(false)}
                                className="py-3 text-[#e2e2e2]/40 font-bold uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/5 transition-all"
                            >
                                Edit Data
                            </button>
                            <button
                                onClick={confirmSubmission}
                                disabled={loading}
                                className="py-3 bg-[#ffbf00] text-black font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {loading ? '...' : 'Confirm & Pay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
