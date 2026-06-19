import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Info, Save, Upload } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout.jsx';
import { Card, Field, TextInput, firstError } from '../../components/ui.jsx';

export default function Profile() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const profileForm = useForm({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [role] = useState(user?.role || 'admin');
    const [logoPreview, setLogoPreview] = useState(null);

    function previewLogo(event) {
        const file = event.target.files?.[0];

        if (!file) {
            setLogoPreview(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);
    }

    const handleUpdateProfile = (event) => {
        event.preventDefault();
        profileForm.patch('/profile/update', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="mt-1 text-3xl font-medium tracking-[-0.4px] text-[#111111]">Profile settings</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#626260]">
                        Static profile UI for future account and brand settings.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <Card className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-medium text-[#111111]">Profile information</h2>
                                <p className="mt-2 text-sm leading-6 text-[#626260]">
                                    Update the account display details that will appear in the workspace header.
                                </p>
                            </div>
                            <span className="rounded-md border border-[#d3cec6] bg-[#f5f1ec] px-2.5 py-1 text-xs font-medium capitalize text-[#626260]">
                                {role}
                            </span>
                        </div>

                        <form className="mt-6 grid gap-4" onSubmit={handleUpdateProfile}>
                            <Field label="Display name" error={firstError(profileForm.errors, 'name')}>
                                <TextInput
                                    value={profileForm.data.name}
                                    onChange={(event) => profileForm.setData('name', event.target.value)}
                                />
                            </Field>

                            <Field label="Email" error={firstError(profileForm.errors, 'email')}>
                                <TextInput
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={(event) => profileForm.setData('email', event.target.value)}
                                />
                            </Field>

                            <Field label="Role">
                                <TextInput readOnly value={role} />
                            </Field>

                            <div className="pt-2">
                                <button
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111111] px-[18px] py-2.5 text-sm font-medium text-white transition hover:bg-black"
                                    disabled={profileForm.processing}
                                    type="submit"
                                >
                                    <Save aria-hidden="true" size={16} strokeWidth={1.8} />
                                    {profileForm.processing ? 'Saving...' : 'Save profile'}
                                </button>
                            </div>
                        </form>
                    </Card>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-lg font-medium text-[#111111]">Workspace logo</h2>
                            <p className="mt-2 text-sm leading-6 text-[#626260]">
                                Preview a replacement logo. Upload and storage can be connected later.
                            </p>

                            <div className="mt-5 flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#d3cec6] bg-[#f5f1ec]">
                                    {logoPreview ? (
                                        <img
                                            alt="Logo preview"
                                            className="h-full w-full object-cover"
                                            src={logoPreview}
                                        />
                                    ) : (
                                        <span className="text-lg font-medium text-[#111111]">M</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#111111]">Mini CRM</p>
                                    <p className="mt-1 text-xs text-[#626260]">PNG, JPG, or SVG works best.</p>
                                </div>
                            </div>

                            <label className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d3cec6] bg-white px-[18px] py-2.5 text-sm font-medium text-[#111111] transition hover:bg-[#f5f1ec]">
                                <Upload aria-hidden="true" size={16} strokeWidth={1.8} />
                                Choose logo
                                <input accept="image/*" className="sr-only" onChange={previewLogo} type="file" />
                            </label>
                        </Card>

                        <Card className="p-6">
                            <h2 className="flex items-center gap-2 text-lg font-medium text-[#111111]">
                                <Info aria-hidden="true" size={18} strokeWidth={1.8} />
                                Storage suggestion
                            </h2>
                            <div className="mt-3 space-y-3 text-sm leading-6 text-[#626260]">
                                <p>
                                    For a demo project, store the logo in Laravel local storage with the public disk:
                                    `storage/app/public/logos`.
                                </p>
                                <p>
                                    Save only the logo path, for example `logos/workspace-logo.png`, in a simple
                                    settings table or `config/settings.php` if it stays single-tenant.
                                </p>
                                <p>
                                    Later, run `php artisan storage:link` and render the logo with Laravel&apos;s
                                    `Storage::url($path)`.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
