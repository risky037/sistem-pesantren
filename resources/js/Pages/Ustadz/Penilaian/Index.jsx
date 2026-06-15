import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import FlashMessage from '@/Components/FlashMessage';

export default function PenilaianIndex({ summary }) {
    return (
        <UstadzLayout>
            <Head title="Penilaian" />
            
            <div className="space-y-6">
                <FlashMessage />
                <h1 className="text-3xl font-bold text-gray-900">⭐ Manajemen Penilaian</h1>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-amber-500 to-amber-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Mata Pelajaran</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kelas</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Total Santri</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Sudah Dinilai</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Progress</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {(summary ?? []).map((s) => {
                                    const pct = s.totalSantri > 0 ? Math.round((s.gradedSantri / s.totalSantri) * 100) : 0;
                                    return (
                                        <tr key={s.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{s.nama_mapel}</td>
                                            <td className="px-6 py-4 text-gray-600">{(s.kelas ?? []).join(', ')}</td>
                                            <td className="px-6 py-4 text-gray-600">{s.totalSantri}</td>
                                            <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">{s.gradedSantri}/{s.totalSantri}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div className="bg-green-500 h-2 rounded-full" style={{width: `${pct}%`}}></div>
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700">{pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link href={route('ustadz.penilaian.input', s.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-xs font-semibold transition">✏️ Input Nilai</Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {(!summary || summary.length === 0) && (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Belum ada mata pelajaran yang diampu.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </UstadzLayout>
    );
}
