import { Link } from '@inertiajs/react';

export default function Sidebar() {
    const menus = [
        { name: '📊 Dashboard', href: route('ustadz.dashboard') },
        { name: '📅 Jadwal Mengajar', href: route('ustadz.jadwal.index') },
        { name: '👥 Data Santri', href: route('ustadz.santri.index') },
        { name: '⭐ Penilaian', href: route('ustadz.penilaian.index') },
        { name: '📚 Materi Ajar', href: route('ustadz.materi.index') },
    ];

    return (
        <div className="w-64 min-h-screen bg-indigo-900 text-white flex flex-col sticky top-0">
            <div className="p-4 text-xl font-bold border-b border-indigo-700 bg-indigo-800">
                📘 Ustadz Panel
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menus.map((menu, index) => (
                    <Link 
                        key={index} 
                        href={menu.href} 
                        className="block px-4 py-3 rounded-lg hover:bg-indigo-700 transition text-indigo-100 hover:text-white font-medium"
                    >
                        {menu.name}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-indigo-700 bg-indigo-800 text-xs text-indigo-400">
                <p>© 2024 Sistem Pesantren</p>
            </div>
        </div>
    );
}
