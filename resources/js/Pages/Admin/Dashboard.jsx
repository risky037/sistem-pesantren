import { Head } from '@inertiajs/react';
import AdminLayout from './Components/Layouts/AdminLayout';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import Icon from '@/Components/Icon';

export default function Dashboard({ stats, recentSantri }) {
    return (
        <AdminLayout>
            <Head title="Dashboard Admin" />
            
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 rounded-xl p-8 text-white shadow-sm border border-emerald-900/10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">Dashboard Admin</h1>
                    <p className="text-emerald-50 text-lg">Sistem Informasi Akademik Pesantren - Kelola data pesantren dengan mudah</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Total Santri', value: stats?.totalSantri ?? 0, icon: <Icon name="users" className="w-8 h-8" />, bg: 'bg-white', border: 'border-blue-400', text: 'text-blue-600', iconBg: 'bg-blue-50' },
                        { title: 'Total Ustadz', value: stats?.totalUstadz ?? 0, icon: <Icon name="teacher" className="w-8 h-8" />, bg: 'bg-white', border: 'border-emerald-400', text: 'text-emerald-600', iconBg: 'bg-emerald-50' },
                        { title: 'Mata Pelajaran', value: stats?.totalMapel ?? 0, icon: <Icon name="book" className="w-8 h-8" />, bg: 'bg-white', border: 'border-purple-400', text: 'text-purple-600', iconBg: 'bg-purple-50' },
                        { title: 'Jadwal Aktif', value: stats?.totalJadwal ?? 0, icon: <Icon name="calendar" className="w-8 h-8" />, bg: 'bg-white', border: 'border-orange-400', text: 'text-orange-600', iconBg: 'bg-orange-50' },
                    ].map((s, i) => (
                        <div key={i} className={`${s.bg} border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
                            <div className={`absolute top-0 right-0 w-2 h-full ${s.iconBg} ${s.border} border-l-4 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{s.title}</p>
                                    <p className={`${s.text} text-4xl font-bold mt-2`}>{s.value}</p>
                                </div>
                                <div className={`w-14 h-14 rounded-full ${s.iconBg} flex items-center justify-center text-3xl shadow-sm`}>
                                    {s.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Santri */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Icon name="file" className="w-6 h-6 text-slate-500" /> Santri Terbaru Terdaftar
                        </h2>
                    </div>
                    <DataTableWrapper>
                        <thead className="bg-white border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">NIS</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {(recentSantri ?? []).map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-900 font-semibold">{s.nama}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{s.nis}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold">{s.kelas}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!recentSantri || recentSantri.length === 0) && (
                                <EmptyState title="Belum Ada Santri" description="Data santri terbaru akan muncul di sini." colSpan={4} />
                            )}
                        </tbody>
                    </DataTableWrapper>
                </div>
            </div>
        </AdminLayout>
    );
}