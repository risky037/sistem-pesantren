import { Link, usePage } from '@inertiajs/react';

function SidebarItem({ name, href, basePath }) {
    const { url } = usePage();
    const isActive = url === href || url.startsWith(basePath ?? href);

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 ${
                isActive
                    ? 'bg-gray-700 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {name}
        </Link>
    );
}

export default function Sidebar({ open, onClose }) {
    const menus = [
        { name: '📊 Dashboard',       href: route('admin.dashboard'),      basePath: '/admin/dashboard' },
        { name: '👨‍🏫 Kelola Ustadz',   href: route('admin.ustadz.index'),   basePath: '/admin/ustadz' },
        { name: '👥 Kelola Santri',    href: route('admin.santri.index'),   basePath: '/admin/santri' },
        { name: '📚 Mata Pelajaran',   href: route('admin.mapel.index'),    basePath: '/admin/mapel' },
        { name: '📅 Jadwal Kelas',     href: route('admin.jadwal.index'),   basePath: '/admin/jadwal' },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={`
                    fixed top-0 left-0 z-30 h-full w-64 bg-gray-900 text-white flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                    lg:relative lg:translate-x-0 lg:z-auto lg:flex-shrink-0
                `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-700 bg-gray-800">
                    <img
                        src="/logo.webp"
                        alt="Logo Sistem Pesantren"
                        className="h-9 w-auto object-contain"
                    />
                    <span className="text-base font-bold tracking-wide leading-tight">
                        Pesantren <br />
                        <span className="text-gray-400 text-xs font-normal">Admin Panel</span>
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menus.map((menu) => (
                        <SidebarItem
                            key={menu.href}
                            name={menu.name}
                            href={menu.href}
                            basePath={menu.basePath}
                        />
                    ))}
                </nav>

                {/* Footer: Profile & Logout */}
                <div className="px-3 py-4 border-t border-gray-700 bg-gray-800 space-y-1">
                    <Link
                        href={route('profile.edit')}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white font-medium transition-all duration-150"
                    >
                        👤 Profil Saya
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 font-medium transition-all duration-150"
                    >
                        🚪 Keluar
                    </Link>
                </div>
            </aside>
        </>
    );
}