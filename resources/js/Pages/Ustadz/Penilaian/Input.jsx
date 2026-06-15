import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';

export default function PenilaianInput() {
    const santriList = [
        { id: 1, nama: 'Ahmad Rizki', nim: '2024001', uts: 85, uas: 88, tugas: 90 },
        { id: 2, nama: 'Siti Mariam', nim: '2024002', uts: 78, uas: 82, tugas: 85 },
        { id: 3, nama: 'Muhammad Ikhsan', nim: '2024003', uts: 92, uas: 95, tugas: 93 },
    ];

    return (
        <UstadzLayout>
            <Head title="Input Penilaian" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('ustadz.penilaian.index')} className="text-amber-600 hover:text-amber-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Input Penilaian - Kelas XII-A</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <table className="w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama Santri</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">UTS</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">UAS</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Tugas</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Rata-rata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {santriList.map((s) => {
                                const avg = ((s.uts + s.uas + s.tugas) / 3).toFixed(2);
                                return (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{s.nama}</td>
                                        <td className="px-6 py-4"><input type="number" defaultValue={s.uts} max="100" className="w-16 border border-gray-300 rounded px-2 py-1" /></td>
                                        <td className="px-6 py-4"><input type="number" defaultValue={s.uas} max="100" className="w-16 border border-gray-300 rounded px-2 py-1" /></td>
                                        <td className="px-6 py-4"><input type="number" defaultValue={s.tugas} max="100" className="w-16 border border-gray-300 rounded px-2 py-1" /></td>
                                        <td className="px-6 py-4 text-center font-semibold text-blue-600">{avg}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="mt-6 flex gap-4">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-lg">💾 Simpan Nilai</button>
                        <Link href={route('ustadz.penilaian.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg">❌ Batal</Link>
                    </div>
                </div>
            </div>
        </UstadzLayout>
    );
}
