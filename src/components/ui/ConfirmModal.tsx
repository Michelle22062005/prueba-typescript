'use client'

/**
 * ConfirmModal provides a reusable confirmation dialog for destructive,
 * warning, or success actions. The parent controls visibility, labels,
 * loading state, and the callback executed when the user confirms.
 */
type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'success';
    loading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger',
    loading = false,
}: ConfirmModalProps) {
    // Hidden modals return nothing so they do not affect the page layout.
    if (!isOpen) return null;

    // Variant styles keep the dialog markup reusable across different actions.
    const variantStyles = {
        danger: {
            icon: 'block',
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-400',
            button: 'bg-red-500 hover:bg-red-600',
        },
        warning: {
            icon: 'warning',
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-400',
            button: 'bg-amber-500 hover:bg-amber-600',
        },
        success: {
            icon: 'check_circle',
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            button: 'bg-emerald-500 hover:bg-emerald-600',
        },
    };

    // Select the style set that matches the current action variant.
    const styles = variantStyles[variant];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 bg-[#1b1b1b] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">

                {/* Icon and title */}
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                        <span className={`material-symbols-outlined ${styles.iconColor}`}>
                            {styles.icon}
                        </span>
                    </div>
                    <h2 className="text-on-surface font-bold text-sm uppercase tracking-widest">{title}</h2>
                </div>

                {/* Description */}
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{description}</p>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${styles.button}`}
                    >
                        {loading && (
                            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        )}
                        {loading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
