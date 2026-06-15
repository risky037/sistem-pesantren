import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import FlashMessage from '@/Components/FlashMessage';

export default function MapelIndex({ subjects }) {
    const handleDelete = (id, nama) => {
        if (confirm(`Yakin ingin menghapus mapel "${nama}"?`)) {
            router.delete(route('admin.mapel.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Mata Pelajaran" />
            
            <div className="space-y-6">
                <FlashMessage />
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">📚 Mata Pelajaran</h1>
                    <Link href={route('admin.mapel.create')} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                        ➕ Tambah Mapel
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-purple-500 to-purple-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kode</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Nama Mapel</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Deskripsi</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subjects.data.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.kode_mapel}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.nama_mapel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{s.deskripsi || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <Link href={route('admin.mapel.edit', s.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition">✏️ Edit</Link>
                                                <button onClick={() => handleDelete(s.id, s.nama_mapel)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition">🗑️ Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {subjects.data.length === 0 && (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Belum ada data mata pelajaran.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination links={subjects.links} />
            </div>
        </AdminLayout>
    );
}
