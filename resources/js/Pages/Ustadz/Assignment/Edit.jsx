import { Head, useForm, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FormTextarea from '@/Components/FormTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import Icon from '@/Components/Icon';

const formatForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function Edit({ assignment }) {
    const { data, setData, put, processing, errors } = useForm({
        title: assignment?.title || '',
        description: assignment?.description || '',
        due_date: formatForInput(assignment?.due_date),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('ustadz.assignments.update', assignment.id));
    };

    return (
        <UstadzLayout>
            <Head title={`Edit Tugas: ${assignment.title}`} />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('ustadz.assignments.index')}
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Icon name="back" className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Edit Tugas</h1>
                            <p className="text-sm text-slate-500">Perbarui informasi tugas yang berstatus draft</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
                    {/* Read-only metadata summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Mata Pelajaran</span>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{assignment.subject?.nama_mapel || '-'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Kelas</span>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">Kelas {assignment.kelas}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="title" value="Judul Tugas" required />
                            <TextInput
                                id="title"
                                name="title"
                                value={data.title}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            <InputError message={errors.title} className="mt-1.5" />
                        </div>

                        <div>
                            <FormTextarea
                                label="Instruksi / Deskripsi Tugas"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                error={errors.description}
                                rows={5}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="due_date" value="Batas Waktu Pengumpulan (Opsional)" />
                            <TextInput
                                id="due_date"
                                type="datetime-local"
                                name="due_date"
                                value={data.due_date}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('due_date', e.target.value)}
                            />
                            <InputError message={errors.due_date} className="mt-1.5" />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href={route('ustadz.assignments.index')}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </Link>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </UstadzLayout>
    );
}
