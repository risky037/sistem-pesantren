import { Head } from '@inertiajs/react';
import AdminLayout from './Components/Layouts/AdminLayout';

export default function Dashboard({ stats, recentSantri }) {
    return (
        <AdminLayout>
            <Head title="Dashboard Admin" />
            
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">Dashboard Admin</h1>
                    <p className="text-blue-100 text-lg">Sistem Informasi Akademik Pesantren - Kelola data pesantren dengan mudah</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { title: 'Total Santri', value: stats?.totalSantri ?? 0, icon: '👥', bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-600' },
                        { title: 'Total Ustadz', value: stats?.totalUstadz ?? 0, icon: '👨‍🏫', bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-600' },
                        { title: 'Mata Pelajaran', value: stats?.totalMapel ?? 0, icon: '📚', bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-600' },
                        { title: 'Jadwal Aktif', value: stats?.totalJadwal ?? 0, icon: '📅', bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-600' },
                    ].map((s, i) => (
                        <div key={i} className={`${s.bg} border-l-4 ${s.border} rounded-lg p-6 shadow-md hover:shadow-lg transition transform hover:scale-105`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">{s.title}</p>
                                    <p className={`${s.text} text-4xl font-bold mt-2`}>{s.value}</p>
                                </div>
                                <span className="text-4xl opacity-60">{s.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Santri */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white">📋 Santri Terbaru Terdaftar</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">NIS</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Kelas</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {(recentSantri ?? []).map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{s.nama}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{s.nis}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{s.kelas}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!recentSantri || recentSantri.length === 0) && (
                                    <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Belum ada data santri.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}