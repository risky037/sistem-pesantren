import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';

export default function PenilaianIndex() {
    const penilaianData = [
        { id: 1, kelas: 'XII-A', jumlahSantri: 25, inputStatus: '5/25', persentase: 20 },
        { id: 2, kelas: 'XII-B', jumlahSantri: 23, inputStatus: '23/23', persentase: 100 },
        { id: 3, kelas: 'XI-A', jumlahSantri: 28, inputStatus: '15/28', persentase: 54 },
    ];

    return (
        <UstadzLayout>
            <Head title="Penilaian" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">⭐ Manajemen Penilaian</h1>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Total Kelas</p>
                        <p className="text-3xl font-bold text-amber-600">{penilaianData.length}</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Total Santri</p>
                        <p className="text-3xl font-bold text-blue-600">76</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Selesai Dinilai</p>
                        <p className="text-3xl font-bold text-green-600">43</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-amber-500 to-amber-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kelas</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Total Santri</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Selesai Dinilai</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Progress</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {penilaianData.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{p.kelas}</td>
                                    <td className="px-6 py-4 text-gray-600">{p.jumlahSantri}</td>
                                    <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">{p.inputStatus}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{width: `${p.persentase}%`}}></div>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">{p.persentase}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={route('ustadz.penilaian.input', p.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-xs font-semibold">✏️ Input</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </UstadzLayout>
    );
}
