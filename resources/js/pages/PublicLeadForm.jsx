import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Alert, Button, Card, Field, TextArea, TextInput, firstError } from '../components/ui.jsx';

const initialForm = {
    full_name: '',
    email: '',
    phone: '',
    company: '',
    need: '',
};

export default function PublicLeadForm({ campaignId }) {
    const [campaign, setCampaign] = useState(null);
    const [campaignError, setCampaignError] = useState('');
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!campaignId) {
            return;
        }

        api(`/public-lead-campaign/${campaignId}`)
            .then((data) => setCampaign(data.campaign))
            .catch((error) => {
                setCampaign(error.payload?.campaign || null);
                setCampaignError(error.message);
            });
    }, [campaignId]);

    function updateField(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function submit(event) {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await api('/public/leads', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    campaign_id: campaign?.id || campaignId || null,
                }),
            });
            setSuccess(true);
        } catch (error) {
            setErrors(error.errors || {});
            setCampaignError(error.status === 409 ? error.message : '');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f1ec] px-4 py-10 text-[#111111]">
            <Card className="w-full max-w-2xl p-6 sm:p-8">
                {success ? (
                    <div className="py-10 text-center">
                        <p className="text-sm font-medium text-[#626260]">{campaign?.name || 'Mini CRM'}</p>
                        <h1 className="mt-3 text-3xl font-medium tracking-[-0.4px]">Thank you!</h1>
                        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#626260]">
                            We received your information and will contact you soon.
                        </p>
                    </div>
                ) : (
                    <>
                        <div>
                            <p className="text-sm font-medium text-[#626260]">{campaign?.name || 'Mini CRM'}</p>
                            <h1 className="mt-2 text-3xl font-medium tracking-[-0.4px]">Get Consultation</h1>
                            <p className="mt-3 text-sm leading-6 text-[#626260]">
                                Share your contact details and a short note about what you need.
                            </p>
                        </div>

                        {campaignError ? <div className="mt-5"><Alert tone="error">{campaignError}</Alert></div> : null}

                        {!campaignError ? (
                            <form className="mt-6 grid gap-4" onSubmit={submit}>
                                <Field label="Name" error={firstError(errors, 'full_name')}>
                                    <TextInput
                                        value={form.full_name}
                                        onChange={(event) => updateField('full_name', event.target.value)}
                                        placeholder="Your name"
                                    />
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Email" error={firstError(errors, 'email')}>
                                        <TextInput
                                            type="email"
                                            value={form.email}
                                            onChange={(event) => updateField('email', event.target.value)}
                                            placeholder="you@example.com"
                                        />
                                    </Field>
                                    <Field label="Phone" error={firstError(errors, 'phone')}>
                                        <TextInput
                                            value={form.phone}
                                            onChange={(event) => updateField('phone', event.target.value)}
                                            placeholder="Phone number"
                                        />
                                    </Field>
                                </div>
                                <Field label="Company" error={firstError(errors, 'company')}>
                                    <TextInput
                                        value={form.company}
                                        onChange={(event) => updateField('company', event.target.value)}
                                        placeholder="Company name"
                                    />
                                </Field>
                                <Field label="What do you need?" error={firstError(errors, 'need')}>
                                    <TextArea
                                        value={form.need}
                                        onChange={(event) => updateField('need', event.target.value)}
                                        placeholder="Tell us a little about your request"
                                    />
                                </Field>
                                <div>
                                    <Button disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
                                </div>
                            </form>
                        ) : null}
                    </>
                )}
            </Card>
        </div>
    );
}
