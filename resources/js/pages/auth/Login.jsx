import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Card, Field, TextInput } from '../../components/ui.jsx';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <main className="min-h-screen bg-[#f5f1ec] text-[#111111]">
            <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111111] text-sm font-medium text-white">
                            a
                        </span>
                        <span className="text-lg font-medium tracking-[-0.2px]">authentication</span>
                    </Link>
                    <Link
                        className="rounded-lg border border-[#d3cec6] bg-white px-3.5 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#f5f1ec]"
                        href="/"
                    >
                        Back to workspace
                    </Link>
                </header>

                <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:py-16">
                    <div className="max-w-2xl">
                        <p className="text-sm font-medium text-[#626260]">Secure CRM access</p>
                        <h1 className="mt-4 text-5xl font-medium leading-[1.05] tracking-[-1.2px] text-[#111111] sm:text-6xl">
                            Sign in to your lead workspace.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-8 text-[#626260]">
                            Authentication keeps campaign, lead, and sales activity data in one focused workspace for
                            your team.
                        </p>

                        <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
                            <Metric label="Campaigns" value="12" />
                            <Metric label="Active leads" value="248" />
                            <Metric label="Sales users" value="18" />
                        </div>
                    </div>

                    <Card className="p-6 sm:p-8">
                        <div>
                            <p className="text-sm font-medium text-[#626260]">Welcome back</p>
                            <h2 className="mt-2 text-2xl font-medium tracking-[-0.3px] text-[#111111]">Login</h2>
                            <p className="mt-2 text-sm leading-6 text-[#626260]">
                                This is a static UI shell. Connect validation and authentication logic when ready.
                            </p>
                        </div>

                        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                            <Field label="Email">
                                <TextInput
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </Field>

                            <Field label="Password">
                                <TextInput
                                    type="password"
                                    placeholder="Enter your password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </Field>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <label className="flex items-center gap-2 text-sm text-[#626260]">
                                    <input
                                        className="h-4 w-4 rounded border-[#d3cec6] text-[#111111]"
                                        type="checkbox"
                                    />
                                    Remember me
                                </label>
                                <span className="text-sm font-medium text-[#111111]">Forgot password?</span>
                            </div>

                            <div className="text-red-500">{errors.email && errors.email}</div>
                            <button
                                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#111111] px-[18px] py-3 text-sm font-medium text-white transition hover:bg-black"
                                type="submit"
                            >
                                Sign in
                            </button>
                        </form>

                        <div className="mt-6 rounded-lg bg-[#f5f1ec] p-4 text-sm leading-6 text-[#626260]">
                            Use this layout as the starting point for your Laravel session authentication flow.
                        </div>
                    </Card>
                </section>
            </div>
        </main>
    );
}

function Metric({ label, value }) {
    return (
        <div className="rounded-lg border border-[#d3cec6] bg-white p-4">
            <p className="text-2xl font-medium tracking-[-0.3px] text-[#111111]">{value}</p>
            <p className="mt-1 text-sm text-[#626260]">{label}</p>
        </div>
    );
}
