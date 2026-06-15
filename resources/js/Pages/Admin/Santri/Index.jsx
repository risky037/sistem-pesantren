import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import FlashMessage from '@/Components/FlashMessage';

export default function SantriIndex({ santris }) {
    const handleDelete = (id, nama) => {
        if (confirm(`Yakin ingin menghapus santri "${nama}"?`)) {
            router.delete(route('admin.santri.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Santri" />
            
            <div className="space-y-6">
                <FlashMessage />
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">🎓 Manajemen Santri</h1>
                    <Link href={route('admin.santri.create')} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                        ➕ Tambah Santri
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-green-500 to-green-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">NIS</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Nama</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">JK</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kelas</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {santris.data.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.nis}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{s.nama}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                                        <td className="px-6 py-4 text-sm"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{s.kelas}</span></td>
                                        <td className="px-6 py-4 text-sm"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold capitalize">{s.status}</span></td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <Link href={route('admin.santri.edit', s.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition">✏️ Edit</Link>
                                                <button onClick={() => handleDelete(s.id, s.nama)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition">🗑️ Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {santris.data.length === 0 && (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Belum ada data santri.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination links={santris.links} />
            </div>
        </AdminLayout>
    );
}
