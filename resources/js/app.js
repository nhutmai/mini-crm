import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

createInertiaApp({
    title: (title) => (title ? `${title} - Mini CRM` : 'Mini CRM'),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });

        return pages[`./pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(React.createElement(React.StrictMode, null, React.createElement(App, props)));
    },
});
