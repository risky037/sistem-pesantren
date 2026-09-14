import { Head } from '@inertiajs/react';
import SantriLayout from './Components/Layouts/SantriLayout';
import Icon from '@/Components/Icon';

export default function Schedule({ jadwals, activePeriod }) {
    const hariUrutan = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7 };
    
    // Sort schedules by Day, then Start Time
    const sortedJadwals = (jadwals || []).sort((a, b) => {
        if (hariUrutan[a.hari] !== hariUrutan[b.hari]) {
            return hariUrutan[a.hari] - hariUrutan[b.hari];
        }
        return a.jam_mulai.localeCompare(b.jam_mulai);
    });

    return (
        <SantriLayout>
            <Head title="Jadwal Kelas" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Jadwal Kelas</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {activePeriod ? `Tahun Ajaran ${activePeriod.tahun_ajaran} - Semester ${activePeriod.semester}` : 'Tidak ada periode akademik aktif.'}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Hari</th>
                                    <th className="px-6 py-4 font-bold">Waktu</th>
                                    <th className="px-6 py-4 font-bold">Mata Pelajaran</th>
                                    <th className="px-6 py-4 font-bold">Pengajar</th>
                                    <th className="px-6 py-4 font-bold">Ruang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sortedJadwals.length > 0 ? (
                                    sortedJadwals.map((jadwal) => (
                                        <tr key={jadwal.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {jadwal.hari}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Icon name="clock" className="w-4 h-4 opacity-70" />
                                                    {jadwal.jam_mulai?.substring(0, 5)} - {jadwal.jam_selesai?.substring(0, 5)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-emerald-700">
                                                {jadwal.subject?.nama_mapel}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {jadwal.ustadz?.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <span className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200">
                                                    <Icon name="location" className="w-3.5 h-3.5 opacity-70" />
                                                    {jadwal.ruang || '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <Icon name="calendar" className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="text-base font-medium">Belum ada jadwal kelas untuk Anda.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SantriLayout>
    );
}
