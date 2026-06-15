import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import FlashMessage from '@/Components/FlashMessage';

export default function JadwalIndex({ jadwals }) {
    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus jadwal ini?')) {
            router.delete(route('admin.jadwal.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Jadwal Kelas" />
            
            <div className="space-y-6">
                <FlashMessage />
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">📅 Jadwal Kelas</h1>
                    <Link href={route('admin.jadwal.create')} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                        ➕ Tambah Jadwal
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Hari</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Jam</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Mapel</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Ustadz</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kelas</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Ruang</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {jadwals.data.map((j) => (
                                    <tr key={j.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{j.hari}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{j.jam_mulai?.substring(0,5)} - {j.jam_selesai?.substring(0,5)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{j.subject?.nama_mapel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{j.ustadz?.name}</td>
                                        <td className="px-6 py-4 text-sm"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{j.kelas}</span></td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{j.ruang || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <Link href={route('admin.jadwal.edit', j.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition">✏️ Edit</Link>
                                                <button onClick={() => handleDelete(j.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition">🗑️ Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {jadwals.data.length === 0 && (
                                    <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Belum ada data jadwal.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination links={jadwals.links} />
            </div>
        </AdminLayout>
    );
}
