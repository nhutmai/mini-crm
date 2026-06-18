import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../layouts/AppLayout.jsx';
import { Card } from '../components/ui.jsx';

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
                    <Card className="p-5">
                        <p className="text-sm text-[#626260]">Lead list</p>
                        <h2 className="mt-2 text-xl font-medium text-[#111111]">Filter and qualify</h2>
                        <Link className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#111111] px-[18px] py-2.5 text-sm font-medium text-white transition hover:bg-black" href="/leads">Open leads</Link>
                    </Card>
                    <Card className="p-5">
                        <p className="text-sm text-[#626260]">Campaigns</p>
                        <h2 className="mt-2 text-xl font-medium text-[#111111]">Track sources</h2>
                        <Link className="mt-5 inline-flex items-center justify-center rounded-lg border border-[#d3cec6] bg-white px-[18px] py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#f5f1ec]" href="/campaigns">Open campaigns</Link>
                    </Card>
                    <Card className="p-5">
                        <p className="text-sm text-[#626260]">Public form</p>
                        <h2 className="mt-2 text-xl font-medium text-[#111111]">Capture leads</h2>
                        <Link className="mt-5 inline-flex items-center justify-center rounded-lg border border-[#d3cec6] bg-white px-[18px] py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#f5f1ec]" href="/public/leads">Open form</Link>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
