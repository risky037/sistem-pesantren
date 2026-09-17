import { Head, useForm, router, Link } from '@inertiajs/react';
import SantriLayout from '../Components/Layouts/SantriLayout';
import FormTextarea from '@/Components/FormTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Icon from '@/Components/Icon';
import Swal from 'sweetalert2';

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

export default function Show({ assignment, submission }) {
    const isSubmitted = submission?.status === 'submitted';
    const hasSubmission = Boolean(submission?.id);

    const { data, setData, post, put, processing, errors } = useForm({
        content: submission?.content || '',
    });

    const handleSaveDraft = (e) => {
        e?.preventDefault();
        if (hasSubmission) {
            put(route('santri.submissions.update', submission.id), {
                preserveScroll: true,
            });
        } else {
            post(route('santri.submissions.store', assignment.id), {
                preserveScroll: true,
            });
        }
    };

    const handleFinalSubmit = () => {
        Swal.fire({
            title: 'Kumpulkan Tugas Final?',
            text: 'Setelah dikumpulkan, jawaban tidak dapat diubah lagi. Pastikan jawaban Anda sudah lengkap.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Kumpulkan Final',
            cancelButtonText: 'Periksa Kembali',
        }).then((result) => {
            if (result.isConfirmed) {
                if (hasSubmission) {
                    if (data.content !== submission.content) {
                        put(route('santri.submissions.update', submission.id), {
                            preserveScroll: true,
                            onSuccess: () => {
                                router.post(route('santri.submissions.submit', submission.id), {}, {
                                    preserveScroll: true,
                                });
                            },
                        });
                    } else {
                        router.post(route('santri.submissions.submit', submission.id), {}, {
                            preserveScroll: true,
                        });
                    }
                } else {
                    post(route('santri.submissions.store', assignment.id), {
                        preserveScroll: true,
                        onSuccess: (page) => {
                            const newSubmissionId = page.props.submission?.id || page.props.flash?.submission_id;

                            if (newSubmissionId) {
                                router.post(route('santri.submissions.submit', newSubmissionId), {}, {
                                    preserveScroll: true,
                                });
                            }
                        },
                    });
                }
            }
        });
    };

    const backHref = route('santri.assignments.index');

    return (
        <SantriLayout>
            <Head title={`Tugas: ${assignment?.title || 'Detail Tugas'}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header & Back Button */}
                <div className="flex items-center gap-3">
                    <Link
                        href={backHref}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Icon name="back" className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{assignment?.title}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
                            <span>{assignment?.subject?.nama_mapel || 'Mata Pelajaran'}</span>
                            <span>&bull;</span>
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">
                                Kelas {assignment?.kelas}
                            </span>
                            <span>&bull;</span>
                            <span>Batas Waktu: {formatDate(assignment?.due_date)}</span>
                        </div>
                    </div>
                </div>

                {/* Assignment Details Card */}
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h2 className="text-base font-bold text-slate-800">Petunjuk & Instruksi Tugas</h2>
                        <span className="text-xs font-medium text-slate-500">
                            Pengampu: {assignment?.ustadz?.name || 'Ustadz Pengampu'}
                        </span>
                    </div>

                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {assignment?.description || (
                            <span className="text-slate-400 italic">Tidak ada instruksi tambahan dari Ustadz.</span>
                        )}
                    </div>
                </div>

                {/* Submission Workflow Card */}
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h2 className="text-base font-bold text-slate-800">Lembar Jawaban Santri</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {isSubmitted
                                    ? 'Jawaban Anda telah dikumpulkan dan berstatus final.'
                                    : 'Tuliskan jawaban Anda di bawah ini sebelum batas waktu berakhir.'}
                            </p>
                        </div>
                        <div>
                            {isSubmitted ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Terkumpul: {formatDate(submission?.submitted_at)}
                                </span>
                            ) : hasSubmission ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                    Draft Tersimpan
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                    Belum Dikirim
                                </span>
                            )}
                        </div>
                    </div>

                    {isSubmitted ? (
                        /* READONLY DISPLAY for submitted state */
                        <div className="space-y-4">
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Jawaban yang Dikumpulkan
                            </label>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                                {submission?.content}
                            </div>
                            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                                <Icon name="check" className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                                <span>Jawaban telah berhasil dikumpulkan secara resmi. Mode edit dinonaktifkan.</span>
                            </div>
                        </div>
                    ) : (
                        /* EDITABLE FORM for draft/new state */
                        <form onSubmit={handleSaveDraft} className="space-y-5">
                            <div>
                                <FormTextarea
                                    label="Isi Jawaban Anda"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    error={errors.content}
                                    rows={8}
                                    placeholder="Ketikkan jawaban Anda di sini secara lengkap..."
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <SecondaryButton
                                    type="submit"
                                    disabled={processing}
                                    className="justify-center"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan sebagai Draft'}
                                </SecondaryButton>

                                <PrimaryButton
                                    type="button"
                                    onClick={handleFinalSubmit}
                                    disabled={processing || !data.content.trim()}
                                    className="justify-center bg-emerald-600 hover:bg-emerald-700 focus:bg-emerald-700"
                                >
                                    Kumpulkan Tugas
                                </PrimaryButton>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </SantriLayout>
    );
}
