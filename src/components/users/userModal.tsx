'use client'
import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { Role } from "@/generated/prisma";

/**
 * UserModal creates and edits users from the admin dashboard.
 * It reuses the same form for create and update flows, validates input locally,
 * and notifies the parent when the API operation succeeds.
 */
type UserModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user?: User | null;
};

// FormData mirrors the editable user fields shown in the modal.
type FormData = {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    password: string;
    role: Role;
    nit?: string;
    isActive: boolean;
};

// FormErrors holds validation messages by field name.
type FormErrors = {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    password?: string;
    nit?: string;
};

export default function UserModal({ isOpen, onClose, onSuccess, user }: UserModalProps) {
    // The presence of a user switches the modal between create and edit mode.
    const isEditing = !!user;

    // Form state is reset whenever the modal opens for a different user.
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER",
        phone: "",
        address: "",
        nit: "",
        isActive: true,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [nit, setNit] = useState("");

    // Hydrate form fields from the selected user or reset them for a new user.
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                password: '',
                role: user.role,
                isActive: user.isActive,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                password: '',
                role: 'CUSTOMER',
                isActive: true,
            });
        }
        setErrors({});
        setServerError(null);
    }, [user, isOpen]);

    // Validates required fields and basic email/password rules before submitting.
    function validate(): boolean {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'The email is not valid';
        }

        if (!isEditing) {
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Minimum 8 characters';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    function handleClose() {
        setFormData({ name: "", email: "", password: "", role: "CUSTOMER", isActive: true });
        setErrors({});
        setServerError(null);
        onClose();
    }
    async function handleSubmit() {
        if (!validate()) return;

        setLoading(true);
        setServerError(null);

        try {
            const token = localStorage.getItem('accessToken');
            const url = isEditing ? `/api/users/${user!.id}` : '/api/users';
            const method = isEditing ? 'PATCH' : 'POST';

            const body = isEditing
                ? { name: formData.name, email: formData.email, phone: formData.phone, address: formData.address, role: formData.role, isActive: formData.isActive }
                : { name: formData.name, email: formData.email, phone: formData.phone, address: formData.address, password: formData.password, role: formData.role };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!res.ok) {
                setServerError(data.error || 'Error saving user');
                return;
            }
            onSuccess();
            handleClose();
        } catch {
            setServerError('Error de conexion, intente nuevamente');
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
            <div className="relative z-10 bg-[#1b1b1b] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-400/10 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-400 text-[18px]">
                                {isEditing ? 'edit' : 'person_add'}
                            </span>
                        </div>
                        <h2 className="text-on-surface font-bold text-lg uppercase tracking-widest text-sm">
                            {isEditing ? 'Edit Entity' : 'Register Entity'}
                        </h2>
                    </div>
                    <button onClick={handleClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Server Error */}
                {serverError && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {serverError}
                    </div>
                )}

                {/* Form */}
                <div className="space-y-4">

                    {/* Name */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full bg-zinc-900 border rounded-lg py-2 px-4 text-on-surface text-sm outline-none transition-all
                                ${errors.name ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-zinc-800 focus:ring-1 focus:ring-amber-400 focus:border-amber-400'}`}
                            placeholder="John Doe"
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full bg-zinc-900 border rounded-lg py-2 px-4 text-on-surface text-sm outline-none transition-all
                                ${errors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-zinc-800 focus:ring-1 focus:ring-amber-400 focus:border-amber-400'}`}
                            placeholder="john@trux.com"
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                    {/* Phone */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Phone</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full bg-zinc-900 border rounded-lg py-2 px-4 text-on-surface text-sm outline-none transition-all
                                ${errors.phone ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-zinc-800 focus:ring-1 focus:ring-amber-400 focus:border-amber-400'}`}
                            placeholder="123456789"
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    {/* Address */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={`w-full bg-zinc-900 border rounded-lg py-2 px-4 text-on-surface text-sm outline-none transition-all
                                ${errors.address ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-zinc-800 focus:ring-1 focus:ring-amber-400 focus:border-amber-400'}`}
                            placeholder="Calle 123 #45-67"
                        />
                        {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* Password - create mode only */}
                    {!isEditing && (
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={`w-full bg-zinc-900 border rounded-lg py-2 px-4 text-on-surface text-sm outline-none transition-all
                                    ${errors.password ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-zinc-800 focus:ring-1 focus:ring-amber-400 focus:border-amber-400'}`}
                                placeholder="Min. 8 characters"
                            />
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>
                    )}

                    {/* Role */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-on-surface text-sm outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 cursor-pointer transition-all"
                        >
                            <option value="CUSTOMER">Client</option>
                            <option value="DRIVER">Driver</option>
                            <option value="COMPANY">Company</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        {formData.role === 'COMPANY' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-sm font-medium text-amber-400 ml-1">Company NIT</label>
                                <input
                                    type="text"
                                    placeholder="nit"
                                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    value={nit}
                                    onChange={e => setNit(e.target.value)}
                                />
                            </div>
                        )}

                    </div>

                    {/* Status - edit mode only */}
                    {isEditing && (
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Status</label>
                            <select
                                value={formData.isActive ? 'true' : 'false'}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-4 text-on-surface text-sm outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 cursor-pointer transition-all"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
                    <button
                        onClick={handleClose}
                        className="py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest bg-amber-400 hover:bg-amber-300 text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && (
                            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        )}
                        {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Register'}
                    </button>
                </div>
            </div>
        </div>
    )

}
