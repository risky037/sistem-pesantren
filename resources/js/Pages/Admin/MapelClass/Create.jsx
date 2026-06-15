import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FormTextarea from '@/Components/FormTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

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
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('admin.mapel.index')} className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors" aria-label="Kembali ke Daftar Mapel">← Kembali</Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Tambah Mata Pelajaran</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="kode_mapel" value="Kode Mapel" />
                                <TextInput 
                                    id="kode_mapel"
                                    type="text" 
                                    value={data.kode_mapel} 
                                    onChange={e => setData('kode_mapel', e.target.value)} 
                                    className="mt-1 block w-full" 
                                    placeholder="Contoh: FIQ001" 
                                />
                                <InputError message={errors.kode_mapel} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="nama_mapel" value="Nama Mapel" />
                                <TextInput 
                                    id="nama_mapel"
                                    type="text" 
                                    value={data.nama_mapel} 
                                    onChange={e => setData('nama_mapel', e.target.value)} 
                                    className="mt-1 block w-full" 
                                    placeholder="Nama mata pelajaran" 
                                />
                                <InputError message={errors.nama_mapel} className="mt-2" />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="deskripsi" value="Deskripsi" />
                            <FormTextarea 
                                id="deskripsi"
                                value={data.deskripsi} 
                                onChange={e => setData('deskripsi', e.target.value)} 
                                className="mt-1 block w-full" 
                                rows="4" 
                                placeholder="Deskripsi mata pelajaran (opsional)" 
                            />
                            <InputError message={errors.deskripsi} className="mt-2" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                            <PrimaryButton type="submit" className="justify-center py-2.5 sm:w-auto w-full" disabled={processing}>
                                {processing ? '⏳ Menyimpan...' : '💾 Simpan Data'}
                            </PrimaryButton>
                            <Link href={route('admin.mapel.index')} className="w-full sm:w-auto">
                                <SecondaryButton type="button" className="justify-center py-2.5 w-full">
                                    ❌ Batal
                                </SecondaryButton>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
