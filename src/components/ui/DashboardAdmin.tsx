'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserModal from '@/components/users/userModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { User } from '@/types/user';
import { Role } from '@/generated/prisma';
import { Aside } from '../asides/Aside';
import { Header } from '../Header/Header';
import { Shipment, ShipmentStatus } from '@/types/shipment';

/**
 * MasterAdmin renders the administrative command center.
 * It manages users, displays pending shipments, opens edit/confirmation modals,
 * exports reports, and routes admins out through the logout endpoint.
 */

// Builds initials for compact avatar placeholders.
function getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

// Formats database dates for the entity directory.
function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// RoleBadge gives each role a compact visual label in the user table.
function RoleBadge({ role }: { role: Role }) {
    const styles: Record<Role, string> = {
        ADMIN: 'bg-zinc-800 text-zinc-400',
        COMPANY: 'bg-amber-900/20 text-amber-200 border border-amber-900/30',
        DRIVER: 'bg-amber-900/20 text-amber-200 border border-amber-900/30',
        CUSTOMER: 'bg-blue-900/20 text-blue-200 border border-blue-900/30',
    };

    const labels: Record<Role, string> = {
        ADMIN: 'Internal',
        COMPANY: 'Company',
        DRIVER: 'Driver',
        CUSTOMER: 'Client',
    };
    return (
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${styles[role]}`}>
            {labels[role]}
        </span>
    );
}

type TabType = 'ALL' | 'CUSTOMER' | 'COMPANY' | 'DRIVER' | 'PENDING_SHIPMENTS';

export default function MasterAdmin() {
    // Router is used for logout navigation.
    const router = useRouter();

    // State covers users, filters, modals, confirmations, and shipment review data.
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmUser, setConfirmUser] = useState<User | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [userName, setUserName] = useState<string>('ADMIN');
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [shipmentsLoading, setShipmentsLoading] = useState(false);

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

    // Loads shipments so admins can review pending operational work.
    async function fetchShipments() {
        try {
            setShipmentsLoading(true);
            const token = localStorage.getItem('accessToken');
            const storedUser = JSON.parse(localStorage.getItem('logged-in-user') || '{}');
            const res = await fetch('/api/shipments', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-user-id': storedUser.id?.toString() || '',
                    'x-user-role': storedUser.role || ''
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setShipments(data);
            }
        } catch (err) {
            console.error('Error fetching shipments', err);
        } finally {
            setShipmentsLoading(false);
        }
    }

    async function fetchUsers() {
        try {
            setLoading(true);
            const res = await fetch('/api/users');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Users could not be loaded');
            setUsers(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Users could not be loaded');
        } finally {
            setLoading(false);
        }
    }
    async function handleToggleStatus() {
        if (!confirmUser) return;
        setConfirmLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/users/${confirmUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: !confirmUser.isActive }),
            });
            if (!res.ok) throw new Error();
            fetchUsers();
        } catch {
            console.error('Error changing status');
        } finally {
            setConfirmLoading(false);
            setConfirmOpen(false);
            setConfirmUser(null);
        }
    }

    useEffect(() => {
        fetchUsers();
        fetchShipments();
        const storedUser = localStorage.getItem('logged-in-user');
        if (storedUser) {
            const { name } = JSON.parse(storedUser);
            if (name) setUserName(name);
        }
    }, []);

    const filteredUsers = users.filter((user) => {
        if (user.role === 'ADMIN') return false;
        if (activeTab === 'ALL') return true;
        return user.role === activeTab;
    });



    return (
        <div className="font-body selection:bg-primary-container selection:text-on-primary">

            <Aside userName={userName} users={users} handleLogout={handleLogout} />

            {/* Main layout removes the side margin on mobile and restores it on large screens. */}
            <main className="lg:ml-64 min-h-screen flex flex-col bg-[#0a0a0a]">

                <Header />

                {/* Canvas */}
                <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 flex-1 min-w-0 max-w-7xl mx-auto w-full">

                    {/* Title row */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                        <div>
                            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tighter text-on-surface mb-2 font-display">ENTITY DIRECTORY</h1>
                            <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs font-bold">Central Registry • Operational Node A1</p>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <button className="bg-surface-container-highest text-primary px-4 lg:px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                <span className="hidden sm:inline">Filter</span>
                            </button>
                            <button onClick={() => {
                                setSelectedUser(null);
                                setIsModalOpen(true);
                            }} className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 lg:px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_4px_15px_rgba(255,191,0,0.2)] hover:shadow-[0_4px_25px_rgba(255,191,0,0.3)] transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                <span className="hidden sm:inline">Register Entity</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs use horizontal scrolling on mobile. */}
                    <div className="flex items-center gap-1 border-b border-zinc-800/30 overflow-x-auto scrollbar-none">
                        {/* Tabs — Chip Style */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
                            {([
                                { key: 'ALL', label: 'All Entities' },
                                { key: 'COMPANY', label: 'Companies' },
                                { key: 'DRIVER', label: 'Partners' },
                                { key: 'PENDING_SHIPMENTS', label: 'Pending' },
                            ] as { key: TabType; label: string }[]).map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${activeTab === tab.key
                                        ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_20px_rgba(255,191,0,0.25)]'
                                        : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                                        }`}
                                >
                                    {tab.label}
                                    <span className={`ml-3 px-1.5 py-0.5 rounded-md text-[8px] ${activeTab === tab.key ? 'bg-black/10 text-black' : 'bg-zinc-800 text-zinc-500'
                                        }`}>
                                        {tab.key === 'PENDING_SHIPMENTS'
                                            ? shipments.filter(s => ['PENDING', 'PENDING_SUPERADMIN_REVIEW', 'PENDING_FOR_PAY', 'AVAILABLE_FOR_ASSIGNMENT'].includes(s.status)).length
                                            : tab.key === 'ALL' ? users.filter(u => u.role !== 'ADMIN').length : users.filter(u => u.role === tab.key).length}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Table uses horizontal scrolling on mobile. */}
                        <section className="bg-surface-container-low rounded-2xl overflow-hidden shadow-2xl border border-white/[0.02]">
                            <div className="overflow-x-auto">
                                {activeTab === 'PENDING_SHIPMENTS' ? (
                                    <table className="w-full min-w-[600px] text-left border-collapse">
                                        <thead>
                                            <tr className="bg-surface-container-high/50 border-b border-zinc-800">
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">ID</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">Origin / Dest</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">Status</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">Cargo</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">Weight</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">Proposed Price</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800/50">
                                            {shipmentsLoading && (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                                        <span className="material-symbols-outlined animate-spin block mx-auto mb-2">progress_activity</span>
                                                        Loading shipments...
                                                    </td>
                                                </tr>
                                            )}
                                            {!shipmentsLoading && shipments.filter(s => ['PENDING', 'PENDING_SUPERADMIN_REVIEW', 'PENDING_FOR_PAY', 'AVAILABLE_FOR_ASSIGNMENT'].includes(s.status)).length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                                        No pending shipments found
                                                    </td>
                                                </tr>
                                            )}
                                            {shipments.filter(s => ['PENDING', 'PENDING_SUPERADMIN_REVIEW', 'PENDING_FOR_PAY', 'AVAILABLE_FOR_ASSIGNMENT'].includes(s.status)).map((s) => (
                                                <tr key={s.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-amber-400 text-sm">#SHP-{String(s.id).padStart(4, '0')}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-zinc-200">{s.origin}</div>
                                                        <div className="text-[10px] text-zinc-500">→ {s.destination}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${s.status === 'PENDING_SUPERADMIN_REVIEW' ? 'bg-amber-900/20 text-amber-200 border border-amber-900/30' :
                                                            s.status === 'PENDING_FOR_PAY' ? 'bg-purple-900/20 text-purple-200 border border-purple-900/30' :
                                                                'bg-zinc-800 text-zinc-400'
                                                            }`}>
                                                            {s.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-zinc-300">{s.cargoType}</td>
                                                    <td className="px-6 py-4 text-sm text-zinc-300">{s.weight} Tons</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-amber-400">
                                                        {s.proposedPrice ? `$${Number(s.proposedPrice).toLocaleString()}` : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-[11px] text-zinc-500">
                                                        {formatDate(s.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <table className="w-full min-w-[800px] text-left border-collapse table-fixed">
                                        <thead>
                                            <tr className="bg-surface-container-high/50 border-b border-zinc-800">
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 w-[20%]">Entity Name</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 w-[10%]">Type</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 w-[15%]">Email</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 w-[10%]">NIT</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 w-[10%]">Phone</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 w-[15%]">Address</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 w-[10%]">Registered</th>
                                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 text-right w-[10%]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800/50">
                                            {loading && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                                        <span className="material-symbols-outlined animate-spin block mx-auto mb-2">progress_activity</span>
                                                        Loading entities...
                                                    </td>
                                                </tr>
                                            )}
                                            {!loading && error && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-red-400">
                                                        <span className="material-symbols-outlined block mx-auto mb-2">error</span>
                                                        {error}
                                                    </td>
                                                </tr>
                                            )}
                                            {!loading && !error && filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                                        <span className="material-symbols-outlined block mx-auto mb-2">group_off</span>
                                                        No entities found
                                                    </td>
                                                </tr>
                                            )}
                                            {!loading && !error && filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 font-bold text-xs group-hover:scale-110 transition-transform shrink-0">
                                                                {getInitials(user.name)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-on-surface text-sm truncate">{user.name}</div>
                                                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">ID: #{String(user.id).padStart(4, '0')}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <RoleBadge role={user.role} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-zinc-300 truncate">{user.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-zinc-300 truncate">{user.nit || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-[11px] text-zinc-500 truncate">{user.phone || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-[11px] text-zinc-500 truncate">{user.address || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-[11px] text-zinc-500 whitespace-nowrap">{formatDate(user.createdAt)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => {
                                                                setConfirmUser(user);
                                                                setConfirmOpen(true);
                                                            }} className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all">
                                                                <span className="material-symbols-outlined text-[20px]">{user.isActive ? 'block' : 'check_circle'}</span>
                                                            </button>
                                                            <button onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsModalOpen(true);
                                                            }} className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all">
                                                                <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="bg-surface-container-high px-6 py-4 flex items-center justify-between border-t border-zinc-800">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                    {activeTab === 'PENDING_SHIPMENTS'
                                        ? `Total Pending: ${shipments.filter(s => ['PENDING', 'PENDING_SUPERADMIN_REVIEW', 'PENDING_FOR_PAY', 'AVAILABLE_FOR_ASSIGNMENT'].includes(s.status)).length}`
                                        : (loading ? '...' : `Showing ${filteredUsers.length} of ${users.length} Entries`)}
                                </p>
                            </div>
                        </section>


                    </div>
                    {/* Bento Grid */}
                    <div className="grid grid-cols-12 gap-4 lg:gap-6">
                        <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-6 lg:p-8 rounded-2xl flex flex-col justify-between border border-white/[0.02] min-h-[260px] lg:min-h-[300px] relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-amber-400 font-display text-2xl lg:text-3xl font-black italic tracking-tighter mb-4">PLATFORM GROWTH TELEMETRY</h3>
                                <p className="text-zinc-500 text-sm max-w-md">
                                    Entity registration has increased by <span className="text-on-surface font-bold">14.2%</span> over the last quarter.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-8 lg:gap-12 relative z-10 mt-4">
                                <div>
                                    <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-1">Total Entities</div>
                                    <div className="text-3xl lg:text-4xl font-display font-black text-on-surface">{loading ? '...' : users.length}</div>
                                </div>
                                <div>
                                    <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-1">Clients</div>
                                    <div className="text-3xl lg:text-4xl font-display font-black text-on-surface">
                                        {loading ? '...' : users.filter(u => u.role === 'CUSTOMER').length}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-1">Drivers</div>
                                    <div className="text-3xl lg:text-4xl font-display font-black text-on-surface">
                                        {loading ? '...' : users.filter(u => u.role === 'DRIVER').length}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-[#1b1b1b] to-surface p-6 lg:p-8 rounded-2xl border border-amber-400/20 shadow-[0_10px_40px_rgba(255,191,0,0.05)]">
                            <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-on-primary">bolt</span>
                            </div>
                            <h4 className="text-xl font-bold text-on-surface mb-2">QUICK REGISTRY</h4>
                            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-6">Direct Terminal Access</p>
                            <div className="space-y-4">
                                <div className="bg-surface-container-highest p-4 rounded-xl border-l-2 border-amber-400">
                                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">New Entity Alert</div>
                                    <div className="text-sm text-zinc-300 font-medium">
                                        {loading ? '...' : `${users.filter(u => u.role === 'CUSTOMER').length} clients registered`}
                                    </div>
                                </div>
                                <div className="bg-surface-container-highest/50 p-4 rounded-xl border-l-2 border-zinc-700">
                                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Drivers Online</div>
                                    <div className="text-sm text-zinc-400 font-medium">
                                        {loading ? '...' : `${users.filter(u => u.role === 'DRIVER').length} active drivers`}
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-8 border border-zinc-800 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-amber-400 hover:border-amber-400 transition-all">
                                View Audit Log
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="p-4 lg:p-8 mt-auto border-t border-zinc-800/30 flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#131313]">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Core Systems: Online</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-center sm:text-right">
                            © 2024 TRUX OPERATIONAL SYSTEMS • V 4.2.0-STABLE
                        </div>
                    </footer>
                </div>
            </main>

            <button className="fixed bottom-8 right-8 w-14 h-14 bg-amber-400 text-on-primary rounded-full shadow-[0_8px_30px_rgba(255,191,0,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-[100]">
                <span className="material-symbols-outlined text-3xl">terminal</span>
            </button>
            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
                onSuccess={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                    fetchUsers();
                }}
                user={selectedUser}
            />
            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setConfirmUser(null);
                }}
                onConfirm={handleToggleStatus}
                loading={confirmLoading}
                variant={confirmUser?.isActive ? 'danger' : 'success'}
                title={confirmUser?.isActive ? 'Deactivate Entity' : 'Activate Entity'}
                description={
                    confirmUser?.isActive
                        ? `Are you sure you want to deactivate ${confirmUser?.name}?`
                        : `Are you sure you want to activate ${confirmUser?.name}?`
                }
                confirmLabel={confirmUser?.isActive ? 'Deactivate' : 'Activate'}
            />
        </div>
    );
}
