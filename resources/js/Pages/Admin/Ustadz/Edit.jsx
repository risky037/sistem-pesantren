import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Icon from '@/Components/Icon';
import Swal from 'sweetalert2';

export default function UstadzEdit({ ustadz }) {
    const { data, setData, put, processing, errors } = useForm({
        name: ustadz.name || '',
        email: ustadz.email || '',
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
        // Route disesuaikan dengan web.php (tanpa awalan admin.)
        put(route('ustadz.update', ustadz.id), {
            preserveScroll: true,
        });
    };

    const handleResetPassword = (e) => {
        e.preventDefault();

        Swal.fire({
            title: 'Reset Password Ustadz?',
            text: `Password akun "${ustadz.name}" akan direset. Pastikan Anda telah menyiapkan password baru untuk disampaikan secara langsung.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, reset password!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                postReset(route('admin.ustadz.reset-password', ustadz.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        clearResetForm();
                        Swal.fire(
                            'Berhasil!',
                            `Password ustadz "${ustadz.name}" telah direset.`,
                            'success'
                        );
                    },
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Edit Ustadz" />

            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    {/* Route disesuaikan dengan web.php */}
                    <Link href={route('ustadz.index')} className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors" aria-label="Kembali ke Daftar Ustadz">← Kembali</Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Edit Data Ustadz</h1>
                </div>

                {/* Main Edit Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" />
                            <TextInput
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                            <PrimaryButton type="submit" className="justify-center py-2.5 sm:w-auto w-full" disabled={processing}>
                                {processing ? (
                                    <><Icon name="spinner" className="w-5 h-5 mr-2" /> Menyimpan...</>
                                ) : (
                                    <><Icon name="save" className="w-5 h-5 mr-2" /> Update Data</>
                                )}
                            </PrimaryButton>
                            <Link href={route('ustadz.index')} className="w-full sm:w-auto">
                                <SecondaryButton type="button" className="justify-center py-2.5 w-full">
                                    <Icon name="cancel" className="w-5 h-5 mr-2" />
                                    Batal
                                </SecondaryButton>
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Admin Password Reset Section */}
                <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 sm:p-8 max-w-2xl">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-gray-900">Reset Password</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Reset password akun ustadz ini. Password baru harus disampaikan langsung kepada ustadz yang bersangkutan.
                        </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-4">
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
                                {resetProcessing ? 'Mereset...' : 'Reset Password Ustadz'}
                            </DangerButton>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}