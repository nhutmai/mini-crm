const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

export async function api(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
            ...(options.headers || {}),
        },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(payload.message || 'Something went wrong.');
        error.status = response.status;
        error.errors = payload.errors || {};
        error.payload = payload;
        throw error;
    }

    return payload;
}

export function queryString(params) {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            search.set(key, value);
        }
    });

    const value = search.toString();

    return value ? `?${value}` : '';
}
