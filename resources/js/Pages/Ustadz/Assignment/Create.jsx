import { Head, useForm, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FormSelect from '@/Components/FormSelect';
import FormTextarea from '@/Components/FormTextarea';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ subjects, kelasList }) {
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
            <Head title="Tambah Tugas" />
            
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Tambah Tugas Baru</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="title" value="Judul Tugas" />
                        <TextInput
                            id="title"
                            name="title"
                            value={data.title}
                            className="mt-1 block w-full"
                            onChange={e => setData('title', e.target.value)}
                            required
                        />
                        <InputError message={errors.title} className="mt-2" />
                    </div>

                    <FormSelect
                        label="Mata Pelajaran"
                        value={data.subject_id}
                        onChange={e => setData('subject_id', e.target.value)}
                        error={errors.subject_id}
                        required
                    >
                        <option value="">Pilih Mata Pelajaran</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>{subject.nama_mapel}</option>
                        ))}
                    </FormSelect>

                    <FormSelect
                        label="Kelas"
                        value={data.kelas}
                        onChange={e => setData('kelas', e.target.value)}
                        error={errors.kelas}
                        required
                    >
                        <option value="">Pilih Kelas</option>
                        {kelasList.map(kelas => (
                            <option key={kelas} value={kelas}>{kelas}</option>
                        ))}
                    </FormSelect>

                    <FormTextarea
                        label="Deskripsi"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        error={errors.description}
                        rows={4}
                    />

                    <div>
                        <InputLabel htmlFor="due_date" value="Batas Waktu" />
                        <TextInput
                            id="due_date"
                            type="datetime-local"
                            name="due_date"
                            value={data.due_date}
                            className="mt-1 block w-full"
                            onChange={e => setData('due_date', e.target.value)}
                        />
                        <InputError message={errors.due_date} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-end pt-4 space-x-3">
                        <Link href={route('ustadz.assignments.index')} className="text-slate-600 hover:text-slate-900 font-semibold px-4 py-2">
                            Batal
                        </Link>
                        <PrimaryButton disabled={processing}>Simpan sebagai Draft</PrimaryButton>
                    </div>
                </form>
            </div>
        </UstadzLayout>
    );
}
