import { Head, Link, useForm } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FormSelect from '@/Components/FormSelect';
import FormTextarea from '@/Components/FormTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function MateriCreate({ subjects }) {
    const { data, setData, post, processing, errors } = useForm({
        subject_id: '',
        judul: '',
        deskripsi: '',
        kelas: '',
        file: null,
        published_at: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('ustadz.materi.store'), {
            forceFormData: true,
        });
    };

    return (
        <UstadzLayout>
            <Head title="Tambah Materi" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('ustadz.materi.index')} className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors" aria-label="Kembali ke Daftar Materi">← Kembali</Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Tambah Materi Ajar</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="judul" value="Judul Materi" />
                            <TextInput 
                                id="judul"
                                type="text" 
                                value={data.judul} 
                                onChange={e => setData('judul', e.target.value)} 
                                className="mt-1 block w-full" 
                                placeholder="Judul materi pembelajaran" 
                            />
                            <InputError message={errors.judul} className="mt-2" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="subject_id" value="Mata Pelajaran" />
                                <FormSelect id="subject_id" value={data.subject_id} onChange={e => setData('subject_id', e.target.value)} className="mt-1 block w-full">
                                    <option value="">Pilih Mapel</option>
                                    {(subjects ?? []).map(s => <option key={s.id} value={s.id}>{s.nama_mapel}</option>)}
                                </FormSelect>
                                <InputError message={errors.subject_id} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="kelas" value="Kelas" />
                                <TextInput 
                                    id="kelas"
                                    type="text" 
                                    value={data.kelas} 
                                    onChange={e => setData('kelas', e.target.value)} 
                                    className="mt-1 block w-full" 
                                    placeholder="XII-A (opsional)" 
                                />
                                <InputError message={errors.kelas} className="mt-2" />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="deskripsi" value="Deskripsi Materi" />
                            <FormTextarea 
                                id="deskripsi"
                                value={data.deskripsi} 
                                onChange={e => setData('deskripsi', e.target.value)} 
                                className="mt-1 block w-full" 
                                rows="4" 
                                placeholder="Deskripsi materi (opsional)" 
                            />
                            <InputError message={errors.deskripsi} className="mt-2" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="file" value="Upload File" />
                                <input 
                                    id="file"
                                    type="file" 
                                    onChange={e => setData('file', e.target.files[0])} 
                                    className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500" 
                                />
                                <InputError message={errors.file} className="mt-2" />
                                <p className="text-xs text-slate-400 mt-1">Maks 10MB</p>
                            </div>
                            <div>
                                <InputLabel htmlFor="published_at" value="Tanggal Publish" />
                                <TextInput 
                                    id="published_at"
                                    type="date" 
                                    value={data.published_at} 
                                    onChange={e => setData('published_at', e.target.value)} 
                                    className="mt-1 block w-full" 
                                />
                                <InputError message={errors.published_at} className="mt-2" />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                            <PrimaryButton type="submit" className="justify-center py-2.5 sm:w-auto w-full" disabled={processing}>
                                {processing ? '⏳ Menyimpan...' : '💾 Simpan Data'}
                            </PrimaryButton>
                            <Link href={route('ustadz.materi.index')} className="w-full sm:w-auto">
                                <SecondaryButton type="button" className="justify-center py-2.5 w-full">
                                    ❌ Batal
                                </SecondaryButton>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </UstadzLayout>
    );
}
