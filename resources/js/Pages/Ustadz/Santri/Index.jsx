import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';

export default function SantriIndex() {
    const santriData = [
        { id: 1, nama: 'Ahmad Rizki', nim: '2024001', kelas: 'XII-A', status: 'Aktif' },
        { id: 2, nama: 'Siti Mariam', nim: '2024002', kelas: 'XII-A', status: 'Aktif' },
        { id: 3, nama: 'Muhammad Ikhsan', nim: '2024003', kelas: 'XII-B', status: 'Aktif' },
        { id: 4, nama: 'Fatimah Nur', nim: '2024004', kelas: 'XII-B', status: 'Aktif' },
        { id: 5, nama: 'Ali Hidayat', nim: '2024005', kelas: 'XI-A', status: 'Aktif' },
    ];

    return (
        <UstadzLayout>
            <Head title="Data Santri" />
            
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">👥 Data Santri Saya</h1>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-cyan-50 border-l-4 border-cyan-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Total Santri</p>
                        <p className="text-3xl font-bold text-cyan-600">{santriData.length}</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Kelas XII</p>
                        <p className="text-3xl font-bold text-green-600">4</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Kelas XI</p>
                        <p className="text-3xl font-bold text-blue-600">1</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-cyan-500 to-cyan-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Nama</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">NIM</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kelas</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {santriData.map((santri) => (
                                <tr key={santri.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{santri.nama}</td>
                                    <td className="px-6 py-4 text-gray-600">{santri.nim}</td>
                                    <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{santri.kelas}</span></td>
                                    <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">{santri.status}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={route('ustadz.santri.detail', santri.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-xs font-semibold">👁️ Detail</Link>
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
