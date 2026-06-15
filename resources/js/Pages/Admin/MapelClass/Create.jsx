import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';

export default function MapelCreate() {
    const { data, setData, post, processing, errors } = useForm({
        kode_mapel: '',
        nama_mapel: '',
        deskripsi: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.mapel.store'));
    };

    return (
        <AdminLayout>
            <Head title="Tambah Mapel" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.mapel.index')} className="text-purple-600 hover:text-purple-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Mata Pelajaran</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Kode Mapel</label>
                                <input type="text" value={data.kode_mapel} onChange={e => setData('kode_mapel', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Contoh: FIQ001" />
                                <InputError message={errors.kode_mapel} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Mapel</label>
                                <input type="text" value={data.nama_mapel} onChange={e => setData('nama_mapel', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Nama mata pelajaran" />
                                <InputError message={errors.nama_mapel} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                            <textarea value={data.deskripsi} onChange={e => setData('deskripsi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" rows="4" placeholder="Deskripsi mata pelajaran (opsional)"></textarea>
                            <InputError message={errors.deskripsi} className="mt-1" />
                        </div>
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button type="submit" disabled={processing} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-8 rounded-lg transition disabled:opacity-50">
                                {processing ? '⏳ Menyimpan...' : '💾 Simpan'}
                            </button>
                            <Link href={route('admin.mapel.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg transition">❌ Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
