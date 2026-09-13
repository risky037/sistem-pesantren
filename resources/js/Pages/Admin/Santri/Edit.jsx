import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FormSelect from '@/Components/FormSelect';
import FormTextarea from '@/Components/FormTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Icon from '@/Components/Icon';
import Swal from 'sweetalert2';

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
        email: santri.user ? santri.user.email : '',
        email_wali: santri.email_wali || '',
        telepon: santri.telepon || '',
    });

    const {
        data: resetData,
        setData: setResetData,
        post: postReset,
        processing: resetProcessing,
        errors: resetErrors,
        reset: clearResetForm,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.santri.update', santri.id), { preserveScroll: true });
    };

    const handleResetPassword = (e) => {
        e.preventDefault();

        Swal.fire({
            title: 'Reset Password Santri?',
            text: `Password akun "${santri.nama}" akan direset. Pastikan Anda telah menyiapkan password baru untuk disampaikan secara langsung.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, reset password!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                postReset(route('admin.santri.reset-password', santri.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        clearResetForm();
                        Swal.fire(
                            'Berhasil!',
                            `Password santri "${santri.nama}" telah direset.`,
                            'success'
                        );
                    },
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Edit Santri" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('admin.santri.index')} className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors" aria-label="Kembali ke Daftar Santri">← Kembali</Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Edit Data Santri</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-5xl">
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
                                <InputLabel htmlFor="email" value="Email Login" />
                                <TextInput id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="email_wali" value="Email Wali (opsional)" />
                                <TextInput id="email_wali" type="email" value={data.email_wali} onChange={e => setData('email_wali', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.email_wali} className="mt-2" />
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

                {/* Admin Password Reset Section */}
                <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 sm:p-8 max-w-5xl">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-gray-900">Reset Password</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Reset password akun santri ini. Password baru harus disampaikan langsung kepada santri yang bersangkutan.
                        </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-4 max-w-2xl">
                        <div>
                            <InputLabel htmlFor="reset_password" value="Password Baru" />
                            <TextInput
                                id="reset_password"
                                type="password"
                                value={resetData.password}
                                onChange={e => setResetData('password', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Minimal 8 karakter"
                                autoComplete="new-password"
                            />
                            <InputError message={resetErrors.password} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="reset_password_confirmation" value="Konfirmasi Password Baru" />
                            <TextInput
                                id="reset_password_confirmation"
                                type="password"
                                value={resetData.password_confirmation}
                                onChange={e => setResetData('password_confirmation', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Ulangi password baru"
                                autoComplete="new-password"
                            />
                            <InputError message={resetErrors.password_confirmation} className="mt-2" />
                        </div>
                        <div className="pt-2">
                            <DangerButton type="submit" disabled={resetProcessing} className="justify-center">
                                {resetProcessing ? 'Mereset...' : 'Reset Password Santri'}
                            </DangerButton>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
