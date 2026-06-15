import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Components/Layouts/AdminLayout';
import InputError from '@/Components/InputError';

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
                <div className="flex items-center gap-4">
                    <Link href={route('admin.santri.index')} className="text-green-600 hover:text-green-800">← Kembali</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Santri Baru</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">NIS</label>
                                <input type="text" value={data.nis} onChange={e => setData('nis', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Nomor Induk Santri" />
                                <InputError message={errors.nis} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                                <input type="text" value={data.nama} onChange={e => setData('nama', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Nama santri" />
                                <InputError message={errors.nama} className="mt-1" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin</label>
                                <select value={data.jenis_kelamin} onChange={e => setData('jenis_kelamin', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                                <InputError message={errors.jenis_kelamin} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir</label>
                                <input type="date" value={data.tanggal_lahir} onChange={e => setData('tanggal_lahir', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                                <InputError message={errors.tanggal_lahir} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                                <input type="text" value={data.kelas} onChange={e => setData('kelas', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="XII-A" />
                                <InputError message={errors.kelas} className="mt-1" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
                                <input type="text" value={data.program} onChange={e => setData('program', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Tahfiz / Reguler" />
                                <InputError message={errors.program} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                                    <option value="aktif">Aktif</option>
                                    <option value="alumni">Alumni</option>
                                    <option value="keluar">Keluar</option>
                                </select>
                                <InputError message={errors.status} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
                            <textarea value={data.alamat} onChange={e => setData('alamat', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" rows="3" placeholder="Alamat lengkap"></textarea>
                            <InputError message={errors.alamat} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="(opsional)" />
                                <InputError message={errors.email} className="mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Telepon</label>
                                <input type="text" value={data.telepon} onChange={e => setData('telepon', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="(opsional)" />
                                <InputError message={errors.telepon} className="mt-1" />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-lg transition disabled:opacity-50">
                                {processing ? '⏳ Menyimpan...' : '💾 Simpan'}
                            </button>
                            <Link href={route('admin.santri.index')} className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-8 rounded-lg transition">❌ Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
