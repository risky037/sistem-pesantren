import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Icon from '@/Components/Icon';

export default function UstadzCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        // Disesuaikan dengan route ustadz.store di web.php
        post(route('ustadz.store'));
    };

    return (
        <AdminLayout>
            <Head title="Tambah Ustadz" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    {/* Disesuaikan dengan route ustadz.index di web.php */}
                    <Link href={route('ustadz.index')} className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors" aria-label="Kembali ke Daftar Ustadz">← Kembali</Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Tambah Ustadz Baru</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-4xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" />
                            <TextInput 
                                id="name"
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                className="mt-1 block w-full" 
                                placeholder="Masukkan nama ustadz" 
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
                                placeholder="Email ustadz" 
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput 
                                id="password"
                                type="password" 
                                value={data.password} 
                                onChange={e => setData('password', e.target.value)} 
                                className="mt-1 block w-full" 
                                placeholder="Minimal 8 karakter" 
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                            <PrimaryButton type="submit" className="justify-center py-2.5 sm:w-auto w-full" disabled={processing}>
                                {processing ? (
                                    <><Icon name="spinner" className="w-5 h-5 mr-2" /> Menyimpan...</>
                                ) : (
                                    <><Icon name="save" className="w-5 h-5 mr-2" /> Simpan Data</>
                                )}
                            </PrimaryButton>
                            {/* Disesuaikan dengan route ustadz.index di web.php */}
                            <Link href={route('ustadz.index')} className="w-full sm:w-auto">
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