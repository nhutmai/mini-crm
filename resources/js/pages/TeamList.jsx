import React, { useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Inbox, Plus, Search, Trash2, UserRoundCheck, UsersRound } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import {
    Button,
    Card,
    Field,
    Pagination,
    Select,
    TextArea,
    TextInput,
    firstError,
    formatDate,
} from '../components/ui.jsx';

const roleStyles = {
    admin: 'border-[#111111] bg-[#111111] text-white',
    marketer: 'border-blue-200 bg-blue-50 text-blue-800',
    sales: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

const statusStyles = {
    active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    inactive: 'border-[#d3cec6] bg-[#f5f1ec] text-[#626260]',
};

export default function TeamList() {
    const { teams: teamPaginator, members: memberPaginator, meta, query } = usePage().props;
    const activeTab = query?.tab || 'teams';
    const [teamFilters, setTeamFilters] = useState({
        tab: 'teams',
        keyword: activeTab === 'teams' ? query?.keyword || '' : '',
        page: Number(query?.page || 1),
    });
    const [memberFilters, setMemberFilters] = useState({
        tab: 'members',
        keyword: activeTab === 'members' ? query?.keyword || '' : '',
        role: query?.role || '',
        status: query?.status || '',
        team_id: query?.team_id || '',
        page: Number(query?.page || 1),
    });
    const createForm = useForm({ name: '', description: '' });
    const teams = teamPaginator?.data || [];
    const members = memberPaginator?.data || [];
    const isTeamsTab = activeTab === 'teams';

    function switchTab(tab) {
        router.get('/teams', { tab }, { preserveScroll: true, replace: true });
    }

    function visitTeams(nextFilters) {
        router.get(
            '/teams',
            { ...nextFilters, limit: 10 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function visitMembers(nextFilters) {
        router.get(
            '/teams',
            { ...nextFilters, limit: 10 },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function updateTeamFilter(key, value) {
        const nextFilters = { ...teamFilters, [key]: value, page: 1 };
        setTeamFilters(nextFilters);
        visitTeams(nextFilters);
    }

    function updateMemberFilter(key, value) {
        const nextFilters = { ...memberFilters, [key]: value, page: 1 };
        setMemberFilters(nextFilters);
        visitMembers(nextFilters);
    }

    function createTeam(event) {
        event.preventDefault();
        createForm.post('/teams', {
            preserveScroll: true,
            onSuccess: () => createForm.reset(),
        });
    }

    function deleteTeam(team) {
        router.delete(`/teams/${team.id}`, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[#626260]">Team workspace</p>
                        <h1 className="mt-1 text-3xl font-medium tracking-[-0.4px] text-[#111111]">Teams</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#626260]">
                            Manage team structure, team leads, and member assignments from one workspace.
                        </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#d3cec6] bg-white text-[#111111]">
                        <UsersRound aria-hidden="true" size={20} strokeWidth={1.8} />
                    </div>
                </div>

                <Card className="p-1">
                    <div className="grid grid-cols-2 gap-1 text-sm font-medium">
                        <button
                            className={`rounded-lg px-4 py-2.5 transition ${
                                isTeamsTab
                                    ? 'bg-[#111111] text-white'
                                    : 'text-[#626260] hover:bg-[#f5f1ec] hover:text-[#111111]'
                            }`}
                            onClick={() => switchTab('teams')}
                            type="button"
                        >
                            Teams
                        </button>
                        <button
                            className={`rounded-lg px-4 py-2.5 transition ${
                                !isTeamsTab
                                    ? 'bg-[#111111] text-white'
                                    : 'text-[#626260] hover:bg-[#f5f1ec] hover:text-[#111111]'
                            }`}
                            onClick={() => switchTab('members')}
                            type="button"
                        >
                            Members
                        </button>
                    </div>
                </Card>

                {isTeamsTab ? (
                    <TeamsTab
                        createForm={createForm}
                        deleteTeam={deleteTeam}
                        filters={teamFilters}
                        meta={meta}
                        onCreate={createTeam}
                        onFilter={updateTeamFilter}
                        onPage={(page) => {
                            const nextFilters = { ...teamFilters, page };
                            setTeamFilters(nextFilters);
                            visitTeams(nextFilters);
                        }}
                        paginator={teamPaginator}
                        teams={teams}
                    />
                ) : (
                    <MembersTab
                        filters={memberFilters}
                        members={members}
                        meta={meta}
                        onFilter={updateMemberFilter}
                        onPage={(page) => {
                            const nextFilters = { ...memberFilters, page };
                            setMemberFilters(nextFilters);
                            visitMembers(nextFilters);
                        }}
                        paginator={memberPaginator}
                    />
                )}
            </div>
        </AppLayout>
    );
}

function TeamsTab({ createForm, deleteTeam, filters, meta, onCreate, onFilter, onPage, paginator, teams }) {
    const hasFilters = Boolean(filters.keyword);

    return (
        <div className="space-y-6">
            {meta.permissions?.create_team ? (
                <Card className="p-5">
                    <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]" onSubmit={onCreate}>
                        <Field label="Team name" error={firstError(createForm.errors, 'name')}>
                            <TextInput
                                value={createForm.data.name}
                                onChange={(event) => createForm.setData('name', event.target.value)}
                                placeholder="Sales North"
                            />
                        </Field>
                        <Field label="Description" error={firstError(createForm.errors, 'description')}>
                            <TextArea
                                value={createForm.data.description}
                                onChange={(event) => createForm.setData('description', event.target.value)}
                                placeholder="Optional team context"
                            />
                        </Field>
                        <div className="flex items-end">
                            <Button className="gap-2" disabled={createForm.processing}>
                                <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
                                {createForm.processing ? 'Creating...' : 'Create team'}
                            </Button>
                        </div>
                    </form>
                </Card>
            ) : null}

            <Card className="p-4">
                <Field label="Search teams">
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
                            onChange={(event) => onFilter('keyword', event.target.value)}
                            placeholder="Team name"
                        />
                    </div>
                </Field>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#d3cec6] text-left text-sm">
                        <thead className="bg-[#f5f1ec] text-xs font-medium uppercase text-[#626260]">
                            <tr>
                                <th className="px-4 py-3">Team</th>
                                <th className="px-4 py-3">Lead</th>
                                <th className="px-4 py-3">Members</th>
                                <th className="px-4 py-3">Created by</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe6df] bg-white">
                            {teams.length
                                ? teams.map((team) => (
                                      <tr key={team.id} className="align-top">
                                          <td className="px-4 py-4">
                                              <p className="font-medium text-[#111111]">{team.name}</p>
                                              <p className="mt-1 max-w-md text-xs leading-5 text-[#626260]">
                                                  {team.description || 'No description'}
                                              </p>
                                          </td>
                                          <td className="px-4 py-4 text-[#626260]">{team.lead?.name || 'No lead'}</td>
                                          <td className="px-4 py-4 text-[#111111]">{team.members_count}</td>
                                          <td className="px-4 py-4 text-[#626260]">{team.creator?.name || '-'}</td>
                                          <td className="px-4 py-4 text-[#626260]">{formatDate(team.created_at)}</td>
                                          <td className="px-4 py-4 text-right">
                                              <div className="flex justify-end gap-3">
                                                  <Link
                                                      className="inline-flex items-center gap-1.5 font-medium text-[#111111] underline-offset-4 hover:underline"
                                                      href={`/teams/${team.id}`}
                                                  >
                                                      <Eye aria-hidden="true" size={15} strokeWidth={1.8} />
                                                      View
                                                  </Link>
                                                  {team.permissions?.delete ? (
                                                      <button
                                                          className="inline-flex items-center gap-1.5 font-medium text-red-700 underline-offset-4 hover:underline"
                                                          onClick={() => deleteTeam(team)}
                                                          type="button"
                                                      >
                                                          <Trash2 aria-hidden="true" size={15} strokeWidth={1.8} />
                                                          Delete
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

                {!teams.length ? (
                    <Empty
                        icon={Inbox}
                        title={hasFilters ? 'No teams match this search' : 'No teams yet'}
                        description={hasFilters ? 'Try another team name.' : 'Admin-created teams will appear here.'}
                    />
                ) : null}

                <Pagination page={paginator?.current_page || 1} lastPage={paginator?.last_page || 1} onPage={onPage} />
            </Card>
        </div>
    );
}

function MembersTab({ filters, members, meta, onFilter, onPage, paginator }) {
    const hasFilters = Object.entries(filters).some(([key, value]) => key !== 'tab' && key !== 'page' && value);

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <div className="grid gap-3 md:grid-cols-4">
                    <Field label="Team">
                        <Select value={filters.team_id} onChange={(event) => onFilter('team_id', event.target.value)}>
                            <option value="">All teams</option>
                            {(meta.filters?.teams || []).map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="Role">
                        <Select value={filters.role} onChange={(event) => onFilter('role', event.target.value)}>
                            <option value="">All roles</option>
                            {(meta.filters?.roles || []).map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="Status">
                        <Select value={filters.status} onChange={(event) => onFilter('status', event.target.value)}>
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
                                onChange={(event) => onFilter('keyword', event.target.value)}
                                placeholder="Name or email"
                            />
                        </div>
                    </Field>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#d3cec6] text-left text-sm">
                        <thead className="bg-[#f5f1ec] text-xs font-medium uppercase text-[#626260]">
                            <tr>
                                <th className="px-4 py-3">Member</th>
                                <th className="px-4 py-3">Team</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Campaigns</th>
                                <th className="px-4 py-3">Assigned leads</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe6df] bg-white">
                            {members.length
                                ? members.map((member) => (
                                      <tr key={member.id} className="align-top">
                                          <td className="px-4 py-4">
                                              <MemberIdentity member={member} />
                                          </td>
                                          <td className="px-4 py-4 text-[#626260]">{member.team?.name || 'No team'}</td>
                                          <td className="px-4 py-4">
                                              <RoleBadge role={member.role} />
                                          </td>
                                          <td className="px-4 py-4">
                                              <StatusBadge status={member.status} />
                                          </td>
                                          <td className="px-4 py-4 text-[#111111]">{member.campaigns_count ?? '-'}</td>
                                          <td className="px-4 py-4 text-[#111111]">
                                              {member.assigned_leads_count ?? '-'}
                                          </td>
                                      </tr>
                                  ))
                                : null}
                        </tbody>
                    </table>
                </div>

                {!members.length ? (
                    <Empty
                        icon={Inbox}
                        title={hasFilters ? 'No members match these filters' : 'No members yet'}
                        description={
                            hasFilters
                                ? 'Try another role, status, team, or keyword.'
                                : 'Members will appear here once users are created.'
                        }
                    />
                ) : null}

                <Pagination page={paginator?.current_page || 1} lastPage={paginator?.last_page || 1} onPage={onPage} />
            </Card>
        </div>
    );
}

function MemberIdentity({ member }) {
    return (
        <div className="flex items-center gap-3">
            <Avatar name={member.name} />
            <div className="min-w-0">
                <p className="font-medium text-[#111111]">{member.name}</p>
                <p className="mt-1 truncate text-xs text-[#626260]">{member.email}</p>
            </div>
        </div>
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
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${
                roleStyles[role] || roleStyles.sales
            }`}
        >
            <UserRoundCheck aria-hidden="true" size={13} strokeWidth={1.8} />
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

function Empty({ icon: Icon, title, description }) {
    return (
        <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#d3cec6] bg-[#f5f1ec] text-[#626260]">
                <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
            </div>
            <h3 className="mt-4 text-base font-medium text-[#111111]">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#626260]">{description}</p>
        </div>
    );
}
