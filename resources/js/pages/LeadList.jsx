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
} from '../components/ui.jsx';

function initialFilters() {
    const params = new URLSearchParams(window.location.search);

    return {
        status: params.get('status') || '',
        campaign_id: params.get('campaign_id') || '',
        assigned_to: params.get('assigned_to') || '',
        source: params.get('source') || '',
        keyword: params.get('keyword') || '',
        page: Number(params.get('page') || 1),
    };
}

const blankFilters = {
    status: '',
    campaign_id: '',
    assigned_to: '',
    source: '',
    keyword: '',
    page: 1,
};

export default function LeadList() {
    const [filters, setFilters] = useState(initialFilters);
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const params = useMemo(() => queryString({ ...filters, limit: 10 }), [filters]);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError('');

        api(`/leads${params}`)
            .then((data) => mounted && setPayload(data))
            .catch((error) => mounted && setError(error.message))
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, [params]);

    const paginator = payload?.data;
    const leads = paginator?.data || [];
    const meta = payload?.meta || {};
    const hasFilters = Object.entries(filters).some(([key, value]) => key !== 'page' && value);

    function updateFilter(key, value) {
        setFilters((current) => ({ ...current, [key]: value, page: 1 }));
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-[#626260]">Lead workspace</p>
                    <h1 className="mt-1 text-3xl font-medium tracking-[-0.4px] text-[#111111]">Leads</h1>
                </div>
                {meta.permissions?.create ? <LinkButton href="/public/leads">New Lead</LinkButton> : null}
            </div>

            <Card className="p-4">
                <div className="grid gap-3 md:grid-cols-5">
                    <Field label="Status">
                        <Select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                            <option value="">All statuses</option>
                            {(meta.filters?.statuses || []).map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="Campaign">
                        <Select value={filters.campaign_id} onChange={(event) => updateFilter('campaign_id', event.target.value)}>
                            <option value="">All campaigns</option>
                            {(meta.filters?.campaigns || []).map((campaign) => (
                                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="Assigned To">
                        <Select value={filters.assigned_to} onChange={(event) => updateFilter('assigned_to', event.target.value)}>
                            <option value="">Anyone</option>
                            {(meta.filters?.sales || []).map((sales) => (
                                <option key={sales.id} value={sales.id}>{sales.name}</option>
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
                            placeholder="Name, email, phone"
                        />
                    </Field>
                </div>
                {hasFilters ? (
                    <div className="mt-4">
                        <Button variant="secondary" onClick={() => setFilters(blankFilters)}>Clear filters</Button>
                    </div>
                ) : null}
            </Card>

            {error ? <Alert tone="error">{error}</Alert> : null}

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#d3cec6] text-left text-sm">
                        <thead className="bg-[#f5f1ec] text-xs font-medium uppercase text-[#626260]">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Contact</th>
                                <th className="px-4 py-3">Campaign</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Assigned sales</th>
                                <th className="px-4 py-3">Source</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe6df] bg-white">
                            {loading ? (
                                <tr><td className="px-4 py-8 text-[#626260]" colSpan="8">Loading leads...</td></tr>
                            ) : leads.length ? leads.map((lead) => (
                                <tr key={lead.id} className="align-top">
                                    <td className="px-4 py-4 font-medium text-[#111111]">{lead.full_name}</td>
                                    <td className="px-4 py-4 text-[#626260]">
                                        <div>{lead.email || '-'}</div>
                                        <div>{lead.phone || '-'}</div>
                                    </td>
                                    <td className="px-4 py-4 text-[#111111]">{lead.campaign?.name || '-'}</td>
                                    <td className="px-4 py-4"><StatusBadge status={lead.status} /></td>
                                    <td className="px-4 py-4 text-[#626260]">{lead.assigned_sales?.name || 'Unassigned'}</td>
                                    <td className="px-4 py-4 text-[#626260]">{lead.source}</td>
                                    <td className="px-4 py-4 text-[#626260]">{formatDate(lead.created_at)}</td>
                                    <td className="px-4 py-4 text-right">
                                        <a className="font-medium text-[#111111] underline-offset-4 hover:underline" href={`/leads/${lead.id}`}>
                                            View
                                        </a>
                                    </td>
                                </tr>
                            )) : null}
                        </tbody>
                    </table>
                </div>
                {!loading && !leads.length ? (
                    <EmptyState
                        title={hasFilters ? 'No leads match these filters' : 'No leads yet'}
                        description={hasFilters ? 'Adjust the filters or search term to broaden the list.' : 'New public form submissions and manually created leads will appear here.'}
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
