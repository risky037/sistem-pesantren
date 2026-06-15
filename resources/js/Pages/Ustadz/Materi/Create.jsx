import { Head, Link, useForm } from '@inertiajs/react';
import UstadzLayout from '../Components/Layouts/UstadzLayout';
import InputError from '@/Components/InputError';

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
                <div className="flex items-center gap-4">
                    <Link href={route('ustadz.materi.index')} className="text-emerald-600 hover:text-emerald-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Materi Ajar</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Materi</label>
                            <input type="text" value={data.judul} onChange={e => setData('judul', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Judul materi pembelajaran" />
                            <InputError message={errors.judul} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran</label>
                                <select value={data.subject_id} onChange={e => setData('subject_id', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                                    <option value="">Pilih Mapel</option>
                                    {(subjects ?? []).map(s => <option key={s.id} value={s.id}>{s.nama_mapel}</option>)}
                                </select>
                                <InputError message={errors.subject_id} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                                <input type="text" value={data.kelas} onChange={e => setData('kelas', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="XII-A (opsional)" />
                                <InputError message={errors.kelas} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Materi</label>
                            <textarea value={data.deskripsi} onChange={e => setData('deskripsi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" rows="4" placeholder="Deskripsi materi (opsional)"></textarea>
                            <InputError message={errors.deskripsi} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload File</label>
                                <input type="file" onChange={e => setData('file', e.target.files[0])} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                                <InputError message={errors.file} className="mt-1" />
                                <p className="text-xs text-gray-400 mt-1">Maks 10MB</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Publish</label>
                                <input type="date" value={data.published_at} onChange={e => setData('published_at', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                                <InputError message={errors.published_at} className="mt-1" />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-8 rounded-lg transition disabled:opacity-50">
                                {processing ? '⏳ Menyimpan...' : '💾 Simpan'}
                            </button>
                            <Link href={route('ustadz.materi.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg transition">❌ Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </UstadzLayout>
    );
}
