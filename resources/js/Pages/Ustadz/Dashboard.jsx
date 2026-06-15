import { Head } from '@inertiajs/react';
import UstadzLayout from './Components/Layouts/UstadzLayout';

export default function Dashboard({ stats, jadwalHariIni }) {
    const statsCards = [
        { title: 'Total Kelas', value: stats?.totalKelas ?? 0, subtitle: 'Yang Diampu', icon: '📚', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-400', textColor: 'text-indigo-600' },
        { title: 'Total Santri', value: stats?.totalSantri ?? 0, subtitle: 'Terdaftar', icon: '👥', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-400', textColor: 'text-cyan-600' },
        { title: 'Total Materi', value: stats?.totalMateri ?? 0, subtitle: 'Yang Diunggah', icon: '📄', bgColor: 'bg-amber-50', borderColor: 'border-amber-400', textColor: 'text-amber-600' },
        { title: 'Penilaian', value: stats?.totalPenilaian ?? 0, subtitle: 'Terisi', icon: '✅', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-400', textColor: 'text-emerald-600' },
    ];

    return (
        <UstadzLayout>
            <Head title="Dashboard Ustadz" />
            
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-xl p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">Dashboard Ustadz</h1>
                    <p className="text-indigo-100 text-lg">Sistem Informasi Akademik Pesantren - Kelola pembelajaran dengan efisien</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statsCards.map((stat, idx) => (
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

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white">📅 Jadwal Mengajar</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {(jadwalHariIni ?? []).map((jadwal) => (
                            <div key={jadwal.id} className="border border-indigo-200 rounded-lg p-5 hover:shadow-md transition hover:border-indigo-400">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{jadwal.kelas}</h3>
                                        <p className="text-indigo-600 font-semibold">{jadwal.subject?.nama_mapel}</p>
                                    </div>
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        {jadwal.hari}
                                    </span>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                    <span>⏰ {jadwal.jam_mulai?.substring(0,5)} - {jadwal.jam_selesai?.substring(0,5)}</span>
                                    <span>📍 {jadwal.ruang || '-'}</span>
                                </div>
                            </div>
                        ))}
                        {(!jadwalHariIni || jadwalHariIni.length === 0) && (
                            <p className="text-center text-gray-500 py-4">Belum ada jadwal mengajar.</p>
                        )}
                    </div>
                </div>
            </div>
        </UstadzLayout>
    );
}
