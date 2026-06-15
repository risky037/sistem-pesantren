import { Head } from '@inertiajs/react';
import UstadzLayout from './Components/Layouts/UstadzLayout';

export default function Dashboard() {
    const statsData = [
        {
            title: 'Total Kelas',
            value: '4',
            subtitle: 'Yang Diampu',
            icon: '📚',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-400',
            textColor: 'text-indigo-600'
        },
        {
            title: 'Total Santri',
            value: '87',
            subtitle: 'Belajar Bersama',
            icon: '👥',
            bgColor: 'bg-cyan-50',
            borderColor: 'border-cyan-400',
            textColor: 'text-cyan-600'
        },
        {
            title: 'Tugas Pending',
            value: '12',
            subtitle: 'Perlu Koreksi',
            icon: '✏️',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-400',
            textColor: 'text-amber-600'
        },
        {
            title: 'Nilai Terkoreksi',
            value: '89%',
            subtitle: 'Terselesaikan',
            icon: '✅',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-400',
            textColor: 'text-emerald-600'
        }
    ];

    const jadwalKelasData = [
        { jam: '08:00 - 09:00', kelas: 'Kelas A', mapel: 'Fiqih', ruangan: 'Ruang 1', santri: 22 },
        { jam: '09:15 - 10:15', kelas: 'Kelas B', mapel: 'Al-Qur\'an', ruangan: 'Ruang 2', santri: 20 },
        { jam: '10:30 - 11:30', kelas: 'Kelas C', mapel: 'Hadis', ruangan: 'Ruang 3', santri: 23 },
        { jam: '13:00 - 14:00', kelas: 'Kelas D', mapel: 'Bahasa Arab', ruangan: 'Ruang 4', santri: 22 },
    ];

    const tugasData = [
        { kelas: 'Kelas A', mapel: 'Fiqih', jumlah: 3, deadline: '15 Juni 2024' },
        { kelas: 'Kelas B', mapel: 'Al-Qur\'an', jumlah: 5, deadline: '16 Juni 2024' },
        { kelas: 'Kelas C', mapel: 'Hadis', jumlah: 2, deadline: '17 Juni 2024' },
        { kelas: 'Kelas D', mapel: 'Bahasa Arab', jumlah: 2, deadline: '18 Juni 2024' },
    ];

    return (
        <UstadzLayout>
            <Head title="Dashboard Ustadz" />
            
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-xl p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">Dashboard Ustadz</h1>
                    <p className="text-indigo-100 text-lg">Sistem Informasi Akademik Pesantren - Kelola pembelajaran dengan efisien</p>
                </div>

                {/* Stats Cards */}
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

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Jadwal Kelas - 2 columns */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">📅 Jadwal Mengajar Hari Ini</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {jadwalKelasData.map((jadwal, idx) => (
                                <div key={idx} className="border border-indigo-200 rounded-lg p-5 hover:shadow-md transition hover:border-indigo-400">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{jadwal.kelas}</h3>
                                            <p className="text-indigo-600 font-semibold">{jadwal.mapel}</p>
                                        </div>
                                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                                            {jadwal.santri} Santri
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                        <span>⏰ {jadwal.jam}</span>
                                        <span>📍 {jadwal.ruangan}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Aksi Cepat */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                                <h2 className="text-lg font-bold text-white">⚡ Aksi Cepat</h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105 shadow-sm">
                                    ➕ Input Nilai
                                </button>
                                <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105 shadow-sm">
                                    📋 Buat Tugas
                                </button>
                                <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105 shadow-sm">
                                    📤 Upload Materi
                                </button>
                            </div>
                        </div>

                        {/* Ringkasan Kinerja */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Kinerja</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Rata-rata Nilai</span>
                                    <span className="text-2xl font-bold text-indigo-600">82.5</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Santri Aktif</span>
                                    <span className="text-2xl font-bold text-cyan-600">85/87</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Penilaian Input</span>
                                    <span className="text-2xl font-bold text-emerald-600">92%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tugas Santri & Nilai */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tugas Pending */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">📝 Tugas yang Perlu Dikoreksi</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            {tugasData.map((tugas, idx) => (
                                <div key={idx} className="border border-amber-200 rounded-lg p-4 hover:bg-amber-50 transition">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">{tugas.kelas}</p>
                                            <p className="text-sm text-gray-600">{tugas.mapel}</p>
                                            <p className="text-xs text-amber-600 mt-2">📅 Deadline: {tugas.deadline}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-amber-600">{tugas.jumlah}</p>
                                            <p className="text-xs text-amber-600 font-medium">Tugas</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sebaran Nilai */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">📊 Sebaran Nilai Santri</h2>
                        <div className="space-y-4">
                            {[
                                { grade: 'A (90-100)', count: 25, color: '#10b981', percent: 29 },
                                { grade: 'B (80-89)', count: 38, color: '#3b82f6', percent: 44 },
                                { grade: 'C (70-79)', count: 18, color: '#f59e0b', percent: 21 },
                                { grade: 'D (<70)', count: 6, color: '#ef4444', percent: 6 },
                            ].map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-700">{item.grade}</span>
                                        <span className="font-semibold text-gray-900">{item.count} santri ({item.percent}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="h-3 rounded-full"
                                            style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                                        ></div>
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
                            <p className="font-bold text-gray-900">{new Date().toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
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
                            <p className="text-2xl">⭐</p>
                            <p className="text-gray-600 text-sm mt-2 font-semibold">Rating</p>
                            <p className="font-bold text-emerald-600">Sangat Baik</p>
                        </div>
                    </div>
                </div>
            </div>
        </UstadzLayout>
    );
}
