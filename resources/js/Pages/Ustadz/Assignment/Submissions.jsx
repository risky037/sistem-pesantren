import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import Pagination from '@/Components/Pagination';
import DataTableWrapper from '@/Components/DataTableWrapper';
import EmptyState from '@/Components/EmptyState';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

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

export default function Submissions({ assignment, submissions }) {
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const items = submissions?.data || [];

    return (
        <UstadzLayout>
            <Head title={`Jawaban: ${assignment?.title}`} />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('ustadz.assignments.index')}
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Icon name="back" className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Jawaban Tugas: {assignment?.title}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
                                <span>{assignment?.subject?.nama_mapel || 'Mata Pelajaran'}</span>
                                <span>&bull;</span>
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">Kelas {assignment?.kelas}</span>
                                <span>&bull;</span>
                                <span>Batas Waktu: {formatDate(assignment?.due_date)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DataTableWrapper>
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">NIS</th>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nama Santri</th>
                            <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Waktu Pengumpulan</th>
                            <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {items.map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                    {sub.santri?.nis || '-'}
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900 text-sm">
                                    {sub.santri?.nama || sub.santri?.user?.name || '-'}
                                </td>
                                <td className="px-6 py-4 text-center text-sm">
                                    {sub.status === 'submitted' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            Terkumpul
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                            Draft
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-sm">
                                    {sub.submitted_at ? formatDate(sub.submitted_at) : '-'}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSubmission(sub)}
                                        className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                    >
                                        Lihat Jawaban
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <EmptyState
                                title="Belum Ada Jawaban"
                                description="Belum ada santri yang mengumpulkan jawaban untuk tugas ini."
                                colSpan={5}
                            />
                        )}
                    </tbody>
                </DataTableWrapper>

                {submissions?.links && <Pagination links={submissions.links} />}
            </div>

            {/* Modal Detail Jawaban (Read-only view without grading/score/feedback) */}
            <Modal show={selectedSubmission !== null} onClose={() => setSelectedSubmission(null)} maxWidth="2xl">
                {selectedSubmission && (
                    <div className="p-6 space-y-5">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    Jawaban: {selectedSubmission.santri?.nama || selectedSubmission.santri?.user?.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                    NIS: {selectedSubmission.santri?.nis} &bull; Status: {selectedSubmission.status === 'submitted' ? 'Terkumpul' : 'Draft'}
                                    {selectedSubmission.submitted_at && ` • ${formatDate(selectedSubmission.submitted_at)}`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedSubmission(null)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <Icon name="cancel" className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                Isi Jawaban Santri
                            </label>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed font-sans">
                                {selectedSubmission.content || <span className="text-slate-400 italic">Tidak ada teks jawaban.</span>}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <SecondaryButton onClick={() => setSelectedSubmission(null)}>
                                Tutup
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>
        </UstadzLayout>
    );
}
