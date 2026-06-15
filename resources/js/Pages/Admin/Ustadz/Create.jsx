import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';

export default function UstadzCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.ustadz.store'));
    };

    return (
        <AdminLayout>
            <Head title="Tambah Ustadz" />
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.ustadz.index')} className="text-blue-600 hover:text-blue-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Ustadz Baru</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" placeholder="Masukkan nama ustadz" />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" placeholder="Email ustadz" />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" placeholder="Minimal 8 karakter" />
                            <InputError message={errors.password} className="mt-1" />
                        </div>
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg transition disabled:opacity-50">
                                {processing ? '⏳ Menyimpan...' : '💾 Simpan'}
                            </button>
                            <Link href={route('admin.ustadz.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg transition">❌ Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
