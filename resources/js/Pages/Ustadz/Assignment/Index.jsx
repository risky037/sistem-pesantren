import { Head, Link, router } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';
import PageHeader from '@/Components/PageHeader';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import ActionButtons from '@/Components/ActionButtons';
import Icon from '@/Components/Icon';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

export default function AssignmentIndex({ assignments }) {
    const handleDelete = (id, title) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Yakin ingin menghapus tugas "${title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('ustadz.assignments.destroy', id), {
                    preserveScroll: true
                });
            }
        });
    };

    const handleOpen = (id) => {
        router.patch(route('ustadz.assignments.open', id), {}, { preserveScroll: true });
    };

    const handleClose = (id) => {
        router.patch(route('ustadz.assignments.close', id), {}, { preserveScroll: true });
    };

    return (
        <UstadzLayout>
            <Head title="Tugas" />
            
            <div className="space-y-6">
                <PageHeader 
                    title={<div className="flex items-center"><Icon name="document-text" className="w-7 h-7 mr-3 text-emerald-600" /> Tugas Saya</div>} 
                    actionText="Tambah Tugas" 
                    actionHref={route('ustadz.assignments.create')} 
                />

                <DataTableWrapper>
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Judul</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Mapel</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Kelas</th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Batas Waktu</th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {assignments.data.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{a.title}</td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{a.subject?.nama_mapel}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-semibold">{a.kelas}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{formatDate(a.due_date)}</td>
                                <td className="px-6 py-4 text-center text-sm">
                                    {a.status === 'draft' && <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">Draft</span>}
                                    {a.status === 'open' && <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Open</span>}
                                    {a.status === 'closed' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Closed</span>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <ActionButtons>
                                        {a.status === 'draft' && (
                                            <>
                                                <button onClick={() => handleOpen(a.id)} className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold mr-2">Buka</button>
                                                <Link href={route('ustadz.assignments.edit', a.id)} className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold mr-2">Edit</Link>
                                                <button onClick={() => handleDelete(a.id, a.title)} className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold">Hapus</button>
                                            </>
                                        )}
                                        {a.status === 'open' && (
                                            <button onClick={() => handleClose(a.id)} className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold">Tutup</button>
                                        )}
                                    </ActionButtons>
                                </td>
                            </tr>
                        ))}
                        {assignments.data.length === 0 && (
                            <EmptyState 
                                title="Data Tugas Kosong" 
                                description="Belum ada tugas." 
                                colSpan={6} 
                            />
                        )}
                    </tbody>
                </DataTableWrapper>

                <Pagination links={assignments.links} />
            </div>
        </UstadzLayout>
    );
}
