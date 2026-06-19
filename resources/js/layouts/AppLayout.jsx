import React, { useState, useEffect, useRef } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import {
    ChartNoAxesColumn,
    ChevronDown,
    CircleAlert,
    CircleCheck,
    FileText,
    LayoutDashboard,
    LogOut,
    Megaphone,
    Settings,
    UserCog,
    UsersRound,
    X,
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Campaigns', href: '/campaigns', icon: Megaphone },
    { label: 'Leads', href: '/leads', icon: UsersRound },
    { label: 'Reports', href: '/reports', icon: ChartNoAxesColumn },
    { label: 'Settings', href: '/profile', icon: Settings },
];

export default function AppLayout({ children }) {
    const currentPath = window.location.pathname;
    const { auth, flash } = usePage().props;
    const logoutForm = useForm({});
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const user = auth?.user;
    const userName = user?.name || 'Demo User';
    const userEmail = user?.email || 'demo@example.com';
    const initials = userName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    const menuRef = useRef(null);

    function logout() {
        logoutForm.post('/logout');
    }

    useEffect(() => {
        const nextToast = flash?.success
            ? { message: flash.success, tone: 'success' }
            : flash?.error
              ? { message: flash.error, tone: 'error' }
              : null;

        if (!nextToast) {
            return undefined;
        }

        setToast(nextToast);

        const timeoutId = setTimeout(() => {
            setToast(null);
        }, 4200);

        return () => clearTimeout(timeoutId);
    }, [flash?.success, flash?.error]);

    // Close user menu when clicking outside, pressing Escape, or after 5 seconds of inactivity
    useEffect(() => {
        if (!isUserMenuOpen) return;
        function inactiveMenu() {
            setIsUserMenuOpen(false);
        }

        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                inactiveMenu();
            }
        }

        function handleEscapePress(event) {
            if (event.key === 'Escape') {
                inactiveMenu();
            }
        }
        const timeoutId = setTimeout(inactiveMenu, 3000);

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleEscapePress);
        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscapePress);
        };
    }, [isUserMenuOpen]);

    return (
        <div className="min-h-screen bg-[#f5f1ec] text-[#111111]">
            {toast ? <Toast message={toast.message} onClose={() => setToast(null)} tone={toast.tone} /> : null}

            <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
                <aside className="border-b border-[#d3cec6] bg-[#f5f1ec] px-4 py-4 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-6">
                    <Link href="/" className="block text-lg font-medium tracking-[-0.2px]">
                        Mini CRM
                    </Link>
                    <p className="mt-1 text-sm text-[#626260]">Marketing leads</p>

                    <nav className="mt-6 flex gap-2 overflow-x-auto text-sm font-medium text-[#626260] lg:flex-col lg:overflow-visible">
                        {navItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 transition hover:bg-white hover:text-[#111111] ${
                                        item.href === currentPath ? 'bg-white text-[#111111]' : ''
                                    }`}
                                    href={item.href}
                                    key={item.href}
                                >
                                    <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="border-b border-[#d3cec6] bg-white/70 px-4 py-4 backdrop-blur lg:px-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-[#111111]">Lead operations</p>
                                <p className="text-xs text-[#626260]">Admin, marketing, and sales workspace</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#d3cec6] bg-white px-3 py-2 text-sm font-medium text-[#111111]"
                                    href="/public/leads"
                                >
                                    <FileText aria-hidden="true" size={16} strokeWidth={1.8} />
                                    Public form
                                </Link>

                                <div className="relative" ref={menuRef}>
                                    <button
                                        className="flex items-center gap-3 rounded-lg border border-[#d3cec6] bg-white px-2.5 py-2 text-left transition hover:bg-[#f5f1ec]"
                                        onClick={() => setIsUserMenuOpen((value) => !value)}
                                        type="button"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-xs font-medium text-white">
                                            {initials}
                                        </span>
                                        <span className="hidden min-w-0 sm:block">
                                            <span className="block max-w-36 truncate text-sm font-medium text-[#111111]">
                                                {userName}
                                            </span>
                                            <span className="block max-w-36 truncate text-xs text-[#626260]">
                                                {userEmail}
                                            </span>
                                        </span>
                                        <ChevronDown
                                            aria-hidden="true"
                                            className={`text-[#626260] transition ${
                                                isUserMenuOpen ? 'rotate-180' : ''
                                            }`}
                                            size={16}
                                            strokeWidth={1.8}
                                        />
                                    </button>

                                    {isUserMenuOpen ? (
                                        <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-[#d3cec6] bg-white">
                                            <div className="border-b border-[#ebe6df] p-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-sm font-medium text-white">
                                                        {initials}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-[#111111]">
                                                            {userName}
                                                        </p>
                                                        <p className="truncate text-xs text-[#626260]">{userEmail}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2">
                                                <Link
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#f5f1ec]"
                                                    href="/profile"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <UserCog aria-hidden="true" size={16} strokeWidth={1.8} />
                                                    Profile settings
                                                </Link>
                                                <button
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50"
                                                    disabled={logoutForm.processing}
                                                    onClick={logout}
                                                    type="button"
                                                >
                                                    <LogOut aria-hidden="true" size={16} strokeWidth={1.8} />
                                                    {logoutForm.processing ? 'Logging out...' : 'Logout'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
                </div>
            </div>
        </div>
    );
}

function Toast({ message, tone, onClose }) {
    const isError = tone === 'error';
    const Icon = isError ? CircleAlert : CircleCheck;

    return (
        <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl border border-[#d3cec6] bg-white p-4 text-[#111111]">
            <div className="flex items-start gap-3">
                <Icon
                    aria-hidden="true"
                    className={`mt-0.5 ${isError ? 'text-red-600' : 'text-emerald-600'}`}
                    size={18}
                    strokeWidth={1.9}
                />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{isError ? 'Action needs attention' : 'Action completed'}</p>
                    <p className="mt-1 text-sm leading-6 text-[#626260]">{message}</p>
                </div>
                <button
                    aria-label="Close notification"
                    className="rounded-md p-1 text-[#626260] transition hover:bg-[#f5f1ec] hover:text-[#111111]"
                    onClick={onClose}
                    type="button"
                >
                    <X aria-hidden="true" size={16} strokeWidth={1.8} />
                </button>
            </div>
        </div>
    );
}
