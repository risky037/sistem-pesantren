import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ period }) {
    const { data, setData, put, processing, errors } = useForm({
        tahun_ajaran: period.tahun_ajaran,
        semester: period.semester,
        started_at: period.started_at || '',
        ended_at: period.ended_at || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.academic-period.update', period.id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Tahun Ajaran</h2>}>
            <Head title="Edit Tahun Ajaran" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 max-w-xl">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="tahun_ajaran" value="Tahun Ajaran (ex: 2024/2025)" />
                                    <TextInput
                                        id="tahun_ajaran"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.tahun_ajaran}
                                        onChange={(e) => setData('tahun_ajaran', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.tahun_ajaran} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="semester" value="Semester" />
                                    <select
                                        id="semester"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.semester}
                                        onChange={(e) => setData('semester', e.target.value)}
                                        required
                                    >
                                        <option value="Ganjil">Ganjil</option>
                                        <option value="Genap">Genap</option>
                                    </select>
                                    <InputError message={errors.semester} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="started_at" value="Tanggal Mulai" />
                                    <TextInput
                                        id="started_at"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.started_at}
                                        onChange={(e) => setData('started_at', e.target.value)}
                                    />
                                    <InputError message={errors.started_at} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="ended_at" value="Tanggal Selesai" />
                                    <TextInput
                                        id="ended_at"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.ended_at}
                                        onChange={(e) => setData('ended_at', e.target.value)}
                                    />
                                    <InputError message={errors.ended_at} className="mt-2" />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>Simpan</PrimaryButton>
                                    <Link href={route('admin.academic-period.index')} className="text-gray-600 hover:text-gray-900">Batal</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
