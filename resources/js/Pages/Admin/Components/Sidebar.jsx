import { Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import Icon from '@/Components/Icon';

function SidebarItem({ name, icon, href, basePath }) {
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
            <Icon name={icon} className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{name}</span>
        </Link>
    );
}

export default function Sidebar({ open, onClose }) {
    const menus = [
        { name: 'Dashboard',       icon: 'dashboard', href: route('admin.dashboard'),      basePath: '/admin/dashboard' },
        { name: 'Kelola Ustadz',   icon: 'teacher',   href: route('admin.ustadz.index'),   basePath: '/admin/ustadz' },
        { name: 'Kelola Santri',   icon: 'users',     href: route('admin.santri.index'),   basePath: '/admin/santri' },
        { name: 'Mata Pelajaran',  icon: 'book',      href: route('admin.mapel.index'),    basePath: '/admin/mapel' },
        { name: 'Jadwal Kelas',    icon: 'calendar',  href: route('admin.jadwal.index'),   basePath: '/admin/jadwal' },
    ];

    const handleLogout = () => {
        Swal.fire({
            title: 'Konfirmasi Keluar',
            text: 'Apakah Anda yakin ingin keluar dari sistem?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('logout'));
            }
        });
    };

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
                            icon={menu.icon}
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
                        <Icon name="profile" className="w-5 h-5 flex-shrink-0" />
                        Profil Saya
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 font-medium transition-all duration-150"
                    >
                        <Icon name="logout" className="w-5 h-5 flex-shrink-0" />
                        Keluar
                    </button>
                </div>
            </aside>
        </>
    );
}