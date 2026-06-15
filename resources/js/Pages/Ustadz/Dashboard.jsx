import { Head } from '@inertiajs/react';
import UstadzLayout from './Components/Layouts/UstadzLayout';

export default function Dashboard({ stats, jadwalHariIni }) {
    const statsCards = [
        { title: 'Total Kelas', value: stats?.totalKelas ?? 0, subtitle: 'Yang Diampu', icon: '📚', bg: 'bg-white', border: 'border-indigo-400', textColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
        { title: 'Total Santri', value: stats?.totalSantri ?? 0, subtitle: 'Terdaftar', icon: '👥', bg: 'bg-white', border: 'border-cyan-400', textColor: 'text-cyan-600', iconBg: 'bg-cyan-50' },
        { title: 'Total Materi', value: stats?.totalMateri ?? 0, subtitle: 'Yang Diunggah', icon: '📄', bg: 'bg-white', border: 'border-amber-400', textColor: 'text-amber-600', iconBg: 'bg-amber-50' },
        { title: 'Penilaian', value: stats?.totalPenilaian ?? 0, subtitle: 'Terisi', icon: '✅', bg: 'bg-white', border: 'border-emerald-400', textColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
    ];

    return (
        <UstadzLayout>
            <Head title="Dashboard Ustadz" />
            
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-xl p-8 text-white shadow-sm border border-indigo-900/10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">Dashboard Ustadz</h1>
                    <p className="text-indigo-50 text-lg">Sistem Informasi Akademik Pesantren - Kelola pembelajaran dengan efisien</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, idx) => (
                        <div key={idx} className={`${stat.bg} border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
                            <div className={`absolute top-0 right-0 w-2 h-full ${stat.iconBg} ${stat.border} border-l-4 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.title}</p>
                                    <p className={`${stat.textColor} text-4xl font-bold mt-2`}>{stat.value}</p>
                                    <p className="text-slate-400 text-xs mt-1 font-medium">{stat.subtitle}</p>
                                </div>
                                <div className={`w-14 h-14 rounded-full ${stat.iconBg} flex items-center justify-center text-3xl shadow-sm`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span>📅</span> Jadwal Mengajar
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(jadwalHariIni ?? []).map((jadwal) => (
                            <div key={jadwal.id} className="border border-indigo-100 bg-white rounded-xl p-5 hover:shadow-md transition-shadow hover:border-indigo-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                <div className="flex items-start justify-between mb-4 pl-2">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{jadwal.kelas}</h3>
                                        <p className="text-indigo-600 font-semibold text-sm">{jadwal.subject?.nama_mapel}</p>
                                    </div>
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        {jadwal.hari}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2 text-sm text-slate-600 pl-2">
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-60">⏰</span>
                                        <span className="font-medium">{jadwal.jam_mulai?.substring(0,5)} - {jadwal.jam_selesai?.substring(0,5)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-60">📍</span>
                                        <span className="font-medium">{jadwal.ruang || 'Ruang belum ditentukan'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!jadwalHariIni || jadwalHariIni.length === 0) && (
                            <div className="col-span-full py-8 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mx-auto mb-3">
                                    <span className="text-2xl opacity-50">📅</span>
                                </div>
                                <p className="text-slate-900 font-medium">Belum ada jadwal mengajar.</p>
                                <p className="text-slate-500 text-sm mt-1">Jadwal Anda akan muncul di sini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UstadzLayout>
    );
}
