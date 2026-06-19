import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Inbox, Search, ShieldCheck, UserRoundCheck, UsersRound } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import { Button, Card, Field, Pagination, Select, formatDate } from '../components/ui.jsx';

const defaultFilters = {
    role: '',
    status: '',
    keyword: '',
    page: 1,
};

const roleStyles = {
    admin: 'border-[#111111] bg-[#111111] text-white',
    marketer: 'border-blue-200 bg-blue-50 text-blue-800',
    sales: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

const statusStyles = {
    active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    inactive: 'border-[#d3cec6] bg-[#f5f1ec] text-[#626260]',
};

export default function Members() {
    const { members: paginator, meta, query } = usePage().props;
    const [filters, setFilters] = useState({
        role: query?.role || '',
        status: query?.status || '',
        keyword: query?.keyword || '',
        page: Number(query?.page || 1),
    });

    const members = paginator?.data || [];
    const hasFilters = Object.entries(filters).some(([key, value]) => key !== 'page' && value);

    function visit(nextFilters) {
        router.get(
            '/members',
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

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#626260]">Team workspace</p>
                        <h1 className="mt-1 text-3xl font-medium tracking-[-0.4px] text-[#111111]">Members</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#626260]">
                            Review users by role, status, owned campaigns, and assigned lead workload.
                        </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#d3cec6] bg-white text-[#111111]">
                        <UsersRound aria-hidden="true" size={20} strokeWidth={1.8} />
                    </div>
                </div>

                <Card className="p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        <Field label="Role">
                            <Select value={filters.role} onChange={(event) => updateFilter('role', event.target.value)}>
                                <option value="">All roles</option>
                                {(meta.filters?.roles || []).map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </Select>
                        </Field>
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
                                    placeholder="Name or email"
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
                                    <th className="px-4 py-3">Member</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Campaigns</th>
                                    <th className="px-4 py-3">Assigned leads</th>
                                    <th className="px-4 py-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ebe6df] bg-white">
                                {members.length
                                    ? members.map((member) => (
                                          <tr key={member.id} className="align-top">
                                              <td className="px-4 py-4">
                                                  <div className="flex items-center gap-3">
                                                      <Avatar name={member.name} />
                                                      <div className="min-w-0">
                                                          <p className="font-medium text-[#111111]">{member.name}</p>
                                                          <p className="mt-1 truncate text-xs text-[#626260]">
                                                              {member.email}
                                                          </p>
                                                      </div>
                                                  </div>
                                              </td>
                                              <td className="px-4 py-4">
                                                  <RoleBadge role={member.role} />
                                              </td>
                                              <td className="px-4 py-4">
                                                  <StatusBadge status={member.status} />
                                              </td>
                                              <td className="px-4 py-4 text-[#111111]">{member.campaigns_count}</td>
                                              <td className="px-4 py-4 text-[#111111]">
                                                  {member.assigned_leads_count}
                                              </td>
                                              <td className="px-4 py-4 text-[#626260]">
                                                  {formatDate(member.created_at)}
                                              </td>
                                          </tr>
                                      ))
                                    : null}
                            </tbody>
                        </table>
                    </div>

                    {!members.length ? (
                        <div className="px-6 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#d3cec6] bg-[#f5f1ec] text-[#626260]">
                                <Inbox aria-hidden="true" size={20} strokeWidth={1.8} />
                            </div>
                            <h3 className="mt-4 text-base font-medium text-[#111111]">
                                {hasFilters ? 'No members match these filters' : 'No members yet'}
                            </h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#626260]">
                                {hasFilters
                                    ? 'Try another role, status, or search term.'
                                    : 'Seeded users and future team members will appear here.'}
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

function Avatar({ name }) {
    const initials = (name || '?')
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111111] text-xs font-medium text-white">
            {initials}
        </span>
    );
}

function RoleBadge({ role }) {
    const Icon = role === 'admin' ? ShieldCheck : UserRoundCheck;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${
                roleStyles[role] || roleStyles.sales
            }`}
        >
            <Icon aria-hidden="true" size={13} strokeWidth={1.8} />
            {role || 'unknown'}
        </span>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${
                statusStyles[status] || statusStyles.inactive
            }`}
        >
            {status || 'unknown'}
        </span>
    );
}
