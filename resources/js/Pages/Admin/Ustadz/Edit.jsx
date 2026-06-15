import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function UstadzEdit({ ustadz }) {
    const { data, setData, put, processing, errors } = useForm({
        name: ustadz.name || '',
        email: ustadz.email || '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.ustadz.update', ustadz.id));
    };

    return (
        <AdminLayout>
            <Head title="Edit Ustadz" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('admin.ustadz.index')} className="text-emerald-600 hover:text-emerald-800 font-semibold transition-colors" aria-label="Kembali ke Daftar Ustadz">← Kembali</Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Edit Data Ustadz</h1>
                </div>

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
                        <div>
                            <InputLabel htmlFor="password">
                                Password <span className="text-gray-400 font-normal ml-1">(kosongkan jika tidak diubah)</span>
                            </InputLabel>
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
                                {processing ? '⏳ Menyimpan...' : '💾 Update Data'}
                            </PrimaryButton>
                            <Link href={route('admin.ustadz.index')} className="w-full sm:w-auto">
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
