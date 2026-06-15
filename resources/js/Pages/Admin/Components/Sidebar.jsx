import { Link } from '@inertiajs/react';

export default function Sidebar() {
    const menus = [
        { name: '📊 Dashboard', href: route('admin.dashboard') },
        { name: '👨‍🏫 Kelola Ustadz', href: route('admin.ustadz.index') },
        { name: '👥 Kelola Santri', href: route('admin.santri.index') },
        { name: '📚 Mata Pelajaran', href: route('admin.mapel.index') },
        { name: '📅 Jadwal Kelas', href: route('admin.jadwal.index') },
    ];

    return (
        <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col sticky top-0">
            <div className="p-4 text-xl font-bold border-b border-gray-700 bg-gray-800">
                📘 Pesantren Admin
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menus.map((menu, index) => (
                    <Link 
                        key={index} 
                        href={menu.href} 
                        className="block px-4 py-3 rounded-lg hover:bg-gray-700 transition text-gray-100 hover:text-white font-medium"
                    >
                        {menu.name}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-700 bg-gray-800 text-xs text-gray-400">
                <p>© 2024 Sistem Pesantren</p>
            </div>
        </div>
    );
}