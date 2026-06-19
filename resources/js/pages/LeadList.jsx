import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../layouts/AppLayout.jsx';
import {
    Button,
    Card,
    EmptyState,
    Field,
    Pagination,
    Select,
    StatusBadge,
    TextInput,
    formatDate,
} from '../components/ui.jsx';

const blankFilters = {
    status: '',
    campaign_id: '',
    assigned_to: '',
    source: '',
    keyword: '',
    page: 1,
};

export default function LeadList() {
    const { leads: paginator, meta, query } = usePage().props;
    const [filters, setFilters] = useState({
        status: query?.status || '',
        campaign_id: query?.campaign_id || '',
        assigned_to: query?.assigned_to || '',
        source: query?.source || '',
        keyword: query?.keyword || '',
        page: Number(query?.page || 1),
    });

    const leads = paginator?.data || [];
    const hasFilters = Object.entries(filters).some(([key, value]) => key !== 'page' && value);

    function visit(nextFilters) {
        router.get(
            '/leads',
            { ...nextFilters, limit: 10 },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function updateFilter(key, value) {
        const nextFilters = { ...filters, [key]: value, page: 1 };
        setFilters(nextFilters);
        visit(nextFilters);
    }

    function clearFilters() {
        setFilters(blankFilters);
        visit(blankFilters);
    }

    function changePage(page) {
        const nextFilters = { ...filters, page };
        setFilters(nextFilters);
        visit(nextFilters);
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#626260]">Lead workspace</p>
                        <h1 className="mt-1 text-3xl font-medium tracking-[-0.4px] text-[#111111]">Leads</h1>
                    </div>
                    {meta.permissions?.create ? (
                        <Link
                            className="inline-flex items-center justify-center rounded-lg bg-[#111111] px-[18px] py-2.5 text-sm font-medium text-white transition hover:bg-black"
                            href="/public/leads"
                        >
                            New Lead
                        </Link>
                    ) : null}
                </div>

                <Card className="p-4">
                    <div className="grid gap-3 md:grid-cols-5">
                        <Field label="Status">
                            <Select
                                value={filters.status}
                                onChange={(event) => updateFilter('status', event.target.value)}
                            >
                                <option value="">All statuses</option>
                                {(meta.filters?.statuses || []).map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label="Campaign">
                            <Select
                                value={filters.campaign_id}
                                onChange={(event) => updateFilter('campaign_id', event.target.value)}
                            >
                                <option value="">All campaigns</option>
                                {(meta.filters?.campaigns || []).map((campaign) => (
                                    <option key={campaign.id} value={campaign.id}>
                                        {campaign.name}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label="Assigned To">
                            <Select
                                value={filters.assigned_to}
                                onChange={(event) => updateFilter('assigned_to', event.target.value)}
                            >
                                <option value="">Anyone</option>
                                {(meta.filters?.sales || []).map((sales) => (
                                    <option key={sales.id} value={sales.id}>
                                        {sales.name}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label="Source">
                            <Select
                                value={filters.source}
                                onChange={(event) => updateFilter('source', event.target.value)}
                            >
                                <option value="">All sources</option>
                                {(meta.filters?.sources || []).map((source) => (
                                    <option key={source} value={source}>
                                        {source}
                                    </option>
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
                            <Button variant="secondary" onClick={clearFilters}>
                                Clear filters
                            </Button>
                        </div>
                    ) : null}
                </Card>

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
                                {leads.length
                                    ? leads.map((lead) => (
                                          <tr key={lead.id} className="align-top">
                                              <td className="px-4 py-4 font-medium text-[#111111]">{lead.full_name}</td>
                                              <td className="px-4 py-4 text-[#626260]">
                                                  <div>{lead.email || '-'}</div>
                                                  <div>{lead.phone || '-'}</div>
                                              </td>
                                              <td className="px-4 py-4 text-[#111111]">{lead.campaign?.name || '-'}</td>
                                              <td className="px-4 py-4">
                                                  <StatusBadge status={lead.status} />
                                              </td>
                                              <td className="px-4 py-4 text-[#626260]">
                                                  {lead.assigned_sales?.name || 'Unassigned'}
                                              </td>
                                              <td className="px-4 py-4 text-[#626260]">{lead.source}</td>
                                              <td className="px-4 py-4 text-[#626260]">
                                                  {formatDate(lead.created_at)}
                                              </td>
                                              <td className="px-4 py-4 text-right">
                                                  <Link
                                                      className="font-medium text-[#111111] underline-offset-4 hover:underline"
                                                      href={`/leads/${lead.id}`}
                                                  >
                                                      View
                                                  </Link>
                                              </td>
                                          </tr>
                                      ))
                                    : null}
                            </tbody>
                        </table>
                    </div>
                    {!leads.length ? (
                        <EmptyState
                            title={hasFilters ? 'No leads match these filters' : 'No leads yet'}
                            description={
                                hasFilters
                                    ? 'Adjust the filters or search term to broaden the list.'
                                    : 'New public form submissions and manually created leads will appear here.'
                            }
                        />
                    ) : null}
                    <Pagination
                        page={paginator?.current_page || 1}
                        lastPage={paginator?.last_page || 1}
                        onPage={changePage}
                    />
                </Card>
            </div>
        </AppLayout>
    );
}
