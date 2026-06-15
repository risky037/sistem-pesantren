import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';

export default function SantriIndex() {
    const santriData = [
        { id: 1, nama: 'Muhammad Rafiqi', nim: '2024001', prodi: 'Tahfiz', status: 'Aktif' },
        { id: 2, nama: 'Siti Nurhaliza', nim: '2024002', prodi: 'Hafalan', status: 'Aktif' },
        { id: 3, nama: 'Ahmad Hidayat', nim: '2024003', prodi: 'Reguler', status: 'Aktif' },
        { id: 4, nama: 'Fatimah Zahra', nim: '2024004', prodi: 'Tahfiz', status: 'Aktif' },
        { id: 5, nama: 'Imam Malik', nim: '2024005', prodi: 'Reguler', status: 'Aktif' },
    ];

    return (
        <AdminLayout>
            <Head title="Kelola Santri" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">👥 Manajemen Santri</h1>
                    <Link href={route('admin.santri.create')} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                        ➕ Tambah Santri
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-cyan-50 border-l-4 border-cyan-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Total Santri</p>
                        <p className="text-3xl font-bold text-cyan-600">{santriData.length}</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Aktif</p>
                        <p className="text-3xl font-bold text-blue-600">5</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Alumni</p>
                        <p className="text-3xl font-bold text-purple-600">0</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-green-500 to-green-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">No</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Nama</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">NIM</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Program</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {santriData.map((santri, idx) => (
                                <tr key={santri.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{idx + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{santri.nama}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{santri.nim}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{santri.prodi}</td>
                                    <td className="px-6 py-4"><span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">{santri.status}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex gap-2 justify-center">
                                            <Link href={route('admin.santri.edit', santri.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold">✏️</Link>
                                            <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
