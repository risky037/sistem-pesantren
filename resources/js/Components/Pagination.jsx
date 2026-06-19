import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            {links.map((link, idx) => (
                <Link
                    key={idx}
                    href={link.url || '#'}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                        link.active
                            ? 'bg-blue-600 text-white'
                            : link.url
                                ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    preserveScroll
                    preserveState
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
