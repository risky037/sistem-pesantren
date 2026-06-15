import { Link } from '@inertiajs/react';

export default function PageHeader({ title, actionText, actionHref, actionIcon = '➕' }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {title}
            </h1>
            {actionText && actionHref && (
                <Link
                    href={actionHref}
                    className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-sm w-full sm:w-auto"
                >
                    <span className="mr-2" aria-hidden="true">{actionIcon}</span>
                    {actionText}
                </Link>
            )}
        </div>
    );
}
