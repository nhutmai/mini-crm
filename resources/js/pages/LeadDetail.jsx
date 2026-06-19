import React from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, History, MessageSquarePlus, RefreshCcw, UserPlus } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import {
    Button,
    Card,
    EmptyState,
    Field,
    Select,
    StatusBadge,
    TextArea,
    formatDate,
    formatMoney,
    firstError,
} from '../components/ui.jsx';

export default function LeadDetail() {
    const { lead, meta } = usePage().props;
    const noteForm = useForm({ content: '' });
    const statusForm = useForm({ status: lead?.status || '', note: '' });
    const assignForm = useForm({ sales_id: lead?.assigned_sales?.id || '' });

    function submitNote(event) {
        event.preventDefault();
        noteForm.post(`/leads/${lead.id}/activities`, {
            preserveScroll: true,
            onSuccess: () => noteForm.reset(),
        });
    }

    function submitStatus(event) {
        event.preventDefault();
        statusForm.patch(`/leads/${lead.id}/status`, {
            preserveScroll: true,
            onSuccess: () => statusForm.setData('note', ''),
        });
    }

    function submitAssign(event) {
        event.preventDefault();
        assignForm.patch(`/leads/${lead.id}/assign`, {
            preserveScroll: true,
        });
    }

    if (!lead) {
        return (
            <AppLayout>
                <EmptyState title="Lead not found" description="The selected lead could not be loaded." />
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#626260] underline-offset-4 hover:underline"
                            href="/leads"
                        >
                            <ArrowLeft aria-hidden="true" size={15} strokeWidth={1.8} />
                            Back to leads
                        </Link>
                        <h1 className="mt-2 text-3xl font-medium tracking-[-0.4px] text-[#111111]">{lead.full_name}</h1>
                    </div>
                    <StatusBadge status={lead.status} />
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-lg font-medium text-[#111111]">Lead information</h2>
                            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                                <Info label="Email" value={lead.email} />
                                <Info label="Phone" value={lead.phone} />
                                <Info label="Company" value={lead.company} />
                                <Info label="Source" value={lead.source} />
                                <Info label="Campaign" value={lead.campaign?.name} />
                                <Info label="Estimated value" value={formatMoney(lead.estimated_value)} />
                            </dl>
                            <div className="mt-6">
                                <p className="text-sm font-medium text-[#111111]">Message</p>
                                <p className="mt-2 rounded-lg bg-[#f5f1ec] p-4 text-sm leading-6 text-[#626260]">
                                    {lead.need || 'No initial message was provided.'}
                                </p>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-lg font-medium text-[#111111]">Timeline notes</h2>
                                <span className="text-sm text-[#626260]">
                                    {lead.activities?.length || 0} activities
                                </span>
                            </div>

                            {meta.permissions?.add_note ? (
                                <form className="mt-5" onSubmit={submitNote}>
                                    <Field label="Add note" error={firstError(noteForm.errors, 'content')}>
                                        <TextArea
                                            value={noteForm.data.content}
                                            onChange={(event) => noteForm.setData('content', event.target.value)}
                                            placeholder="Write a follow-up note"
                                        />
                                    </Field>
                                    <div className="mt-3">
                                        <Button className="gap-2" disabled={noteForm.processing}>
                                            <MessageSquarePlus aria-hidden="true" size={16} strokeWidth={1.8} />
                                            {noteForm.processing ? 'Saving...' : 'Add note'}
                                        </Button>
                                    </div>
                                </form>
                            ) : null}

                            <div className="mt-6 space-y-4">
                                {lead.activities?.length ? (
                                    lead.activities.map((activity) => (
                                        <div key={activity.id} className="rounded-lg border border-[#ebe6df] p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="text-sm font-medium capitalize text-[#111111]">
                                                    {activity.type.replace('_', ' ')}
                                                </p>
                                                <p className="text-xs text-[#626260]">
                                                    {formatDate(activity.created_at)}
                                                </p>
                                            </div>
                                            {activity.old_status || activity.new_status ? (
                                                <p className="mt-2 text-sm text-[#626260]">
                                                    {activity.old_status || '-'} to {activity.new_status || '-'}
                                                </p>
                                            ) : null}
                                            <p className="mt-2 text-sm leading-6 text-[#626260]">
                                                {activity.content || 'No note content.'}
                                            </p>
                                            <p className="mt-2 text-xs text-[#9c9fa5]">
                                                {activity.user?.name || 'System'}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-10 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#d3cec6] bg-[#f5f1ec] text-[#626260]">
                                            <History aria-hidden="true" size={20} strokeWidth={1.8} />
                                        </div>
                                        <h3 className="mt-4 text-base font-medium text-[#111111]">No activity yet</h3>
                                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#626260]">
                                            Notes and status changes will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <aside className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-lg font-medium text-[#111111]">Lead controls</h2>
                            <dl className="mt-5 space-y-4">
                                <Info label="Status" value={<StatusBadge status={lead.status} />} />
                                <Info label="Assigned sales" value={lead.assigned_sales?.name || 'Unassigned'} />
                                <Info label="Campaign" value={lead.campaign?.name || '-'} />
                                <Info label="Created" value={formatDate(lead.created_at)} />
                            </dl>
                        </Card>

                        {meta.permissions?.update_status ? (
                            <Card className="p-6">
                                <h2 className="text-lg font-medium text-[#111111]">Change status</h2>
                                <form className="mt-5 space-y-4" onSubmit={submitStatus}>
                                    <Field label="Status" error={firstError(statusForm.errors, 'status')}>
                                        <Select
                                            value={statusForm.data.status}
                                            onChange={(event) => statusForm.setData('status', event.target.value)}
                                        >
                                            {(meta.statuses || []).map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>
                                    <Field label="Note" error={firstError(statusForm.errors, 'note')}>
                                        <TextArea
                                            value={statusForm.data.note}
                                            onChange={(event) => statusForm.setData('note', event.target.value)}
                                            placeholder="Optional context"
                                        />
                                    </Field>
                                    <Button className="gap-2" disabled={statusForm.processing}>
                                        <RefreshCcw aria-hidden="true" size={16} strokeWidth={1.8} />
                                        {statusForm.processing ? 'Updating...' : 'Update status'}
                                    </Button>
                                </form>
                            </Card>
                        ) : null}

                        {meta.permissions?.assign ? (
                            <Card className="p-6">
                                <h2 className="text-lg font-medium text-[#111111]"></h2>
                                <form className="mt-5 space-y-4" onSubmit={submitAssign}>
                                    <Field label="Sales user" error={firstError(assignForm.errors, 'sales_id')}>
                                        <Select
                                            value={assignForm.data.sales_id}
                                            onChange={(event) => assignForm.setData('sales_id', event.target.value)}
                                        >
                                            <option value="">Select sales</option>
                                            {(meta.sales || []).map((sales) => (
                                                <option key={sales.id} value={sales.id}>
                                                    {sales.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>
                                    <Button className="gap-2" disabled={assignForm.processing}>
                                        <UserPlus aria-hidden="true" size={16} strokeWidth={1.8} />
                                        {assignForm.processing ? 'Assigning...' : ''}
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

function Info({ label, value }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase text-[#9c9fa5]">{label}</dt>
            <dd className="mt-1 text-sm text-[#111111]">{value || '-'}</dd>
        </div>
    );
}
