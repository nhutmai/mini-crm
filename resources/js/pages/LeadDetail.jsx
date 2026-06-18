import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import {
    Alert,
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

export default function LeadDetail({ leadId }) {
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [note, setNote] = useState('');
    const [statusForm, setStatusForm] = useState({ status: '', note: '' });
    const [assignedTo, setAssignedTo] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState('');

    useEffect(() => {
        loadLead();
    }, [leadId]);

    function loadLead() {
        setLoading(true);
        setError('');

        api(`/leads/${leadId}`)
            .then((data) => {
                setPayload(data);
                setStatusForm({ status: data.data.status, note: '' });
                setAssignedTo(data.data.assigned_sales?.id || '');
            })
            .catch((error) => setError(error.status === 403 ? 'You do not have permission to view this lead.' : error.message))
            .finally(() => setLoading(false));
    }

    async function submitNote(event) {
        event.preventDefault();
        setSubmitting('note');
        setErrors({});
        setSuccess('');

        try {
            const data = await api(`/leads/${leadId}/activities`, {
                method: 'POST',
                body: JSON.stringify({ content: note }),
            });
            setPayload(data);
            setNote('');
            setSuccess('Note added.');
        } catch (error) {
            setErrors(error.errors || {});
            setError(error.message);
        } finally {
            setSubmitting('');
        }
    }

    async function submitStatus(event) {
        event.preventDefault();
        setSubmitting('status');
        setErrors({});
        setSuccess('');

        try {
            const data = await api(`/leads/${leadId}/status`, {
                method: 'PATCH',
                body: JSON.stringify(statusForm),
            });
            setPayload(data);
            setStatusForm({ status: data.data.status, note: '' });
            setSuccess('Status updated.');
        } catch (error) {
            setErrors(error.errors || {});
            setError(error.message);
        } finally {
            setSubmitting('');
        }
    }

    async function submitAssign(event) {
        event.preventDefault();
        setSubmitting('assign');
        setErrors({});
        setSuccess('');

        try {
            const data = await api(`/leads/${leadId}/assign`, {
                method: 'PATCH',
                body: JSON.stringify({ sales_id: assignedTo }),
            });
            setPayload(data);
            setSuccess('Lead assigned.');
        } catch (error) {
            setErrors(error.errors || {});
            setError(error.message);
        } finally {
            setSubmitting('');
        }
    }

    if (loading) {
        return <Card className="p-6 text-sm text-[#626260]">Loading lead...</Card>;
    }

    if (error && !payload) {
        return <Alert tone="error">{error}</Alert>;
    }

    const lead = payload?.data;
    const meta = payload?.meta || {};

    if (!lead) {
        return <EmptyState title="Lead not found" description="The selected lead could not be loaded." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <a className="text-sm font-medium text-[#626260] underline-offset-4 hover:underline" href="/leads">Back to leads</a>
                    <h1 className="mt-2 text-3xl font-medium tracking-[-0.4px] text-[#111111]">{lead.full_name}</h1>
                </div>
                <StatusBadge status={lead.status} />
            </div>

            {success ? <Alert>{success}</Alert> : null}
            {error && payload ? <Alert tone="error">{error}</Alert> : null}

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
                            <span className="text-sm text-[#626260]">{lead.activities?.length || 0} activities</span>
                        </div>

                        {meta.permissions?.add_note ? (
                            <form className="mt-5" onSubmit={submitNote}>
                                <Field label="Add note" error={firstError(errors, 'content')}>
                                    <TextArea
                                        value={note}
                                        onChange={(event) => setNote(event.target.value)}
                                        placeholder="Write a follow-up note"
                                    />
                                </Field>
                                <div className="mt-3">
                                    <Button disabled={submitting === 'note'}>{submitting === 'note' ? 'Saving...' : 'Add note'}</Button>
                                </div>
                            </form>
                        ) : null}

                        <div className="mt-6 space-y-4">
                            {lead.activities?.length ? lead.activities.map((activity) => (
                                <div key={activity.id} className="rounded-lg border border-[#ebe6df] p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-medium capitalize text-[#111111]">{activity.type.replace('_', ' ')}</p>
                                        <p className="text-xs text-[#626260]">{formatDate(activity.created_at)}</p>
                                    </div>
                                    {activity.old_status || activity.new_status ? (
                                        <p className="mt-2 text-sm text-[#626260]">
                                            {activity.old_status || '-'} to {activity.new_status || '-'}
                                        </p>
                                    ) : null}
                                    <p className="mt-2 text-sm leading-6 text-[#626260]">{activity.content || 'No note content.'}</p>
                                    <p className="mt-2 text-xs text-[#9c9fa5]">{activity.user?.name || 'System'}</p>
                                </div>
                            )) : (
                                <EmptyState title="No activity yet" description="Notes and status changes will appear here." />
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
                                <Field label="Status" error={firstError(errors, 'status')}>
                                    <Select
                                        value={statusForm.status}
                                        onChange={(event) => setStatusForm((current) => ({ ...current, status: event.target.value }))}
                                    >
                                        {(meta.statuses || []).map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </Select>
                                </Field>
                                <Field label="Note" error={firstError(errors, 'note')}>
                                    <TextArea
                                        value={statusForm.note}
                                        onChange={(event) => setStatusForm((current) => ({ ...current, note: event.target.value }))}
                                        placeholder="Optional context"
                                    />
                                </Field>
                                <Button disabled={submitting === 'status'}>{submitting === 'status' ? 'Updating...' : 'Update status'}</Button>
                            </form>
                        </Card>
                    ) : null}

                    {meta.permissions?.assign ? (
                        <Card className="p-6">
                            <h2 className="text-lg font-medium text-[#111111]">Assign lead</h2>
                            <form className="mt-5 space-y-4" onSubmit={submitAssign}>
                                <Field label="Sales user" error={firstError(errors, 'sales_id')}>
                                    <Select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}>
                                        <option value="">Select sales</option>
                                        {(meta.sales || []).map((sales) => (
                                            <option key={sales.id} value={sales.id}>{sales.name}</option>
                                        ))}
                                    </Select>
                                </Field>
                                <Button disabled={submitting === 'assign'}>{submitting === 'assign' ? 'Assigning...' : 'Assign lead'}</Button>
                            </form>
                        </Card>
                    ) : null}
                </aside>
            </div>
        </div>
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
