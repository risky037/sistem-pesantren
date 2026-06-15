import { Head, usePage } from '@inertiajs/react';
import AdminLayout from './Layouts/AdminLayout';

export default function Dashboard() {
    const user = usePage().props.auth.user;

    // Data statis sementara untuk tampilan (Nanti diganti data dari database)
    const stats = [
        { title: 'Total Ustadz', value: '45', color: 'bg-blue-500' },
        { title: 'Total Santri', value: '1.250', color: 'bg-indigo-500' },
        { title: 'Mata Pelajaran', value: '24', color: 'bg-purple-500' },
        { title: 'Kelas Aktif', value: '32', color: 'bg-pink-500' },
    ];

    return (
        <AdminLayout>
            <Head title="Dashboard Admin" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Assalamu'alaikum, {user.name}</h2>
                <p className="text-gray-600">Selamat datang di Panel Administrasi Sistem Pesantren.</p>
            </div>

            {/* Grid Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className={`h-2 ${stat.color}`}></div>
                        <div className="p-5">
                            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Section Info Tambahan */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>
                <div className="text-center py-8 text-gray-500">
                    <p>Belum ada aktivitas yang tercatat hari ini.</p>
                </div>
            </div>
        </AdminLayout>
    );
}