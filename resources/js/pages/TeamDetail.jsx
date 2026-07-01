import React, { useMemo } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Inbox, MailPlus, Send, Trash2, UserMinus, UserPlus, UserRoundCheck } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import { Button, Card, Field, Select, TextInput, firstError, formatDate } from '../components/ui.jsx';

const roleStyles = {
    admin: 'border-[#111111] bg-[#111111] text-white',
    marketer: 'border-blue-200 bg-blue-50 text-blue-800',
    sales: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

const statusStyles = {
    active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    inactive: 'border-[#d3cec6] bg-[#f5f1ec] text-[#626260]',
};

export default function TeamDetail() {
    const { team, meta } = usePage().props;
    const leadForm = useForm({ lead_id: team.lead?.id || '' });
    const addMemberForm = useForm({ member_id: '', transfer: false });
    const inviteForm = useForm({ email: '' });

    const selectedMember = useMemo(
        () => (meta.member_options || []).find((member) => String(member.id) === String(addMemberForm.data.member_id)),
        [addMemberForm.data.member_id, meta.member_options],
    );
    const needsTransfer = selectedMember?.team_id && selectedMember.team_id !== team.id;
    const memberLeadOptions = team.members || [];

    function updateLead(event) {
        event.preventDefault();
        leadForm
            .transform((data) => ({ lead_id: data.lead_id || null }))
            .patch(`/teams/${team.id}/lead`, { preserveScroll: true });
    }

    function addMember(event) {
        event.preventDefault();
        addMemberForm.post(`/teams/${team.id}/members`, {
            preserveScroll: true,
            onSuccess: () => addMemberForm.reset(),
        });
    }

    function inviteMember(event) {
        event.preventDefault();
        inviteForm.post(`/teams/${team.id}/invites`, {
            preserveScroll: true,
            onSuccess: () => inviteForm.reset(),
        });
    }

    function removeMember(member) {
        router.delete(`/teams/${team.id}/members/${member.id}`, { preserveScroll: true });
    }

    function deleteTeam() {
        router.delete(`/teams/${team.id}`, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#626260] underline-offset-4 hover:underline"
                            href="/teams"
                        >
                            <ArrowLeft aria-hidden="true" size={15} strokeWidth={1.8} />
                            Back to teams
                        </Link>
                        <h1 className="mt-2 text-3xl font-medium tracking-[-0.4px] text-[#111111]">{team.name}</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#626260]">
                            {team.description || 'No description has been added for this team.'}
                        </p>
                    </div>
                    {meta.permissions?.delete_team ? (
                        <Button className="gap-2" variant="danger" onClick={deleteTeam}>
                            <Trash2 aria-hidden="true" size={16} strokeWidth={1.8} />
                            Delete team
                        </Button>
                    ) : null}
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <Card className="p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-medium text-[#111111]">Team lead</h2>
                                    <p className="mt-2 text-sm leading-6 text-[#626260]">
                                        Only Admin can assign or remove the lead. The lead must already be a member of
                                        this team.
                                    </p>
                                </div>
                                <span className="rounded-md border border-[#d3cec6] bg-[#f5f1ec] px-2.5 py-1 text-xs font-medium text-[#626260]">
                                    {team.members_count} members
                                </span>
                            </div>

                            <div className="mt-5 rounded-lg border border-[#ebe6df] p-4">
                                {team.lead ? (
                                    <MemberIdentity member={team.lead} />
                                ) : (
                                    <div className="flex items-center gap-3 text-[#626260]">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f1ec]">
                                            <UserRoundCheck aria-hidden="true" size={16} strokeWidth={1.8} />
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-[#111111]">No lead assigned</p>
                                            <p className="mt-1 text-xs">The team can still operate without a lead.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {meta.permissions?.update_lead ? (
                                <form
                                    className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]"
                                    onSubmit={updateLead}
                                >
                                    <Field label="Assign lead" error={firstError(leadForm.errors, 'lead_id')}>
                                        <Select
                                            value={leadForm.data.lead_id}
                                            onChange={(event) => leadForm.setData('lead_id', event.target.value)}
                                        >
                                            <option value="">No lead</option>
                                            {memberLeadOptions.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name} ({member.email})
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>
                                    <div className="flex items-end">
                                        <Button className="gap-2" disabled={leadForm.processing}>
                                            <UserRoundCheck aria-hidden="true" size={16} strokeWidth={1.8} />
                                            {leadForm.processing ? 'Saving...' : 'Save lead'}
                                        </Button>
                                    </div>
                                </form>
                            ) : null}
                        </Card>

                        <Card className="overflow-hidden">
                            <div className="flex flex-col gap-2 border-b border-[#d3cec6] p-6 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-medium text-[#111111]">Members</h2>
                                    <p className="mt-1 text-sm text-[#626260]">
                                        Members currently assigned to this team.
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#d3cec6] text-left text-sm">
                                    <thead className="bg-[#f5f1ec] text-xs font-medium uppercase text-[#626260]">
                                        <tr>
                                            <th className="px-4 py-3">Member</th>
                                            <th className="px-4 py-3">Role</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Joined</th>
                                            {meta.permissions?.manage_members ? (
                                                <th className="px-4 py-3 text-right">Action</th>
                                            ) : null}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ebe6df] bg-white">
                                        {team.members.length
                                            ? team.members.map((member) => (
                                                  <tr key={member.id} className="align-top">
                                                      <td className="px-4 py-4">
                                                          <MemberIdentity member={member} />
                                                      </td>
                                                      <td className="px-4 py-4">
                                                          <RoleBadge role={member.role} />
                                                      </td>
                                                      <td className="px-4 py-4">
                                                          <StatusBadge status={member.status} />
                                                      </td>
                                                      <td className="px-4 py-4 text-[#626260]">
                                                          {formatDate(member.created_at)}
                                                      </td>
                                                      {meta.permissions?.manage_members ? (
                                                          <td className="px-4 py-4 text-right">
                                                              <button
                                                                  className="inline-flex items-center gap-1.5 font-medium text-red-700 underline-offset-4 hover:underline"
                                                                  onClick={() => removeMember(member)}
                                                                  type="button"
                                                              >
                                                                  <UserMinus
                                                                      aria-hidden="true"
                                                                      size={15}
                                                                      strokeWidth={1.8}
                                                                  />
                                                                  Remove
                                                              </button>
                                                          </td>
                                                      ) : null}
                                                  </tr>
                                              ))
                                            : null}
                                    </tbody>
                                </table>
                            </div>

                            {!team.members.length ? (
                                <div className="px-6 py-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#d3cec6] bg-[#f5f1ec] text-[#626260]">
                                        <Inbox aria-hidden="true" size={20} strokeWidth={1.8} />
                                    </div>
                                    <h3 className="mt-4 text-base font-medium text-[#111111]">No members yet</h3>
                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#626260]">
                                        Add a member before assigning a team lead.
                                    </p>
                                </div>
                            ) : null}
                        </Card>
                    </div>

                    <aside className="space-y-6">
                        {meta.permissions?.manage_members ? (
                            <Card className="p-6">
                                <h2 className="text-lg font-medium text-[#111111]">Add member</h2>
                                <form className="mt-5 space-y-4" onSubmit={addMember}>
                                    <Field label="Member" error={firstError(addMemberForm.errors, 'member_id')}>
                                        <Select
                                            value={addMemberForm.data.member_id}
                                            onChange={(event) => {
                                                addMemberForm.setData('member_id', event.target.value);
                                                addMemberForm.setData('transfer', false);
                                            }}
                                        >
                                            <option value="">Select member</option>
                                            {(meta.member_options || []).map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name} ({member.team?.name || 'No team'})
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>

                                    {needsTransfer ? (
                                        <Field
                                            error={firstError(addMemberForm.errors, 'transfer')}
                                            label="Transfer confirmation"
                                        >
                                            <label className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                                                <input
                                                    checked={Boolean(addMemberForm.data.transfer)}
                                                    className="mt-1"
                                                    onChange={(event) =>
                                                        addMemberForm.setData('transfer', event.target.checked)
                                                    }
                                                    type="checkbox"
                                                />
                                                <span>
                                                    Move this member from {selectedMember?.team?.name} to {team.name}.
                                                </span>
                                            </label>
                                        </Field>
                                    ) : null}

                                    <Button className="gap-2" disabled={addMemberForm.processing}>
                                        <UserPlus aria-hidden="true" size={16} strokeWidth={1.8} />
                                        {addMemberForm.processing ? 'Adding...' : 'Add member'}
                                    </Button>
                                </form>
                            </Card>
                        ) : null}

                        {meta.permissions?.invite_members ? (
                            <Card className="p-6">
                                <h2 className="flex items-center gap-2 text-lg font-medium text-[#111111]">
                                    <MailPlus aria-hidden="true" size={18} strokeWidth={1.8} />
                                    Invite member
                                </h2>
                                <form className="mt-5 space-y-4" onSubmit={inviteMember}>
                                    <Field label="Email" error={firstError(inviteForm.errors, 'email')}>
                                        <TextInput
                                            type="email"
                                            value={inviteForm.data.email}
                                            onChange={(event) => inviteForm.setData('email', event.target.value)}
                                            placeholder="member@example.com"
                                        />
                                    </Field>
                                    <Button className="gap-2" disabled={inviteForm.processing} variant="secondary">
                                        <Send aria-hidden="true" size={16} strokeWidth={1.8} />
                                        {inviteForm.processing ? 'Preparing...' : 'Invite'}
                                    </Button>
                                </form>
                            </Card>
                        ) : null}
                    </aside>
                </div>
            </div>
        </AppLayout>
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
