/**
 * authLayout wraps login and registration pages.
 * It keeps the form on the left and a branded logistics visual on desktop.
 */
export default function authLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left panel - form content */}
            <section className="w-full lg:w-[40%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-[#121212] relative z-10">
                {/* Branding */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[linear-gradient(135deg,_#ffe2ab_0%,_#ffbf00_100%)] rounded-lg rotate-45 flex items-center justify-center">
                            <span className="material-symbols-outlined -rotate-45 text-[#402d00] text-lg font-bold">rocket_launch</span>
                        </div>
                        <span className="text-white font-black text-xl tracking-tight">TRUX</span>
                    </div>
                    <p className="text-xs text-neutral-500 uppercase tracking-[0.2em]">Smart Logistics</p>
                </div>

                {/* Child pages provide either the login or register form. */}
                {children}

                <p className="mt-12 text-xs text-neutral-600">
                    &copy; 2026 TRUX Logistics
                </p>
            </section>

            {/* Right panel - decorative logistics visual */}
            <section className="hidden lg:block lg:w-[60%] relative overflow-hidden bg-black">

                <div className="absolute inset-0 z-0">
                    <img alt="logistics center" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" data-alt="dramatic wide angle shot of a futuristic dark logistics warehouse with amber motion blur light trails of moving transport trucks" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYQ9_5YvdxS-Ypf_9Ebo07He6RUd0BUYz4hr7Ar4sz8WtK2Cw22ViuQ8To_Z5QZy6sRp1EWMG-ZfwGrHZm5tO6e9YbeUL0uJVFQESCR0L9tqxEV8PGqwMIExdE-F87JHsC7btHrpOfR5k-n1nVDD5bKJQ4fHCBlUVsxVi7jl0MMGrj_tuCZqx0NJVVEtFRIFGmgcuqaG9xMqBSH-SkBaLjo3B7mCkFZ5SaB1B4XzJYeFoV7KsWRgl2HOlmWD-B8YMn40upGo-xpv_q" />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60"></div>
                </div>
                {/* Floating telemetry modules */}
                <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
                    <div className="grid grid-cols-6 grid-rows-6 gap-4 w-full h-full">
                        {/* Main telemetry hero */}
                        <div className="col-start-2 col-end-5 row-start-2 row-end-4 glass-panel bg-[#303030] rounded-xl p-8 border border-white/5 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <span className="material-symbols-outlined text-primary-container text-4xl">dynamic_feed</span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-container bg-primary-container/10 px-3 py-1 rounded-full">Real-time Feed</span>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.1em] mb-1">Global Fleet Momentum</div>
                                <div className="text-6xl font-black tracking-tighter text-white italic">84.2<span className="text-2xl not-italic ml-2 text-primary-container">Mph</span></div>
                            </div>
                        </div>
                        {/* Secondary metric */}
                        <div className="col-start-5 col-end-7 row-start-3 row-end-5 glass-panel bg-[#303030] rounded-xl p-6 border border-white/5 self-end">
                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.1em] mb-4">Route Efficiency</div>
                            <div className="flex items-end gap-2">
                                <div className="h-16 w-2 bg-primary-container rounded-t-full"></div>
                                <div className="h-24 w-2 bg-primary-container rounded-t-full"></div>
                                <div className="h-12 w-2 bg-primary-container/20 rounded-t-full"></div>
                                <div className="h-20 w-2 bg-primary-container rounded-t-full"></div>
                                <div className="ml-4 text-4xl font-black text-on-surface">98%</div>
                            </div>
                        </div>
                        {/* Small decorative node */}
                        <div className="col-start-2 col-end-3 row-start-4 row-end-5 glass-panel bg-[#303030] rounded-xl flex items-center justify-center border border-white/5">
                            <span className="material-symbols-outlined text-neutral-500" data-weight="fill">hub</span>
                        </div>
                        {/* Visual accent line */}
                        <div className="col-start-1 col-end-7 row-start-6 row-end-7 flex items-center px-12">
                            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary-container/30 to-transparent"></div>
                        </div>
                    </div>
                </div>
                {/* Bottom-left brand tag */}
                <div className="absolute bottom-12 left-12 z-20 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-container flex items-center justify-center rounded-xl rotate-45">
                        <span className="material-symbols-outlined -rotate-45 text-on-primary font-bold">rocket_launch</span>
                    </div>
                    <div>
                        <div className="text-xs font-black tracking-widest text-on-surface uppercase">Kinetic Precision</div>
                        <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.2em]">Next-Gen Logistic OS</div>
                    </div>
                </div>
            </section>
        </div>
    );
}
