import { Head } from '@inertiajs/react';
import AdminLayout from './Components/Layouts/AdminLayout';

export default function Dashboard() {
    // Dummy data untuk dashboard
    const statsData = [
        {
            title: 'Total Santri',
            value: '145',
            subtitle: 'Terdaftar',
            icon: '👥',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-400',
            textColor: 'text-blue-600'
        },
        {
            title: 'Total Ustadz',
            value: '12',
            subtitle: 'Pengajar Aktif',
            icon: '👨‍🏫',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-400',
            textColor: 'text-green-600'
        },
        {
            title: 'Program Studi',
            value: '4',
            subtitle: 'Tersedia',
            icon: '📚',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-400',
            textColor: 'text-purple-600'
        },
        {
            title: 'Jadwal Aktif',
            value: '24',
            subtitle: 'Kelas',
            icon: '📅',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-400',
            textColor: 'text-orange-600'
        }
    ];

    const recentData = [
        { id: 1, nama: 'Muhammad Rafiqi', nim: '2024001', prodi: 'Tahfiz Qur\'an', status: 'Aktif', tgl: '2024-06-14' },
        { id: 2, nama: 'Siti Nurhaliza', nim: '2024002', prodi: 'Hafalan & Tilawah', status: 'Aktif', tgl: '2024-06-13' },
        { id: 3, nama: 'Ahmad Hidayat', nim: '2024003', prodi: 'Program Reguler', status: 'Aktif', tgl: '2024-06-12' },
        { id: 4, nama: 'Fatimah Zahra', nim: '2024004', prodi: 'Tahfiz Qur\'an', status: 'Aktif', tgl: '2024-06-11' },
        { id: 5, nama: 'Imam Malik', nim: '2024005', prodi: 'Program Reguler', status: 'Aktif', tgl: '2024-06-10' },
    ];

    const announcements = [
        { id: 1, title: 'Pengumuman Hasil UAS Semester Genap', date: '15 Juni 2024' },
        { id: 2, title: 'Pendaftaran Beasiswa Telah Dibuka', date: '14 Juni 2024' },
        { id: 3, title: 'Jadwal Kegiatan Akhir Tahun Akademik', date: '13 Juni 2024' },
    ];

    return (
        <AdminLayout>
            <Head title="Dashboard Admin" />
            
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">Dashboard Admin</h1>
                    <p className="text-blue-100 text-lg">Sistem Informasi Akademik Pesantren - Kelola data pesantren dengan mudah</p>
                </div>

                {/* Stats Cards - 4 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statsData.map((stat, idx) => (
                        <div key={idx} className={`${stat.bgColor} border-l-4 ${stat.borderColor} rounded-lg p-6 shadow-md hover:shadow-lg transition transform hover:scale-105`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">{stat.title}</p>
                                    <p className={`${stat.textColor} text-4xl font-bold mt-2`}>{stat.value}</p>
                                    <p className="text-gray-500 text-xs mt-2">{stat.subtitle}</p>
                                </div>
                                <span className="text-4xl opacity-60">{stat.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Santri Baru - 2 columns */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">📋 Santri Terbaru Terdaftar</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">NIM</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Program</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentData.map((data) => (
                                        <tr key={data.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{data.nama}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{data.nim}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{data.prodi}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {data.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                                Lihat Semua Santri →
                            </a>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Pengumuman */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                                <h2 className="text-lg font-bold text-white">📢 Pengumuman</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {announcements.map((ann) => (
                                    <div key={ann.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                                        <p className="text-sm font-semibold text-gray-900">{ann.title}</p>
                                        <p className="text-xs text-gray-500 mt-2">{ann.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Statistik Ringkas */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Ringkasan</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Kehadiran Hari Ini</span>
                                    <span className="text-2xl font-bold text-blue-600">94%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Tugas Masuk</span>
                                    <span className="text-2xl font-bold text-green-600">87%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Penilaian Input</span>
                                    <span className="text-2xl font-bold text-purple-600">92%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Distribusi Santri per Kelas */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">📚 Distribusi Santri per Program</h2>
                        <div className="space-y-4">
                            {[
                                { name: 'Program Hafalan Qur\'an', count: 45, percentage: 31 },
                                { name: 'Program Tilawah & Tajweed', count: 38, percentage: 26 },
                                { name: 'Program Reguler', count: 42, percentage: 29 },
                                { name: 'Program Intensif', count: 20, percentage: 14 },
                            ].map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium text-gray-700">{item.name}</span>
                                        <span className="font-semibold text-gray-900">{item.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Aktivitas Sistem */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">⚙️ Aktivitas Sistem</h2>
                        <div className="space-y-4">
                            {[
                                { title: 'Backup Database Dijadwalkan', time: '15 menit lagi', status: 'Pending' },
                                { title: 'Update Kurikulum Selesai', time: '2 jam yang lalu', status: 'Selesai' },
                                { title: 'Input Nilai dari 5 Ustadz', time: '4 jam yang lalu', status: 'Selesai' },
                                { title: 'Sinkronisasi Data Peserta', time: '1 hari yang lalu', status: 'Selesai' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${item.status === 'Pending' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-2xl">📅</p>
                            <p className="text-gray-600 text-sm mt-2 font-semibold">Tanggal</p>
                            <p className="font-bold text-gray-900">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl">⏰</p>
                            <p className="text-gray-600 text-sm mt-2 font-semibold">Jam</p>
                            <p className="font-bold text-gray-900">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl">🎓</p>
                            <p className="text-gray-600 text-sm mt-2 font-semibold">Tahun Akademik</p>
                            <p className="font-bold text-gray-900">2024/2025</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl">📍</p>
                            <p className="text-gray-600 text-sm mt-2 font-semibold">Server</p>
                            <p className="font-bold text-gray-900">Online</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}