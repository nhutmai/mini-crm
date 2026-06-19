import React, { useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Inbox, PauseCircle, PlayCircle, Plus, Search } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import { Button, Card, Field, Pagination, Select, StatusBadge, formatDate, formatMoney } from '../components/ui.jsx';

const defaultFilters = {
    status: '',
    source: '',
    keyword: '',
    page: 1,
};

export default function CampaignList() {
    const { campaigns: paginator, meta, query } = usePage().props;
    const [filters, setFilters] = useState({
        status: query?.status || '',
        source: query?.source || '',
        keyword: query?.keyword || '',
        page: Number(query?.page || 1),
    });
    const [actionId, setActionId] = useState(null);
    const statusForm = useForm({ status: '' });
    const campaigns = paginator?.data || [];
    const hasFilters = Object.entries(filters).some(([key, value]) => key !== 'page' && value);

    function visit(nextFilters) {
        router.get(
            '/campaigns',
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
        setFilters(defaultFilters);
        visit(defaultFilters);
    }

    function changePage(page) {
        const nextFilters = { ...filters, page };
        setFilters(nextFilters);
        visit(nextFilters);
    }

    function updateStatus(campaign, status) {
        setActionId(campaign.id);
        statusForm
            .transform(() => ({ status }))
            .patch(`/campaigns/${campaign.id}/status`, {
                preserveScroll: true,
                onFinish: () => {
                    setActionId(null);
                    statusForm.reset();
                },
            });
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#626260]">Marketing operations</p>
                        <h1 className="mt-1 text-3xl font-medium tracking-[-0.4px] text-[#111111]">Campaigns</h1>
                    </div>
                    {meta.permissions?.create ? (
                        <Link
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111111] px-[18px] py-2.5 text-sm font-medium text-white transition hover:bg-black"
                            href="/campaigns/new"
                        >
                            <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
                            New Campaign
                        </Link>
                    ) : null}
                </div>

                <Card className="p-4">
                    <div className="grid gap-3 md:grid-cols-3">
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
                            <div className="relative">
                                <Search
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9c9fa5]"
                                    size={16}
                                    strokeWidth={1.8}
                                />
                                <input
                                    className="w-full rounded-lg border border-[#d3cec6] bg-white py-2 pl-9 pr-3 text-sm text-[#111111] outline-none transition placeholder:text-[#9c9fa5] focus:border-[#111111]"
                                    value={filters.keyword}
                                    onChange={(event) => updateFilter('keyword', event.target.value)}
                                    placeholder="Campaign name"
                                />
                            </div>
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
                                {campaigns.length
                                    ? campaigns.map((campaign) => (
                                          <tr key={campaign.id} className="align-top">
                                              <td className="px-4 py-4 font-medium text-[#111111]">{campaign.name}</td>
                                              <td className="px-4 py-4 text-[#626260]">{campaign.source}</td>
                                              <td className="px-4 py-4">
                                                  <StatusBadge type="campaign" status={campaign.status} />
                                              </td>
                                              <td className="px-4 py-4 text-[#626260]">
                                                  {formatMoney(campaign.budget)}
                                              </td>
                                              <td className="px-4 py-4 text-[#111111]">{campaign.leads_count}</td>
                                              <td className="px-4 py-4 text-[#626260]">
                                                  {campaign.owner?.name || '-'}
                                              </td>
                                              <td className="px-4 py-4 text-[#626260]">
                                                  <div>{formatDate(campaign.start_date)}</div>
                                                  <div>{formatDate(campaign.end_date)}</div>
                                              </td>
                                              <td className="px-4 py-4 text-right">
                                                  <div className="flex justify-end gap-3">
                                                      <Link
                                                          className="inline-flex items-center gap-1.5 font-medium text-[#111111] underline-offset-4 hover:underline"
                                                          href={`/leads?campaign_id=${campaign.id}`}
                                                      >
                                                          <Eye aria-hidden="true" size={15} strokeWidth={1.8} />
                                                          View
                                                      </Link>
                                                      {campaign.permissions?.edit ? (
                                                          <span className="text-[#626260]">Edit</span>
                                                      ) : null}
                                                      {campaign.permissions?.pause ? (
                                                          <button
                                                              className="inline-flex items-center gap-1.5 font-medium text-[#111111] underline-offset-4 hover:underline disabled:text-[#9c9fa5]"
                                                              disabled={actionId === campaign.id}
                                                              onClick={() => updateStatus(campaign, 'paused')}
                                                          >
                                                              <PauseCircle
                                                                  aria-hidden="true"
                                                                  size={15}
                                                                  strokeWidth={1.8}
                                                              />
                                                              Pause
                                                          </button>
                                                      ) : null}
                                                      {campaign.permissions?.activate ? (
                                                          <button
                                                              className="inline-flex items-center gap-1.5 font-medium text-[#111111] underline-offset-4 hover:underline disabled:text-[#9c9fa5]"
                                                              disabled={actionId === campaign.id}
                                                              onClick={() => updateStatus(campaign, 'active')}
                                                          >
                                                              <PlayCircle
                                                                  aria-hidden="true"
                                                                  size={15}
                                                                  strokeWidth={1.8}
                                                              />
                                                              Activate
                                                          </button>
                                                      ) : null}
                                                  </div>
                                              </td>
                                          </tr>
                                      ))
                                    : null}
                            </tbody>
                        </table>
                    </div>
                    {!campaigns.length ? (
                        <div className="px-6 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#d3cec6] bg-[#f5f1ec] text-[#626260]">
                                <Inbox aria-hidden="true" size={20} strokeWidth={1.8} />
                            </div>
                            <h3 className="mt-4 text-base font-medium text-[#111111]">
                                {hasFilters ? 'No campaigns match these filters' : 'No campaigns yet'}
                            </h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#626260]">
                                {hasFilters
                                    ? 'Try another source, status, or keyword.'
                                    : 'Campaigns will collect leads by source and owner once created.'}
                            </p>
                        </div>
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
