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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export default function AssignmentIndex({ assignments }) {
    const handleDelete = (id, title) => {
        Swal.fire({
            title: 'Hapus Tugas?',
            text: `Tugas "${title}" akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('ustadz.assignments.destroy', id), {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleOpen = (id) => {
        router.patch(route('ustadz.assignments.open', id), {}, { preserveScroll: true });
    };

    const handleClose = (id, title) => {
        Swal.fire({
            title: 'Tutup Tugas?',
            text: `Tugas "${title}" akan ditutup dan santri tidak dapat lagi mengumpulkan jawaban.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Tutup Tugas',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('ustadz.assignments.close', id), {}, { preserveScroll: true });
            }
        });
    };

    const items = assignments?.data || [];

    return (
        <UstadzLayout>
            <Head title="Tugas Saya" />

            <div className="space-y-6">
                <PageHeader
                    title={
                        <div className="flex items-center gap-3">
                            <Icon name="file" className="w-7 h-7 text-indigo-600" />
                            <span>Tugas Saya</span>
                        </div>
                    }
                    actionText="Tambah Tugas"
                    actionHref={route('ustadz.assignments.create')}
                />

                <DataTableWrapper>
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Judul</th>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mata Pelajaran</th>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kelas</th>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Batas Waktu</th>
                            <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {items.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{a.title}</td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{a.subject?.nama_mapel || '-'}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">{a.kelas}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{formatDate(a.due_date)}</td>
                                <td className="px-6 py-4 text-center text-sm">
                                    {a.status === 'draft' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                            Draft
                                        </span>
                                    )}
                                    {a.status === 'open' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            Open
                                        </span>
                                    )}
                                    {a.status === 'closed' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                                            Closed
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <ActionButtons>
                                        <Link
                                            href={route('ustadz.assignments.submissions.index', a.id)}
                                            className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                        >
                                            Jawaban
                                        </Link>

                                        {a.status === 'draft' && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpen(a.id)}
                                                    className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                                >
                                                    Buka
                                                </button>
                                                <Link
                                                    href={route('ustadz.assignments.edit', a.id)}
                                                    className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(a.id, a.title)}
                                                    className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                                >
                                                    Hapus
                                                </button>
                                            </>
                                        )}

                                        {a.status === 'open' && (
                                            <button
                                                type="button"
                                                onClick={() => handleClose(a.id, a.title)}
                                                className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                            >
                                                Tutup
                                            </button>
                                        )}
                                    </ActionButtons>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <EmptyState
                                title="Data Tugas Kosong"
                                description="Belum ada tugas yang dibuat untuk periode akademik aktif."
                                colSpan={6}
                            />
                        )}
                    </tbody>
                </DataTableWrapper>

                {assignments?.links && <Pagination links={assignments.links} />}
            </div>
        </UstadzLayout>
    );
}
