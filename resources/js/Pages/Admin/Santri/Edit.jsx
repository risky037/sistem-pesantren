import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FormSelect from '@/Components/FormSelect';
import FormTextarea from '@/Components/FormTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Icon from '@/Components/Icon';

export default function SantriEdit({ santri }) {
    const { data, setData, put, processing, errors } = useForm({
        nis: santri.nis || '',
        nama: santri.nama || '',
        jenis_kelamin: santri.jenis_kelamin || 'L',
        tanggal_lahir: santri.tanggal_lahir ? santri.tanggal_lahir.split('T')[0] : '',
        alamat: santri.alamat || '',
        kelas: santri.kelas || '',
        program: santri.program || '',
        status: santri.status || 'aktif',
        email: santri.email || '',
        telepon: santri.telepon || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.santri.update', santri.id));
    };

    return (
        <AdminLayout>
            <Head title="Edit Santri" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('admin.santri.index')} className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors" aria-label="Kembali ke Daftar Santri">← Kembali</Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Edit Data Santri</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-3xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="nis" value="NIS" />
                                <TextInput id="nis" type="text" value={data.nis} onChange={e => setData('nis', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.nis} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="nama" value="Nama Lengkap" />
                                <TextInput id="nama" type="text" value={data.nama} onChange={e => setData('nama', e.target.value)} className="mt-1 block w-full" />
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
                                <TextInput id="kelas" type="text" value={data.kelas} onChange={e => setData('kelas', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.kelas} className="mt-2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="program" value="Program" />
                                <TextInput id="program" type="text" value={data.program} onChange={e => setData('program', e.target.value)} className="mt-1 block w-full" />
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
                            <FormTextarea id="alamat" value={data.alamat} onChange={e => setData('alamat', e.target.value)} className="mt-1 block w-full" rows="3" />
                            <InputError message={errors.alamat} className="mt-2" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="email" value="Email (opsional)" />
                                <TextInput id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="telepon" value="Telepon (opsional)" />
                                <TextInput id="telepon" type="text" value={data.telepon} onChange={e => setData('telepon', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.telepon} className="mt-2" />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                            <PrimaryButton type="submit" className="justify-center py-2.5 sm:w-auto w-full" disabled={processing}>
                                {processing ? (
                                    <><Icon name="spinner" className="w-5 h-5 mr-2" /> Menyimpan...</>
                                ) : (
                                    <><Icon name="save" className="w-5 h-5 mr-2" /> Update Data</>
                                )}
                            </PrimaryButton>
                            <Link href={route('admin.santri.index')} className="w-full sm:w-auto">
                                <SecondaryButton type="button" className="justify-center py-2.5 w-full">
                                    <Icon name="cancel" className="w-5 h-5 mr-2" />
                                    Batal
                                </SecondaryButton>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
