import React from 'react';
import { createRoot } from 'react-dom/client';
import AppLayout from './layouts/AppLayout.jsx';
import CampaignList from './pages/CampaignList.jsx';
import LeadDetail from './pages/LeadDetail.jsx';
import LeadList from './pages/LeadList.jsx';
import PublicLeadForm from './pages/PublicLeadForm.jsx';
import { Card, LinkButton } from './components/ui.jsx';

const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Campaigns', href: '/campaigns' },
    { label: 'Leads', href: '/leads' },
    { label: 'Reports', href: '/reports' },
];

function App() {
    const path = window.location.pathname;

    if (path.startsWith('/public/leads')) {
        const campaignId = path.match(/^\/public\/leads\/(\d+)/)?.[1];

        return <PublicLeadForm campaignId={campaignId} />;
    }

    const leadId = path.match(/^\/leads\/(\d+)/)?.[1];
    const page = leadId
        ? <LeadDetail leadId={leadId} />
        : path.startsWith('/leads')
            ? <LeadList />
            : path.startsWith('/campaigns')
                ? <CampaignList />
                : <Dashboard />;

    return (
        <AppLayout navItems={navItems}>
            {page}
        </AppLayout>
    );
}

function Dashboard() {
    return (
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
                    <LinkButton className="mt-5" href="/leads">Open leads</LinkButton>
                </Card>
                <Card className="p-5">
                    <p className="text-sm text-[#626260]">Campaigns</p>
                    <h2 className="mt-2 text-xl font-medium text-[#111111]">Track sources</h2>
                    <LinkButton className="mt-5" href="/campaigns" variant="secondary">Open campaigns</LinkButton>
                </Card>
                <Card className="p-5">
                    <p className="text-sm text-[#626260]">Public form</p>
                    <h2 className="mt-2 text-xl font-medium text-[#111111]">Capture leads</h2>
                    <LinkButton className="mt-5" href="/public/leads" variant="secondary">Open form</LinkButton>
                </Card>
            </div>
        </div>
    );
}

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
