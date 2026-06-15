import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';

export default function JadwalIndex() {
    const jadwalData = [
        { id: 1, hari: 'Senin', jam: '08:00 - 09:30', mapel: 'Fiqih', dosen: 'Ahmad Hidayat', kelas: 'XII-A' },
        { id: 2, hari: 'Selasa', jam: '09:30 - 11:00', mapel: 'Al-Qur\'an', dosen: 'Siti Nurhaliza', kelas: 'XII-A' },
        { id: 3, hari: 'Rabu', jam: '13:00 - 14:30', mapel: 'Hadis', dosen: 'Muhammad Rizki', kelas: 'XII-B' },
        { id: 4, hari: 'Kamis', jam: '10:00 - 11:30', mapel: 'Akidah', dosen: 'Fatimah Zahra', kelas: 'XI-A' },
    ];

    return (
        <AdminLayout>
            <Head title="Jadwal Kelas" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">📅 Jadwal Kelas</h1>
                    <Link href={route('admin.jadwal.create')} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg">
                        ➕ Tambah Jadwal
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Total Jadwal</p>
                        <p className="text-3xl font-bold text-orange-600">{jadwalData.length}</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Hari Kerja</p>
                        <p className="text-3xl font-bold text-yellow-600">5</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Hari</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Jam</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Mapel</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Dosen</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kelas</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {jadwalData.map((jadwal) => (
                                <tr key={jadwal.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{jadwal.hari}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{jadwal.jam}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{jadwal.mapel}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{jadwal.dosen}</td>
                                    <td className="px-6 py-4 text-sm"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{jadwal.kelas}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex gap-2 justify-center">
                                            <Link href={route('admin.jadwal.edit', jadwal.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold">✏️</Link>
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
