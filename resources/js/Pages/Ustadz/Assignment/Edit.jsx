import { Head, useForm, Link } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FormTextarea from '@/Components/FormTextarea';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ assignment }) {
    const { data, setData, put, processing, errors } = useForm({
        title: assignment.title || '',
        description: assignment.description || '',
        due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('ustadz.assignments.update', assignment.id));
    };

    return (
        <UstadzLayout>
            <Head title={`Edit Tugas: ${assignment.title}`} />
            
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Edit Tugas</h2>
                <p className="text-slate-500 mb-6 font-semibold">Mapel: {assignment.subject?.nama_mapel} - Kelas: {assignment.kelas}</p>
                
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
                        <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
                    </div>
                </form>
            </div>
        </UstadzLayout>
    );
}
