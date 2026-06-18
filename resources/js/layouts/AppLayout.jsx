import React from 'react';
import { Link } from '@inertiajs/react';

const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Campaigns', href: '/campaigns' },
    { label: 'Leads', href: '/leads' },
    { label: 'Reports', href: '/reports' },
];

export default function AppLayout({ children }) {
    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen bg-[#f5f1ec] text-[#111111]">
            <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
                <aside className="border-b border-[#d3cec6] bg-[#f5f1ec] px-4 py-4 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-6">
                    <Link href="/" className="block text-lg font-medium tracking-[-0.2px]">
                        Mini CRM
                    </Link>
                    <p className="mt-1 text-sm text-[#626260]">Marketing leads</p>

                    <nav className="mt-6 flex gap-2 overflow-x-auto text-sm font-medium text-[#626260] lg:flex-col lg:overflow-visible">
                        {navItems.map((item) => (
                            <Link
                                className={`whitespace-nowrap rounded-lg px-3 py-2 transition hover:bg-white hover:text-[#111111] ${
                                    item.href === currentPath ? 'bg-white text-[#111111]' : ''
                                }`}
                                href={item.href}
                                key={item.href}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="border-b border-[#d3cec6] bg-white/70 px-4 py-4 backdrop-blur lg:px-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-[#111111]">Lead operations</p>
                                <p className="text-xs text-[#626260]">Admin, marketing, and sales workspace</p>
                            </div>
                            <Link className="rounded-lg border border-[#d3cec6] bg-white px-3 py-2 text-sm font-medium text-[#111111]" href="/public/leads">
                                Public form
                            </Link>
                        </div>
                    </header>
                    <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
