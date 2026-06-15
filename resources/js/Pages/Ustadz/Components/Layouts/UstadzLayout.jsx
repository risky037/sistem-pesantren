import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import Sidebar from '../Sidebar';
import FlashMessage from '@/Components/FlashMessage';

export default function UstadzLayout({ children }) {
    const { props, url } = usePage();
    const user = props?.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Derive a simple page title from the current URL
    const getPageTitle = () => {
        const segments = url.replace(/^\/ustadz\/?/, '').split('/').filter(Boolean);
        if (!segments.length || segments[0] === 'dashboard') return 'Dashboard';
        const titles = {
            jadwal: 'Jadwal Mengajar',
            santri: 'Data Santri',
            penilaian: 'Penilaian',
            materi: 'Materi Ajar',
        };
        return titles[segments[0]] ?? segments[0];
    };

    return (
        <div className="h-screen bg-gray-100 flex overflow-hidden">
            {/* Sidebar (handles its own overlay on mobile) */}
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content column */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Top header */}
                <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                    {/* Hamburger (mobile) */}
                    <button
                        id="ustadz-sidebar-toggle"
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        aria-label="Buka sidebar"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Page title */}
                    <h1 className="text-lg font-semibold text-gray-800 truncate ml-2 lg:ml-0">
                        {getPageTitle()}
                    </h1>

                    {/* User info */}
                    <div className="flex items-center gap-2 ml-auto pl-4 min-w-0">
                        <span className="hidden sm:inline text-sm text-gray-500 truncate max-w-[150px]">
                            {user?.name ?? 'Ustadz'}
                        </span>
                        <div className="h-8 w-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 uppercase">
                            {(user?.name ?? 'U').charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
                    <FlashMessage />
                    {children}
                </main>
            </div>
        </div>
    );
}
