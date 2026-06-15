import { Head, Link, router } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

export default function MateriIndex({ materis }) {
    const handleDelete = (id, judul) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Yakin ingin menghapus materi "${judul}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('ustadz.materi.destroy', id), {
                    preserveScroll: true
                });
            }
        });
    };

    return (
        <UstadzLayout>
            <Head title="Materi Ajar" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">📚 Materi Ajar Saya</h1>
                    <Link href={route('ustadz.materi.create')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                        ➕ Tambah Materi
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Judul Materi</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Mapel</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Kelas</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">File</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Tanggal</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {materis.data.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{m.judul}</td>
                                        <td className="px-6 py-4 text-gray-600">{m.subject?.nama_mapel}</td>
                                        <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{m.kelas || '-'}</span></td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {m.original_file_name ? (
                                                <a href={`/storage/${m.file_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">📎 {m.original_file_name}</a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{m.published_at || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <Link href={route('ustadz.materi.edit', m.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition">✏️ Edit</Link>
                                                <button onClick={() => handleDelete(m.id, m.judul)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition">🗑️ Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {materis.data.length === 0 && (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Belum ada materi.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination links={materis.links} />
            </div>
        </UstadzLayout>
    );
}
