import React, { useEffect, useMemo, useState } from 'react';
import { api, queryString } from '../lib/api.js';
import {
    Alert,
    Button,
    Card,
    EmptyState,
    Field,
    LinkButton,
    Pagination,
    Select,
    StatusBadge,
    TextInput,
    formatDate,
    formatMoney,
} from '../components/ui.jsx';

const defaultFilters = {
    status: '',
    source: '',
    keyword: '',
    page: 1,
};

export default function CampaignList() {
    const [filters, setFilters] = useState(defaultFilters);
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionId, setActionId] = useState(null);

    const params = useMemo(() => queryString({ ...filters, limit: 10 }), [filters]);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError('');

        api(`/campaigns${params}`)
            .then((data) => mounted && setPayload(data))
            .catch((error) => mounted && setError(error.message))
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, [params]);

    const paginator = payload?.data;
    const campaigns = paginator?.data || [];
    const meta = payload?.meta || {};
    const hasFilters = Object.entries(filters).some(([key, value]) => key !== 'page' && value);

    function updateFilter(key, value) {
        setFilters((current) => ({ ...current, [key]: value, page: 1 }));
    }

    async function updateStatus(campaign, status) {
        setActionId(campaign.id);
        setError('');
        setSuccess('');

        try {
            await api(`/campaigns/${campaign.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
            const data = await api(`/campaigns${params}`);
            setPayload(data);
            setSuccess(`${campaign.name} is now ${status}.`);
        } catch (error) {
            setError(error.message);
        } finally {
            setActionId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-[#626260]">Marketing operations</p>
                    <h1 className="mt-1 text-3xl font-medium tracking-[-0.4px] text-[#111111]">Campaigns</h1>
                </div>
                {meta.permissions?.create ? <LinkButton href="/campaigns/new">New Campaign</LinkButton> : null}
            </div>

            <Card className="p-4">
                <div className="grid gap-3 md:grid-cols-3">
                    <Field label="Status">
                        <Select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                            <option value="">All statuses</option>
                            {(meta.filters?.statuses || []).map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="Source">
                        <Select value={filters.source} onChange={(event) => updateFilter('source', event.target.value)}>
                            <option value="">All sources</option>
                            {(meta.filters?.sources || []).map((source) => (
                                <option key={source} value={source}>{source}</option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="Search">
                        <TextInput
                            value={filters.keyword}
                            onChange={(event) => updateFilter('keyword', event.target.value)}
                            placeholder="Campaign name"
                        />
                    </Field>
                </div>
                {hasFilters ? (
                    <div className="mt-4">
                        <Button variant="secondary" onClick={() => setFilters(defaultFilters)}>Clear filters</Button>
                    </div>
                ) : null}
            </Card>

            {error ? <Alert tone="error">{error}</Alert> : null}
            {success ? <Alert>{success}</Alert> : null}

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#d3cec6] text-left text-sm">
                        <thead className="bg-[#f5f1ec] text-xs font-medium uppercase text-[#626260]">
                            <tr>
                                <th className="px-4 py-3">Campaign name</th>
                                <th className="px-4 py-3">Source</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Budget</th>
                                <th className="px-4 py-3">Leads</th>
                                <th className="px-4 py-3">Created by</th>
                                <th className="px-4 py-3">Dates</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe6df] bg-white">
                            {loading ? (
                                <tr><td className="px-4 py-8 text-[#626260]" colSpan="8">Loading campaigns...</td></tr>
                            ) : campaigns.length ? campaigns.map((campaign) => (
                                <tr key={campaign.id} className="align-top">
                                    <td className="px-4 py-4 font-medium text-[#111111]">{campaign.name}</td>
                                    <td className="px-4 py-4 text-[#626260]">{campaign.source}</td>
                                    <td className="px-4 py-4"><StatusBadge type="campaign" status={campaign.status} /></td>
                                    <td className="px-4 py-4 text-[#626260]">{formatMoney(campaign.budget)}</td>
                                    <td className="px-4 py-4 text-[#111111]">{campaign.leads_count}</td>
                                    <td className="px-4 py-4 text-[#626260]">{campaign.owner?.name || '-'}</td>
                                    <td className="px-4 py-4 text-[#626260]">
                                        <div>{formatDate(campaign.start_date)}</div>
                                        <div>{formatDate(campaign.end_date)}</div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <a className="font-medium text-[#111111] underline-offset-4 hover:underline" href={`/leads?campaign_id=${campaign.id}`}>
                                                View
                                            </a>
                                            {campaign.permissions?.edit ? <span className="text-[#626260]">Edit</span> : null}
                                            {campaign.permissions?.pause ? (
                                                <button
                                                    className="font-medium text-[#111111] underline-offset-4 hover:underline disabled:text-[#9c9fa5]"
                                                    disabled={actionId === campaign.id}
                                                    onClick={() => updateStatus(campaign, 'paused')}
                                                >
                                                    Pause
                                                </button>
                                            ) : null}
                                            {campaign.permissions?.activate ? (
                                                <button
                                                    className="font-medium text-[#111111] underline-offset-4 hover:underline disabled:text-[#9c9fa5]"
                                                    disabled={actionId === campaign.id}
                                                    onClick={() => updateStatus(campaign, 'active')}
                                                >
                                                    Activate
                                                </button>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            )) : null}
                        </tbody>
                    </table>
                </div>
                {!loading && !campaigns.length ? (
                    <EmptyState
                        title={hasFilters ? 'No campaigns match these filters' : 'No campaigns yet'}
                        description={hasFilters ? 'Try another source, status, or keyword.' : 'Campaigns will collect leads by source and owner once created.'}
                    />
                ) : null}
                <Pagination
                    page={paginator?.current_page || 1}
                    lastPage={paginator?.last_page || 1}
                    onPage={(page) => setFilters((current) => ({ ...current, page }))}
                />
            </Card>
        </div>
    );
}
