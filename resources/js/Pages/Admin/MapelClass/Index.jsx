import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';

export default function MapelIndex() {
    const mapelData = [
        { id: 1, nama: 'Fiqih', kode: 'FIQ001', sks: 3, dosen: 'Ahmad Hidayat' },
        { id: 2, nama: 'Al-Qur\'an', kode: 'QUR002', sks: 4, dosen: 'Siti Nurhaliza' },
        { id: 3, nama: 'Hadis', kode: 'HAD003', sks: 3, dosen: 'Muhammad Rizki' },
        { id: 4, nama: 'Akidah', kode: 'AKI004', sks: 3, dosen: 'Fatimah Zahra' },
        { id: 5, nama: 'Bahasa Arab', kode: 'ARA005', sks: 2, dosen: 'Imam Malik' },
    ];

    return (
        <AdminLayout>
            <Head title="Mata Pelajaran" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">📚 Mata Pelajaran</h1>
                    <Link href={route('admin.mapel.create')} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg">
                        ➕ Tambah Mapel
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Total Mapel</p>
                        <p className="text-3xl font-bold text-purple-600">{mapelData.length}</p>
                    </div>
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Total SKS</p>
                        <p className="text-3xl font-bold text-indigo-600">15</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-purple-500 to-purple-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kode</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Nama Mapel</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">SKS</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Dosen</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mapelData.map((mapel) => (
                                <tr key={mapel.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{mapel.kode}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{mapel.nama}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{mapel.sks}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{mapel.dosen}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex gap-2 justify-center">
                                            <Link href={route('admin.mapel.edit', mapel.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold">✏️</Link>
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
