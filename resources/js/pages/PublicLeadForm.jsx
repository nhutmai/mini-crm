import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { CircleAlert, CircleCheck, Send } from 'lucide-react';
import { Alert, Button, Card, Field, TextArea, TextInput, firstError } from '../components/ui.jsx';

const initialForm = {
    full_name: '',
    email: '',
    phone: '',
    company: '',
    need: '',
};

export default function PublicLeadForm() {
    const { campaign, campaignError, flash } = usePage().props;
    const form = useForm({
        ...initialForm,
        campaign_id: campaign?.id || null,
    });

    function submit(event) {
        event.preventDefault();
        form.post('/public/leads', {
            preserveScroll: true,
            onSuccess: () => form.reset('full_name', 'email', 'phone', 'company', 'need'),
        });
    }

    const success = flash?.success;
    const error = flash?.error || campaignError;

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f1ec] px-4 py-10 text-[#111111]">
            <Card className="w-full max-w-2xl p-6 sm:p-8">
                {success ? (
                    <div className="py-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
                            <CircleCheck aria-hidden="true" size={22} strokeWidth={1.9} />
                        </div>
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

                        {error ? (
                            <div className="mt-5">
                                <Alert tone="error">
                                    <span className="flex items-start gap-2">
                                        <CircleAlert
                                            aria-hidden="true"
                                            className="mt-0.5 shrink-0"
                                            size={16}
                                            strokeWidth={1.8}
                                        />
                                        <span>{error}</span>
                                    </span>
                                </Alert>
                            </div>
                        ) : null}

                        {!error ? (
                            <form className="mt-6 grid gap-4" onSubmit={submit}>
                                <Field label="Name" error={firstError(form.errors, 'full_name')}>
                                    <TextInput
                                        value={form.data.full_name}
                                        onChange={(event) => form.setData('full_name', event.target.value)}
                                        placeholder="Your name"
                                    />
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Email" error={firstError(form.errors, 'email')}>
                                        <TextInput
                                            type="email"
                                            value={form.data.email}
                                            onChange={(event) => form.setData('email', event.target.value)}
                                            placeholder="you@example.com"
                                        />
                                    </Field>
                                    <Field label="Phone" error={firstError(form.errors, 'phone')}>
                                        <TextInput
                                            value={form.data.phone}
                                            onChange={(event) => form.setData('phone', event.target.value)}
                                            placeholder="Phone number"
                                        />
                                    </Field>
                                </div>
                                <Field label="Company" error={firstError(form.errors, 'company')}>
                                    <TextInput
                                        value={form.data.company}
                                        onChange={(event) => form.setData('company', event.target.value)}
                                        placeholder="Company name"
                                    />
                                </Field>
                                <Field label="What do you need?" error={firstError(form.errors, 'need')}>
                                    <TextArea
                                        value={form.data.need}
                                        onChange={(event) => form.setData('need', event.target.value)}
                                        placeholder="Tell us a little about your request"
                                    />
                                </Field>
                                <div>
                                    <Button className="gap-2" disabled={form.processing}>
                                        <Send aria-hidden="true" size={16} strokeWidth={1.8} />
                                        {form.processing ? 'Submitting...' : 'Submit'}
                                    </Button>
                                </div>
                            </form>
                        ) : null}
                    </>
                )}
            </Card>
        </div>
    );
}
