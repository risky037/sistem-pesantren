import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FormSelect from '@/Components/FormSelect';
import FormTextarea from '@/Components/FormTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function SantriCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nis: '',
        nama: '',
        jenis_kelamin: 'L',
        tanggal_lahir: '',
        alamat: '',
        kelas: '',
        program: '',
        status: 'aktif',
        email: '',
        telepon: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.santri.store'));
    };

    return (
        <AdminLayout>
            <Head title="Tambah Santri" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('admin.santri.index')} className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors" aria-label="Kembali ke Daftar Santri">← Kembali</Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Tambah Santri Baru</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-3xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="nis" value="NIS" />
                                <TextInput id="nis" type="text" value={data.nis} onChange={e => setData('nis', e.target.value)} className="mt-1 block w-full" placeholder="Nomor Induk Santri" />
                                <InputError message={errors.nis} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="nama" value="Nama Lengkap" />
                                <TextInput id="nama" type="text" value={data.nama} onChange={e => setData('nama', e.target.value)} className="mt-1 block w-full" placeholder="Nama santri" />
                                <InputError message={errors.nama} className="mt-2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <InputLabel htmlFor="jenis_kelamin" value="Jenis Kelamin" />
                                <FormSelect id="jenis_kelamin" value={data.jenis_kelamin} onChange={e => setData('jenis_kelamin', e.target.value)} className="mt-1 block w-full">
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </FormSelect>
                                <InputError message={errors.jenis_kelamin} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="tanggal_lahir" value="Tanggal Lahir" />
                                <TextInput id="tanggal_lahir" type="date" value={data.tanggal_lahir} onChange={e => setData('tanggal_lahir', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.tanggal_lahir} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="kelas" value="Kelas" />
                                <TextInput id="kelas" type="text" value={data.kelas} onChange={e => setData('kelas', e.target.value)} className="mt-1 block w-full" placeholder="XII-A" />
                                <InputError message={errors.kelas} className="mt-2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="program" value="Program" />
                                <TextInput id="program" type="text" value={data.program} onChange={e => setData('program', e.target.value)} className="mt-1 block w-full" placeholder="Tahfiz / Reguler" />
                                <InputError message={errors.program} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <FormSelect id="status" value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full">
                                    <option value="aktif">Aktif</option>
                                    <option value="alumni">Alumni</option>
                                    <option value="keluar">Keluar</option>
                                </FormSelect>
                                <InputError message={errors.status} className="mt-2" />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="alamat" value="Alamat" />
                            <FormTextarea id="alamat" value={data.alamat} onChange={e => setData('alamat', e.target.value)} className="mt-1 block w-full" rows="3" placeholder="Alamat lengkap" />
                            <InputError message={errors.alamat} className="mt-2" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="email" value="Email (opsional)" />
                                <TextInput id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full" placeholder="Email santri" />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="telepon" value="Telepon (opsional)" />
                                <TextInput id="telepon" type="text" value={data.telepon} onChange={e => setData('telepon', e.target.value)} className="mt-1 block w-full" placeholder="Nomor telepon" />
                                <InputError message={errors.telepon} className="mt-2" />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                            <PrimaryButton type="submit" className="justify-center py-2.5 sm:w-auto w-full" disabled={processing}>
                                {processing ? '⏳ Menyimpan...' : '💾 Simpan Data'}
                            </PrimaryButton>
                            <Link href={route('admin.santri.index')} className="w-full sm:w-auto">
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
