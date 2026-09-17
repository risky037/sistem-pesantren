import { Head, Link } from '@inertiajs/react';
import SantriLayout from '../Components/Layouts/SantriLayout';
import Pagination from '@/Components/Pagination';
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

export default function AssignmentIndex({ assignments, submissions }) {
    // Determine data source: assignments or submissions
    const isSubmissionsList = Boolean(submissions && submissions.data);
    const paginated = isSubmissionsList ? submissions : assignments;
    const items = paginated?.data || [];

    return (
        <SantriLayout>
            <Head title="Tugas Saya" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                            <Icon name="file" className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Tugas Saya</h1>
                            <p className="text-sm text-slate-500">Daftar penugasan dan status pengerjaan Anda</p>
                        </div>
                    </div>
                </div>

                <DataTableWrapper>
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Judul Tugas</th>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mata Pelajaran</th>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Batas Waktu</th>
                            <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {items.map((item) => {
                            const assignment = isSubmissionsList ? item.assignment : item;
                            const submissionStatus = isSubmissionsList ? item.status : item.submission?.status;
                            const targetId = assignment?.id;

                            const targetHref = route('santri.assignments.show', targetId);

                            return (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">
                                        {assignment?.title || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        {assignment?.subject?.nama_mapel || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        {formatDate(assignment?.due_date)}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm">
                                        {submissionStatus === 'submitted' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                Terkumpul
                                            </span>
                                        ) : submissionStatus === 'draft' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                                Draft
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                Belum Dikerjakan
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <ActionButtons>
                                            {targetId && (
                                                <Link
                                                    href={targetHref}
                                                    className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                                >
                                                    {submissionStatus === 'submitted' ? 'Lihat Jawaban' : 'Kerjakan Tugas'}
                                                </Link>
                                            )}
                                        </ActionButtons>
                                    </td>
                                </tr>
                            );
                        })}
                        {items.length === 0 && (
                            <EmptyState
                                title="Tidak Ada Tugas"
                                description="Saat ini belum ada tugas yang tersedia untuk Anda."
                                colSpan={5}
                            />
                        )}
                    </tbody>
                </DataTableWrapper>

                {paginated?.links && <Pagination links={paginated.links} />}
            </div>
        </SantriLayout>
    );
}
