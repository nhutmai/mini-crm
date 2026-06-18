import React from 'react';
import { createRoot } from 'react-dom/client';
import AppLayout from './layouts/AppLayout.jsx';

const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Campaigns', href: '/campaigns' },
    { label: 'Leads', href: '/leads' },
    { label: 'Reports', href: '/reports' },
];

function App() {
    return (
        <AppLayout navItems={navItems}>
            <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-center px-6 py-12">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Mini CRM
                    </p>
                    <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">
                        Khung Laravel + React đã sẵn sàng.
                    </h1>
                    <p className="mt-5 text-lg leading-8 text-slate-600">
                        Phase 1 tạo nền project, cấu hình Vite, mount React trong Blade và chuẩn bị cấu trúc thư mục để triển khai các module CRM tiếp theo.
                    </p>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                    <StatusCard title="Laravel" value="Skeleton" />
                    <StatusCard title="React" value="Mounted" />
                    <StatusCard title="Vite" value="Configured" />
                </div>
            </section>
        </AppLayout>
    );
}

function StatusCard({ title, value }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
    );
}

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
