import { Head, Link, router } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';
import PageHeader from '@/Components/PageHeader';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import ActionButtons from '@/Components/ActionButtons';

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
                <PageHeader 
                    title="📚 Materi Ajar Saya" 
                    actionText="Tambah Materi" 
                    actionHref={route('ustadz.materi.create')} 
                />

                <DataTableWrapper>
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Judul Materi</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Mapel</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Kelas</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">File</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Tanggal</th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {materis.data.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{m.judul}</td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{m.subject?.nama_mapel}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-semibold">{m.kelas || '-'}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {m.original_file_name ? (
                                        <a href={`/storage/${m.file_path}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:underline" aria-label={`Unduh ${m.original_file_name}`}>📎 {m.original_file_name}</a>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{m.published_at || '-'}</td>
                                <td className="px-6 py-4">
                                    <ActionButtons>
                                        <Link href={route('ustadz.materi.edit', m.id)} className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Edit ${m.judul}`}>✏️ Edit</Link>
                                        <button onClick={() => handleDelete(m.id, m.judul)} className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm" aria-label={`Hapus ${m.judul}`}>🗑️ Hapus</button>
                                    </ActionButtons>
                                </td>
                            </tr>
                        ))}
                        {materis.data.length === 0 && (
                            <EmptyState title="Data Materi Kosong" description="Belum ada materi." colSpan={6} />
                        )}
                    </tbody>
                </DataTableWrapper>

                <Pagination links={materis.links} />
            </div>
        </UstadzLayout>
    );
}
