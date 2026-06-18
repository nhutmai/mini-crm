import React from 'react';

export default function AppLayout({ children, navItems }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
                    <a href="/" className="text-lg font-semibold">
                        Mini CRM
                    </a>

                    <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
                        {navItems.map((item) => (
                            <a
                                className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                                href={item.href}
                                key={item.href}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </header>

            <main>{children}</main>
        </div>
    );
}
