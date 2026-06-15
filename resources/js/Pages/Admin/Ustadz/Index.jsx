import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';

export default function UstadzIndex() {
    const ustadzData = [
        { id: 1, nama: 'Ahmad Hidayat', nip: '2024001', mapel: 'Fiqih', status: 'Aktif' },
        { id: 2, nama: 'Siti Nurhaliza', nip: '2024002', mapel: 'Al-Qur\'an', status: 'Aktif' },
        { id: 3, nama: 'Muhammad Rizki', nip: '2024003', mapel: 'Hadis', status: 'Aktif' },
        { id: 4, nama: 'Fatimah Zahra', nip: '2024004', mapel: 'Akidah', status: 'Aktif' },
        { id: 5, nama: 'Imam Malik', nip: '2024005', mapel: 'Nahwu', status: 'Aktif' },
    ];

    return (
        <AdminLayout>
            <Head title="Kelola Ustadz" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">👨‍🏫 Manajemen Ustadz</h1>
                    <Link
                        href={route('admin.ustadz.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                        ➕ Tambah Ustadz
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Total Ustadz</p>
                        <p className="text-3xl font-bold text-blue-600">{ustadzData.length}</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Aktif</p>
                        <p className="text-3xl font-bold text-green-600">5</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Cuti</p>
                        <p className="text-3xl font-bold text-orange-600">0</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">No</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Nama</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">NIP</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Mata Pelajaran</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {ustadzData.map((ustadz, idx) => (
                                <tr key={ustadz.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{idx + 1}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{ustadz.nama}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{ustadz.nip}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{ustadz.mapel}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {ustadz.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={route('admin.ustadz.edit', ustadz.id)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                                            >
                                                ✏️ Edit
                                            </Link>
                                            <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition">
                                                🗑️ Hapus
                                            </button>
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
