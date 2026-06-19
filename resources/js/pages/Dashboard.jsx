import React from 'react';
import { Link } from '@inertiajs/react';
import { FileText, Megaphone, UsersRound } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import { Card } from '../components/ui.jsx';

const shortcuts = [
    {
        label: 'Lead list',
        title: 'Filter and qualify',
        href: '/leads',
        action: 'Open leads',
        icon: UsersRound,
        primary: true,
    },
    {
        label: 'Campaigns',
        title: 'Track sources',
        href: '/campaigns',
        action: 'Open campaigns',
        icon: Megaphone,
    },
    {
        label: 'Public form',
        title: 'Capture leads',
        href: '/public/leads',
        action: 'Open form',
        icon: FileText,
    },
];

export default function Dashboard() {
    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <p className="text-sm font-medium text-[#626260]">Mini CRM</p>
                    <h1 className="mt-1 text-3xl font-medium tracking-[-0.4px] text-[#111111]">Lead operations</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#626260]">
                        Review incoming leads, inspect sales follow-up, and monitor campaign intake from one workspace.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {shortcuts.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Card className="p-5" key={item.href}>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d3cec6] bg-[#f5f1ec] text-[#111111]">
                                    <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                                </div>
                                <p className="mt-4 text-sm text-[#626260]">{item.label}</p>
                                <h2 className="mt-2 text-xl font-medium text-[#111111]">{item.title}</h2>
                                <Link
                                    className={`mt-5 inline-flex items-center justify-center rounded-lg px-[18px] py-2.5 text-sm font-medium transition ${
                                        item.primary
                                            ? 'bg-[#111111] text-white hover:bg-black'
                                            : 'border border-[#d3cec6] bg-white text-[#111111] hover:bg-[#f5f1ec]'
                                    }`}
                                    href={item.href}
                                >
                                    {item.action}
                                </Link>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
