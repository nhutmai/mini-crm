import React from 'react';

const leadStatusClasses = {
    new: 'bg-[#f5f1ec] text-[#111111] border-[#d3cec6]',
    contacted: 'bg-blue-50 text-blue-800 border-blue-200',
    qualified: 'bg-lime-50 text-lime-800 border-lime-200',
    converted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    lost: 'bg-red-50 text-red-800 border-red-200',
};

const campaignStatusClasses = {
    draft: 'bg-[#f5f1ec] text-[#626260] border-[#d3cec6]',
    active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    paused: 'bg-amber-50 text-amber-800 border-amber-200',
    ended: 'bg-neutral-100 text-neutral-700 border-neutral-200',
};

export function PageHeader({ title, eyebrow, action }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                {eyebrow ? <p className="text-sm font-medium text-[#626260]">{eyebrow}</p> : null}
                <h1 className="mt-1 text-3xl font-medium tracking-[-0.4px] text-[#111111]">{title}</h1>
            </div>
            {action}
        </div>
    );
}

export function Card({ children, className = '' }) {
    return (
        <section className={`rounded-xl border border-[#d3cec6] bg-white ${className}`}>
            {children}
        </section>
    );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
    const variants = {
        primary: 'bg-[#111111] text-white hover:bg-black',
        secondary: 'border border-[#d3cec6] bg-white text-[#111111] hover:bg-[#f5f1ec]',
        subtle: 'bg-[#f5f1ec] text-[#111111] hover:bg-[#ece7df]',
        danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
    };

    return (
        <button
            className={`inline-flex items-center justify-center rounded-lg px-[18px] py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function LinkButton({ children, variant = 'primary', className = '', ...props }) {
    const variants = {
        primary: 'bg-[#111111] text-white hover:bg-black',
        secondary: 'border border-[#d3cec6] bg-white text-[#111111] hover:bg-[#f5f1ec]',
        subtle: 'bg-[#f5f1ec] text-[#111111] hover:bg-[#ece7df]',
    };

    return (
        <a
            className={`inline-flex items-center justify-center rounded-lg px-[18px] py-2.5 text-sm font-medium transition ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </a>
    );
}

export function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="text-sm font-medium text-[#111111]">{label}</span>
            <div className="mt-2">{children}</div>
            {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
        </label>
    );
}

export function TextInput(props) {
    return (
        <input
            className="w-full rounded-lg border border-[#d3cec6] bg-white px-3.5 py-2.5 text-sm text-[#111111] outline-none transition placeholder:text-[#9c9fa5] focus:border-[#111111]"
            {...props}
        />
    );
}

export function TextArea(props) {
    return (
        <textarea
            className="min-h-28 w-full rounded-lg border border-[#d3cec6] bg-white px-3.5 py-2.5 text-sm text-[#111111] outline-none transition placeholder:text-[#9c9fa5] focus:border-[#111111]"
            {...props}
        />
    );
}

export function Select({ children, ...props }) {
    return (
        <select
            className="w-full rounded-lg border border-[#d3cec6] bg-white px-3.5 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
            {...props}
        >
            {children}
        </select>
    );
}

export function StatusBadge({ status, type = 'lead' }) {
    const classes = type === 'campaign' ? campaignStatusClasses : leadStatusClasses;

    return (
        <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${classes[status] || classes.new || classes.draft}`}>
            {status || 'unknown'}
        </span>
    );
}

export function Alert({ children, tone = 'success' }) {
    const tones = {
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        error: 'border-red-200 bg-red-50 text-red-900',
        neutral: 'border-[#d3cec6] bg-white text-[#626260]',
    };

    return <div className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>;
}

export function EmptyState({ title, description }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <h2 className="text-lg font-medium text-[#111111]">{title}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#626260]">{description}</p>
        </div>
    );
}

export function Pagination({ page, lastPage, onPage }) {
    if (!lastPage || lastPage <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between border-t border-[#d3cec6] px-4 py-3 text-sm text-[#626260]">
            <span>
                Page {page} of {lastPage}
            </span>
            <div className="flex gap-2">
                <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
                    Previous
                </Button>
                <Button variant="secondary" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>
                    Next
                </Button>
            </div>
        </div>
    );
}

export function formatDate(value) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function formatMoney(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
}

export function firstError(errors, field) {
    return Array.isArray(errors?.[field]) ? errors[field][0] : errors?.[field];
}
