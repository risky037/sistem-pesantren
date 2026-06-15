import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

export default function UstadzIndex({ ustadzs }) {
    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Yakin ingin menghapus ustadz "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.ustadz.destroy', id), {
                    preserveScroll: true
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Kelola Ustadz" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">👨‍🏫 Manajemen Ustadz</h1>
                    <Link href={route('admin.ustadz.create')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                        ➕ Tambah Ustadz
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">No</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Nama</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Email</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {ustadzs.data.map((u, idx) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{ustadzs.from + idx}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{u.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={route('admin.ustadz.edit', u.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition">
                                                    ✏️ Edit
                                                </Link>
                                                <button onClick={() => handleDelete(u.id, u.name)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition">
                                                    🗑️ Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {ustadzs.data.length === 0 && (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Belum ada data ustadz.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination links={ustadzs.links} />
            </div>
        </AdminLayout>
    );
}
