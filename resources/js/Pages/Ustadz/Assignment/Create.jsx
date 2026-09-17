import { Head, useForm, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FormSelect from '@/Components/FormSelect';
import FormTextarea from '@/Components/FormTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import Icon from '@/Components/Icon';

export default function Create({ subjects = [], kelasList = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        subject_id: '',
        kelas: '',
        due_date: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('ustadz.assignments.store'));
    };

    return (
        <UstadzLayout>
            <Head title="Tambah Tugas Baru" />

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
                            <h1 className="text-xl font-bold text-slate-800">Tambah Tugas Baru</h1>
                            <p className="text-sm text-slate-500">Buat penugasan baru untuk santri di kelas Anda</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="title" value="Judul Tugas" required />
                            <TextInput
                                id="title"
                                name="title"
                                value={data.title}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Contoh: Tugas Bab 1: Pemahaman Fiqih Shalat"
                                required
                            />
                            <InputError message={errors.title} className="mt-1.5" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <FormSelect
                                    label="Mata Pelajaran"
                                    value={data.subject_id}
                                    onChange={(e) => setData('subject_id', e.target.value)}
                                    error={errors.subject_id}
                                    required
                                >
                                    <option value="">Pilih Mata Pelajaran</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.nama_mapel}
                                        </option>
                                    ))}
                                </FormSelect>
                            </div>

                            <div>
                                <FormSelect
                                    label="Kelas"
                                    value={data.kelas}
                                    onChange={(e) => setData('kelas', e.target.value)}
                                    error={errors.kelas}
                                    required
                                >
                                    <option value="">Pilih Kelas</option>
                                    {kelasList.map((kelas) => (
                                        <option key={kelas} value={kelas}>
                                            Kelas {kelas}
                                        </option>
                                    ))}
                                </FormSelect>
                            </div>
                        </div>

                        <div>
                            <FormTextarea
                                label="Instruksi / Deskripsi Tugas"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                error={errors.description}
                                rows={5}
                                placeholder="Tuliskan petunjuk pengerjaan tugas secara jelas..."
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
                                {processing ? 'Menyimpan...' : 'Simpan sebagai Draft'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </UstadzLayout>
    );
}
